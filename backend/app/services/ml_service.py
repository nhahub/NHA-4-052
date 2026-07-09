import json
import logging
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics.pairwise import euclidean_distances

logger = logging.getLogger(__name__)

class MLService:
    """Singleton service to handle loading models and ML inference."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Load ML models, scalers, label encoders, and dataset."""
        logger.info("Initializing ML models and loading dataset...")
        
        ml_dir = Path(__file__).parent.parent / "ml"
        
        # Load Metadata
        try:
            with open(ml_dir / "metadata.json", "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            self.feature_names = self.metadata.get("feature_names", self.metadata.get("feature_columns", []))
        except Exception as e:
            logger.error(f"Failed to load metadata.json: {e}")
            raise

        if not self.feature_names:
            raise ValueError("ML metadata must define feature_names or feature_columns.")

        # Load models
        try:
            self.classifier = joblib.load(ml_dir / "best_meal_classifier.pkl")
            self.scaler = joblib.load(ml_dir / "feature_scaler.pkl")
            self.label_encoder = joblib.load(ml_dir / "label_encoder.pkl")
            self.recommender = joblib.load(ml_dir / "food_recommender.pkl")
        except Exception as e:
            logger.error(f"Failed to load ML models: {e}")
            raise

        # Load dataset
        try:
            self.dataset = pd.read_csv(ml_dir / "CaloriX_Nutrition_Dataset_Clean.csv")
            self.dataset = self._augment_dataset_features(self.dataset)

            # Pre-scale the dataset features for faster similarity search
            if not self.dataset.empty:
                feature_columns = list(self.scaler["numeric_features"]) + list(self.scaler["categorical_features"])
                features_df = self.dataset[feature_columns].fillna({"category": "Unknown", "cuisine": "Unknown"}).fillna(0)
                self.scaled_dataset_features = self.scaler["preprocessor"].transform(features_df)
            else:
                self.scaled_dataset_features = np.array([])
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            raise
            
        logger.info("ML Service initialized successfully.")

    def _ensure_bool(self, value) -> bool:
        if isinstance(value, str):
            return value.strip().lower() in ("true", "1", "yes", "y")
        return bool(value)

    def _to_python_primitive(self, value):
        if isinstance(value, np.generic):
            return value.item()
        if isinstance(value, (np.ndarray,)):
            return value.tolist()
        if isinstance(value, dict):
            return {k: self._to_python_primitive(v) for k, v in value.items()}
        if isinstance(value, (list, tuple)):
            return [self._to_python_primitive(v) for v in value]
        return value

    def _augment_dataset_features(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            return df

        data = df.copy()
        data["serving_size_g"] = pd.to_numeric(data.get("serving_size_g", 0), errors="coerce").fillna(0.0)
        data["calories"] = pd.to_numeric(data.get("calories", 0), errors="coerce").fillna(0.0)
        data["protein_g"] = pd.to_numeric(data.get("protein_g", 0), errors="coerce").fillna(0.0)
        data["carbs_g"] = pd.to_numeric(data.get("carbs_g", 0), errors="coerce").fillna(0.0)
        data["fat_g"] = pd.to_numeric(data.get("fat_g", 0), errors="coerce").fillna(0.0)

        size = data["serving_size_g"].replace({0.0: np.nan})
        data["protein_density"] = (data["protein_g"] / size).fillna(0.0)
        data["fat_density"] = (data["fat_g"] / size).fillna(0.0)
        data["carb_density"] = (data["carbs_g"] / size).fillna(0.0)
        data["calorie_density"] = (data["calories"] / size).fillna(0.0)

        data["protein_ratio"] = (data["protein_g"] / data["calories"]).replace([np.inf, -np.inf], np.nan).fillna(0.0)
        data["fat_ratio"] = (data["fat_g"] / data["calories"]).replace([np.inf, -np.inf], np.nan).fillna(0.0)
        data["carb_ratio"] = (data["carbs_g"] / data["calories"]).replace([np.inf, -np.inf], np.nan).fillna(0.0)

        total_macro = data["protein_g"] + data["carbs_g"] + data["fat_g"]
        data["energy_density"] = (data["calories"] / total_macro).replace([np.inf, -np.inf], np.nan).fillna(0.0)

        for bool_col in ["is_vegan", "is_vegetarian", "is_halal"]:
            if bool_col in data.columns:
                data[bool_col] = data[bool_col].fillna(False)
            else:
                data[bool_col] = False

        return data

    def _prepare_features(self, features_dict: dict) -> pd.DataFrame:
        row = {}
        for feature in self.feature_names:
            if feature in {"category", "cuisine"}:
                row[feature] = features_dict.get(feature, None)
            elif feature in {"is_vegan", "is_vegetarian", "is_halal"}:
                row[feature] = self._ensure_bool(features_dict.get(feature, False))
            else:
                value = features_dict.get(feature, 0.0)
                row[feature] = float(value) if value not in (None, "") else 0.0

        # Derived nutrition features
        row["protein_density"] = row["protein_g"] / row["serving_size_g"] if row["serving_size_g"] else 0.0
        row["fat_density"] = row["fat_g"] / row["serving_size_g"] if row["serving_size_g"] else 0.0
        row["carb_density"] = row["carbs_g"] / row["serving_size_g"] if row["serving_size_g"] else 0.0
        row["calorie_density"] = row["calories"] / row["serving_size_g"] if row["serving_size_g"] else 0.0
        row["protein_ratio"] = row["protein_g"] / row["calories"] if row["calories"] else 0.0
        row["fat_ratio"] = row["fat_g"] / row["calories"] if row["calories"] else 0.0
        row["carb_ratio"] = row["carbs_g"] / row["calories"] if row["calories"] else 0.0
        total_macro = row["protein_g"] + row["carbs_g"] + row["fat_g"]
        row["energy_density"] = row["calories"] / total_macro if total_macro else 0.0

        return pd.DataFrame([row], columns=self.feature_names)

    def predict(self, features_dict: dict) -> str:
        """Predict food category based on features."""
        feature_df = self._prepare_features(features_dict)
        prediction = self.classifier.predict(feature_df)[0]
        if isinstance(prediction, (int, np.integer)):
            prediction = self.label_encoder.inverse_transform([prediction])[0]
        return str(prediction)

    def get_similar_foods(self, features_dict: dict, top_k: int = 5) -> list:
        """Find the top K most similar foods in the dataset."""
        if self.dataset.empty or not hasattr(self, "recommender"):
            return []

        feature_df = self._prepare_features(features_dict)
        feature_row = feature_df.iloc[0]
        numeric_values = np.array(
            [float(feature_row.get(col, 0.0)) for col in self.recommender["numeric_columns"]],
            dtype=float,
        ).reshape(1, -1)

        text_value = " ".join(
            [
                str(feature_row.get("food_name", "")),
                str(feature_row.get("category", "")),
                str(feature_row.get("cuisine", "")),
            ]
        ).strip()
        if not text_value:
            text_value = f"{feature_row.get('category', '')} {feature_row.get('cuisine', '')}".strip()

        try:
            text_vector = self.recommender["tfidf"].transform([text_value]).toarray()
            query_vector = np.hstack([numeric_values, text_vector])
            n_neighbors = min(top_k + 1, len(self.recommender["food_frame"]))
            distances, indices = self.recommender["nn_model"].kneighbors(query_vector, n_neighbors=n_neighbors)
        except Exception as e:
            logger.warning(f"Food recommender fallback activated: {e}")
            return []

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            row = self.recommender["food_frame"].iloc[idx]
            food_name = row.get("food_name", None)
            category = row.get("category", None)

            result_features = {}
            for col in self.recommender["numeric_columns"]:
                if col in row:
                    value = row[col]
                    if pd.isna(value):
                        value = 0.0
                    result_features[col] = float(self._to_python_primitive(value))
            for text_col in ["category", "cuisine", "is_vegan", "is_vegetarian", "is_halal"]:
                if text_col in row:
                    result_features[text_col] = self._to_python_primitive(row[text_col])

            results.append({
                "food_name": str(food_name) if food_name is not None else "",
                "distance": float(dist),
                "category": str(category) if category else None,
                "features": result_features,
            })

        return results

    def search_foods(self, query: str, limit: int = 10) -> list:
        """Search foods by name in the dataset."""
        if self.dataset.empty or not query:
            return []

        mask = self.dataset["food_name"].str.contains(query, case=False, na=False)
        matches = self.dataset[mask].head(limit)
        
        results = []
        for _, row in matches.iterrows():
            results.append({
                "food_name": str(row.get("food_name", "")),
                "category": str(row.get("category", "")),
                "calories": float(row.get("calories", 0)),
                "protein_g": float(row.get("protein_g", 0)),
                "carbs_g": float(row.get("carbs_g", 0)),
                "fat_g": float(row.get("fat_g", 0)),
                "serving_size_g": float(row.get("serving_size_g", 0)),
            })
        return results

# Instantiate the singleton instance so it's loaded upon import
ml_service = MLService()

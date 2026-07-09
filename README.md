# 🔥 CaloriX

<p align="center">
  <h3 align="center">AI-Powered Calorie Tracking & Nutrition Assistant</h3>

  <p align="center">
    Track smarter. Live healthier.
    <br />
    Personalized nutrition tracking powered by ML and AI.
  </p>
</p>

---

## 📌 Overview

CaloriX is a full-stack web application for intelligent calorie tracking and nutrition management. It combines traditional calorie counting with machine learning models for meal classification and food recommendations, plus AI-powered features for meal suggestions and food image analysis.

**Key Capabilities:**
- User authentication and personalized nutrition tracking
- ML-powered food search with 24,000+ foods
- Meal type prediction (Breakfast/Lunch/Dinner/Snack)
- Content-based food recommendation system
- AI Vision for food image analysis and nutrition estimation
- AI Coach for personalized nutrition guidance
- Comprehensive nutrition metrics and analytics

---

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication with access tokens
- Secure password hashing (bcrypt)
- User registration and login
- Protected API routes
- Session management

### 📊 User Profile & Goal Setting
- User profile creation with personal metrics
- Automatic BMR (Basal Metabolic Rate) calculation
- TDEE (Total Daily Energy Expenditure) calculation
- Fitness goal selection (Weight Loss, Maintenance, Muscle Gain)
- Personalized daily calorie targets
- Macro distribution targets

### 🍽️ Meal Tracker
- Log meals and food items
- Track daily nutrition intake
- View daily summary of consumed calories and macros
- Date-based meal history
- Real-time macro tracking (Protein, Carbs, Fat)

### 🤖 ML-Powered Food Intelligence
- **Food Search**: Search from 24,000+ foods in cleaned nutrition database
- **Autocomplete**: Real-time food name suggestions
- **Meal Type Prediction**: AI classifies meals as Breakfast, Lunch, Dinner, or Snack
- **Smart Recommendations**: Similar food suggestions based on nutritional content

### 🎯 AI Features

#### AI Vision
- Upload food images for analysis
- Google Gemini Vision extracts food items and ingredients
- Automatic nutrition estimation (calories, protein, carbs, fat)
- Meal type prediction from image
- Add analyzed meals directly to tracker

#### AI Coach
- Chat-based nutrition assistant powered by Google Gemini
- Context-aware responses about logged meals
- Personalized nutrition guidance
- Multiple chat sessions
- Session history management

### 📈 Metrics & Analytics
- 7-day, 30-day, and 90-day nutrition trends
- Daily macro compliance tracking
- Calorie target adherence
- Historical nutrition data
- Visual progress tracking

---

## 🧠 Machine Learning Pipeline

CaloriX uses a production-ready ML pipeline with the following components:

### Dataset
- **CaloriX_Nutrition_Dataset_Clean.csv**: 24,000 food records with comprehensive nutritional information
- Cleaned and validated nutrition data
- 22 raw nutritional features per food item
- Categorical attributes: food_name, category, cuisine
- Boolean attributes: is_vegan, is_vegetarian, is_halal

### Feature Engineering
The ML pipeline automatically computes **8 derived features** from raw nutrition values:

| Feature | Purpose |
|---------|---------|
| `protein_density` | Protein per gram of serving |
| `fat_density` | Fat per gram of serving |
| `carb_density` | Carbs per gram of serving |
| `calorie_density` | Calories per gram of serving |
| `protein_ratio` | Protein-to-calorie ratio |
| `fat_ratio` | Fat-to-calorie ratio |
| `carb_ratio` | Carb-to-calorie ratio |
| `energy_density` | Overall energy density |

**Total Features**: 34 (22 raw + 8 derived + 4 categorical)

### Meal Type Classifier

| Attribute | Value |
|-----------|-------|
| **Type** | RandomForestClassifier |
| **Estimators** | 120 trees |
| **Input Features** | 34 (nutrition + categorical) |
| **Output Classes** | Breakfast, Lunch, Dinner, Snack |
| **File** | `best_meal_classifier.pkl` |

### Food Recommender

| Attribute | Details |
|-----------|---------|
| **Type** | Content-Based with NearestNeighbors |
| **Numeric Features** | 19 columns (calories, macros, minerals, vitamins) |
| **Text Features** | TF-IDF on food_name, category, cuisine |
| **Similarity** | Hybrid (Euclidean + TF-IDF cosine) |
| **Size** | ~59 MB (optimized, was 4.5 GB) |
| **Optimization** | Compact nearest-neighbor without large similarity matrix |
| **File** | `food_recommender.pkl` |

### ML Artifacts

| File | Purpose |
|------|---------|
| `best_meal_classifier.pkl` | Serialized RandomForest meal classifier |
| `food_recommender.pkl` | Serialized food recommendation model |
| `feature_scaler.pkl` | ColumnTransformer for preprocessing |
| `label_encoder.pkl` | LabelEncoder for meal types |
| `metadata.json` | Feature names, dataset info, metrics |
| `CaloriX_Nutrition_Dataset_Clean.csv` | Nutrition database (24,000 foods) |

---

## 🤖 AI Features

### AI Vision (Gemini)
Analyze food images using Google Gemini Vision API:
- **Functionality**: Detect food items, ingredients, and nutritional content from images
- **Output**: Estimated calories, protein, carbs, fat, and predicted meal type
- **Direct Integration**: Add analyzed meals directly to Meal Tracker
- **Specifications**: Max 10MB, formats: JPEG, PNG, WebP, HEIC

**Endpoint**: `POST /api/v1/ai/analyze-image`

### AI Coach (Gemini)
Personalized nutrition guidance through conversational AI:
- **Functionality**: Context-aware responses about meals and nutrition
- **Context**: Accesses user's meal history and nutritional goals
- **Sessions**: Maintain multiple independent chat conversations
- **Features**: Meal suggestions, dietary advice, goal tracking assistance

**Endpoints**:
- `GET /api/v1/ai-chat/sessions` - List all chat sessions
- `POST /api/v1/ai-chat/sessions` - Create new session
- `GET /api/v1/ai-chat/sessions/{id}` - Get session with history
- `POST /api/v1/ai-chat/sessions/{id}/message` - Send message to AI Coach
- `DELETE /api/v1/ai-chat/sessions/{id}` - Delete session
- `PUT /api/v1/ai-chat/sessions/{id}/title` - Update session title

---

## 🛠 Technologies

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| TailwindCSS | Utility-first styling |
| Axios | HTTP client |
| React Router DOM | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | Web framework |
| SQLAlchemy | ORM |
| Pydantic v2 | Data validation |
| python-jose | JWT tokens |
| bcrypt | Password hashing |

### Machine Learning
| Technology | Purpose |
|-----------|---------|
| scikit-learn | ML models (RandomForest, NearestNeighbors, preprocessing) |
| pandas | Data manipulation and analysis |
| numpy | Numerical computations |
| joblib | Model serialization |

### Database
| Technology | Purpose |
|-----------|---------|
| SQLite | Persistent data storage |
| SQLAlchemy | Database abstraction |

### AI APIs
| Service | Purpose |
|---------|---------|
| Google Gemini API | LLM for AI Coach |
| Google Gemini Vision | Image analysis for AI Vision |

---

## 📁 Project Structure

```
CaloriX/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── router.py                 # Main router configuration
│   │   │   └── v1/                       # API v1 routes
│   │   │       ├── auth.py               # Authentication endpoints
│   │   │       ├── profile.py            # User profile endpoints
│   │   │       ├── meals.py              # Meal tracking endpoints
│   │   │       ├── ml.py                 # ML endpoints (predict, search, recommend)
│   │   │       ├── ai.py                 # AI Vision endpoints
│   │   │       ├── ai_chat.py            # AI Coach endpoints
│   │   │       ├── metrics.py            # Analytics endpoints
│   │   │       └── health.py             # Health check endpoint
│   │   │
│   │   ├── services/                     # Business logic layer
│   │   │   ├── ml_service.py             # ML model inference
│   │   │   ├── ai_service.py             # Gemini integration
│   │   │   ├── chat_service.py           # Chat management
│   │   │   ├── meal_service.py           # Meal operations
│   │   │   ├── metrics_service.py        # Analytics computation
│   │   │   ├── user_service.py           # User operations
│   │   │   └── profile_service.py        # Profile operations
│   │   │
│   │   ├── models/                       # Database models
│   │   │   ├── user.py                   # User model
│   │   │   ├── user_profile.py           # UserProfile model
│   │   │   ├── meal.py                   # Meal model
│   │   │   └── chat.py                   # ChatSession, ChatMessage models
│   │   │
│   │   ├── schemas/                      # Pydantic request/response models
│   │   ├── auth/                         # Authentication logic
│   │   ├── core/                         # Configuration
│   │   ├── database/                     # Database session
│   │   ├── utils/                        # Utility functions
│   │   └── ml/                           # ML artifacts
│   │       ├── best_meal_classifier.pkl
│   │       ├── food_recommender.pkl
│   │       ├── feature_scaler.pkl
│   │       ├── label_encoder.pkl
│   │       ├── metadata.json
│   │       └── CaloriX_Nutrition_Dataset_Clean.csv
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/                        # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MealTracker.jsx
│   │   │   ├── AIAssistant.jsx           # AI Vision
│   │   │   ├── AIChat.jsx                # AI Coach
│   │   │   ├── Metrics.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── components/                   # Reusable components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── GuestRoute.jsx
│   │   │   └── ai/                       # AI component utilities
│   │   │
│   │   ├── services/                     # API client services
│   │   │   ├── api.js                    # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── mealService.js
│   │   │   ├── mlService.js              # ML API calls
│   │   │   ├── aiService.js              # AI Vision API calls
│   │   │   ├── aiChatService.js          # AI Coach API calls
│   │   │   └── metricsService.js
│   │   │
│   │   ├── context/                      # React Context
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/                        # Custom React hooks
│   │   ├── layouts/                      # Layout components
│   │   └── App.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- pip
- npm

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file:**
   ```env
   APP_NAME=CaloriX
   APP_VERSION=1.0.0
   DEBUG=true
   
   # Database
   DATABASE_URL=sqlite:///./calorixx.db
   
   # JWT
   SECRET_KEY=your-secret-key-here-change-in-production
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # CORS
   CORS_ORIGINS=["http://localhost:5173"]
   
   # Gemini API
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (if needed):**
   ```env
   VITE_API_URL=http://localhost:8001/api/v1
   ```

---

## ▶️ Running the Project

### Start Backend

From `backend/` directory with virtual environment activated:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Backend will be available at: `http://127.0.0.1:8001`

**API Documentation**: `http://127.0.0.1:8001/docs`

### Start Frontend

From `frontend/` directory:

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🤝 API Endpoints

### Authentication
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login user
POST   /api/v1/auth/refresh           # Refresh JWT token
```

### User Profile
```
GET    /api/v1/profile                # Get user profile
POST   /api/v1/profile                # Create profile
PUT    /api/v1/profile                # Update profile
```

### Meals
```
GET    /api/v1/meals                  # Get user's meals
POST   /api/v1/meals                  # Create meal entry
DELETE /api/v1/meals/{id}             # Delete meal
```

### ML Services
```
POST   /api/v1/ml/predict             # Predict meal type
POST   /api/v1/ml/similar-foods       # Get food recommendations
GET    /api/v1/ml/foods               # Search foods by name
```

### AI Services
```
POST   /api/v1/ai/suggest-meals       # Generate meal suggestions
POST   /api/v1/ai/analyze-image       # Analyze food image
```

### AI Coach
```
GET    /api/v1/ai-chat/sessions       # List chat sessions
POST   /api/v1/ai-chat/sessions       # Create session
GET    /api/v1/ai-chat/sessions/{id}  # Get session with history
POST   /api/v1/ai-chat/sessions/{id}/message  # Send message
DELETE /api/v1/ai-chat/sessions/{id}  # Delete session
PUT    /api/v1/ai-chat/sessions/{id}/title    # Update title
```

### Metrics
```
GET    /api/v1/metrics?range=7D       # Get nutrition metrics
                        (7D, 30D, 90D)
```

---

## 🎯 Improvements Made During Development

### ML Pipeline Enhancements
- ✅ Cleaned nutrition dataset (24,000 foods) with comprehensive validation
- ✅ Implemented feature engineering pipeline (8 derived features)
- ✅ Developed production-ready ML model comparison framework
- ✅ Created automated best model selection based on validation metrics
- ✅ Reduced recommender model size from ~4.5 GB to ~59 MB through optimization
- ✅ Removed recommender target leakage and improved recommendation quality
- ✅ Implemented compact nearest-neighbor approach without huge similarity matrices

### Backend & Integration
- ✅ Fixed Pydantic v2 compatibility issues with dynamic schema generation
- ✅ Implemented numpy-to-Python type conversion for proper JSON serialization
- ✅ Integrated ML models with FastAPI endpoints for inference
- ✅ Added derived feature computation in production service layer
- ✅ Created proper error handling and logging throughout ML pipeline

### Frontend & API Configuration
- ✅ Configured frontend to connect to backend at correct URL (http://localhost:8001)
- ✅ Implemented JWT token handling and authentication flow
- ✅ Created food search with real-time autocomplete
- ✅ Built meal prediction display with AI results
- ✅ Integrated food recommendations UI with similar-foods endpoint
- ✅ Added AI Vision image upload and analysis
- ✅ Implemented AI Coach chat interface with session management

---

## 🔮 Known Limitations

1. **Food Recommendations**
   - Current implementation uses content-based filtering (numeric + text features)
   - Could be improved with hybrid approaches using embedding-based similarity
   - User collaborative filtering not yet implemented

2. **AI Vision Accuracy**
   - Nutrition estimation accuracy depends on Gemini Vision capabilities
   - Complex mixed dishes may have less accurate component breakdown
   - Single image analysis without multi-angle support

3. **ML Model Updates**
   - Models are currently static (trained once, deployed as-is)
   - No online learning or model retraining pipeline
   - Feature engineering is manual, not adaptive

---

## 🚀 Future Improvements

1. **ML Enhancements**
   - Implement user feedback loop for recommendation refinement
   - Add collaborative filtering for personalized recommendations
   - Deploy embedding-based similarity for hybrid recommendations
   - Create model retraining pipeline with new data
   - Add A/B testing framework for model comparison

2. **AI Features**
   - Meal planning with multi-day optimization
   - Nutritionist-approved meal suggestions
   - Dietary restriction support (allergen avoidance, preferences)
   - Barcode scanning for instant food addition
   - OCR for nutrition label extraction

3. **Frontend/UX**
   - Mobile-responsive design improvements
   - Progressive Web App (PWA) support
   - Offline mode with data sync
   - Advanced data visualization and charts
   - Export meal history and reports

4. **Backend/Infrastructure**
   - Database migration to PostgreSQL for production
   - Redis caching for performance optimization
   - API rate limiting and throttling
   - Monitoring and alerting system
   - CI/CD pipeline with automated testing

5. **Analytics**
   - Social features (share meals, compare nutrition with friends)
   - Achievement system and progress milestones
   - Nutrition insights and personalized reports
   - Trend analysis and predictive recommendations

---

## 👨‍💻 Author

**Mohamed Alaa**

GitHub: https://github.com/MohameedAlaa

**Ahmed Essam**

GitHub: https://github.com/ahmed3ssam0

**Abanoub Nasif**

GitHub: https://github.com/BeboNasif

**Yousif Mohamed**

GitHub: https://github.com/yousif-mohamed1

**Rahma Mourad**

GitHub: https://github.com/Rahmamouradsayed

---

## 📄 License

MIT License

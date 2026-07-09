import { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function ImageAnalyzerCard({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mealType, setMealType] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onAnalyze(file, mealType || undefined);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
          dragActive
            ? "border-primary-500 bg-primary-500/10"
            : preview
            ? "border-[var(--cx-border)] bg-[var(--cx-surface-elevated)]"
            : "border-[var(--cx-border)] bg-[var(--cx-surface-elevated)] hover:border-primary-500/50 hover:bg-[var(--cx-surface-elevated)]/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />

        {preview ? (
          <div className="relative w-full overflow-hidden rounded-xl h-[300px]">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <button
              onClick={handleClear}
              className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label="Remove image"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-3 text-sm font-medium text-white drop-shadow-md">
              {file.name}
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center p-8 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-4 rounded-full bg-primary-500/10 p-4 text-primary-400">
              <Upload size={32} />
            </div>
            <p className="mb-1 text-sm font-medium text-[var(--cx-text)]">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-[var(--cx-text-muted)]">
              JPEG, PNG, WebP or HEIC (max. 5MB)
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]">
            Meal Type (Optional)
          </label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="cx-input !py-2.5 w-full"
          >
            <option value="">Auto-detect</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !file}
          className="cx-btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50 !py-3"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analyzing food…
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Analyze Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}

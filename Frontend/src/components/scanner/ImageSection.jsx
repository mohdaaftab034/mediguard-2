import React, { useState, useCallback } from 'react';
import { Upload, X, Search, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ImageSection = ({ onAnalyze, isAnalyzing, hasAnalyzed }) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative aspect-video lg:aspect-auto lg:min-h-[350px] py-6 rounded-3xl border border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
          isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border-color bg-bg-primary/50 hover:border-primary/50'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Medicine" className="w-full h-full object-contain p-2" />
            <button 
              type="button"
              onClick={() => { setPreview(null); setSelectedFile(null); }}
              className="absolute top-4 right-4 p-2 bg-red-500/80 rounded-xl text-white shadow-xl hover:scale-110 transition-transform backdrop-blur-md"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <label className="group flex flex-col items-center gap-1 cursor-pointer p-4 text-center w-full h-full justify-center">
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileSelect(e.target.files[0])} 
            />
            <div className="mb-4 relative group-hover:scale-110 transition-transform duration-300">
              <img src="/agent-avatar.png" alt="Agent Avatar" className="w-36 h-36 object-contain mx-auto drop-shadow-[0_0_15px_rgba(0,180,216,0.3)]" />
              <div className="absolute bottom-2 right-4 w-4 h-4 bg-success rounded-full border-2 border-bg-secondary shadow-[0_0_10px_rgba(6,214,160,0.5)] animate-pulse" />
            </div>
            <p className="text-base font-bold text-text-primary tracking-wide">Drag & Drop Packaging Image</p>
            <p className="text-sm text-text-secondary">or click to browse from your device</p>
            
            <div className="flex items-center gap-4 w-1/2 mx-auto my-2">
              <div className="h-px bg-border-color flex-1"></div>
              <span className="text-[10px] text-text-secondary font-bold tracking-widest opacity-70">OR</span>
              <div className="h-px bg-border-color flex-1"></div>
            </div>

            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); document.querySelector('input[type="file"]').click(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary text-text-primary text-sm font-medium border border-border-color hover:bg-bg-secondary transition-colors"
            >
              <ImageIcon size={16} /> Use Device Camera
            </button>
          </label>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAnalyze(selectedFile)}
        disabled={!selectedFile || isAnalyzing}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-white ${
          !selectedFile || isAnalyzing
            ? 'bg-bg-primary text-text-secondary cursor-not-allowed border border-border-color'
            : 'bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)] hover:scale-[1.02] active:scale-95'
        }`}
      >
        {isAnalyzing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            {hasAnalyzed ? 'Re-analyze' : 'Analyze Medicine'}
          </>
        )}
      </button>

      {hasAnalyzed && selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-center"
        >
          <p className="text-sm text-primary font-medium">
            You have uploaded a new image. Click Analyze to start a fresh analysis.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ImageSection;

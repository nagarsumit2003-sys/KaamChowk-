import React, { useRef, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

// Helper to compress images for LocalStorage
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Resize to max 300px width to save LocalStorage space
        const maxWidth = 300; 
        const scale = maxWidth / img.width;
        
        // If image is smaller than max, don't scale up
        const finalScale = scale < 1 ? scale : 1;
        
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality JPEG
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

// Reusable Image Upload Component
export const ImageUpload: React.FC<{ 
  image: string; 
  onUpload: (base64: string) => void; 
  label?: string 
}> = ({ image, onUpload, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await compressImage(e.target.files[0]);
        onUpload(base64);
      } catch (err) {
        alert("Error uploading image");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {label && <span className="text-sm font-semibold text-slate-600">{label}</span>}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50 cursor-pointer flex items-center justify-center overflow-hidden transition-all bg-white relative group"
      >
        {image ? (
          <img src={image} className="w-full h-full object-cover" alt="Uploaded" />
        ) : (
          <span className="text-3xl text-slate-300 group-hover:text-sky-400">📷</span>
        )}
        <div className="absolute bottom-0 w-full bg-slate-900 bg-opacity-60 text-white text-[9px] text-center py-1 backdrop-blur-sm">
          {image ? 'Change' : 'Upload'}
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

// --- IMPROVED COMPONENT: Text-to-Speech Button ---
export const TextToSpeech: React.FC<{ text: string; lang: Language }> = ({ text, lang }) => {
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    // Attempt to preload voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'hi') {
        const hindiVoice = voices.find(v => v.lang.includes('hi'));
        if (hindiVoice) setVoice(hindiVoice);
      } else {
        const englishVoice = voices.find(v => v.lang.includes('en'));
        if (englishVoice) setVoice(englishVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [lang]);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking parent card
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Prefer the found voice object, fallback to lang code
    if (voice) {
      utterance.voice = voice;
    }
    
    // Explicitly set lang code as fallback
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setSpeaking(false);
    
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button 
      onClick={speak}
      className={`p-2.5 rounded-full transition-all flex items-center justify-center ${speaking ? 'bg-sky-600 text-white ring-2 ring-sky-200' : 'bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-600'}`}
      title="Listen"
    >
      {speaking ? (
         <span className="text-lg">🔊</span>
      ) : (
         <span className="text-lg">🔈</span>
      )}
    </button>
  );
};

// Professional Buttons - Sleek, no heavy shadows
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' }> = ({ 
  className = '', 
  variant = 'primary', 
  children,
  ...props 
}) => {
  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 border-transparent',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200 border-transparent',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 border-transparent',
    outline: 'bg-transparent border border-sky-600 text-sky-600 hover:bg-sky-50'
  };

  return (
    <button 
      className={`px-5 py-3 rounded-lg font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Sleek Inputs
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: string }> = ({ label, icon, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">{icon}</span>}
      <input 
        className={`w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all bg-white shadow-sm ${icon ? 'pl-11' : ''} ${className}`}
        {...props}
      />
    </div>
  </div>
);

// Card for selecting items (like Skills) - Clean look
export const SelectableCard: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }> = ({ selected, onClick, children, className = '' }) => (
  <div 
    onClick={onClick}
    className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all ${selected ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'} ${className}`}
  >
    {children}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`appearance-none w-full border border-slate-300 rounded-lg px-4 py-3.5 text-base text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-sm ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  </div>
);

export const StarRating: React.FC<{ rating: number; count?: number; size?: 'sm' | 'lg' }> = ({ rating, count, size = 'lg' }) => {
  const stars = Math.round(rating * 10) / 10;
  const textSize = size === 'sm' ? 'text-xs' : 'text-lg';
  const starSize = size === 'sm' ? 'text-sm' : 'text-xl';
  
  return (
    <div className={`flex items-center gap-1 ${textSize} text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-flex`}>
      <span className={starSize}>⭐</span>
      <span>{stars || 'New'}</span>
      {count !== undefined && <span className="text-slate-400 font-normal text-xs ml-1">({count})</span>}
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (l: Language) => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
  userRole?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, lang, setLang, title, showBack, onBack, onLogout, userRole }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 max-w-md mx-auto shadow-xl overflow-hidden relative border-x border-slate-200 text-slate-900 font-sans">
      {/* App Header - Professional Deep Blue */}
      <header className="bg-sky-600 text-white px-4 py-3 sticky top-0 z-20 shadow-lg flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-sky-700 text-sky-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-bold tracking-wide">{title || t.app_name}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="text-xs font-bold bg-sky-700 text-white px-2.5 py-1.5 rounded-md border border-sky-500 hover:bg-sky-800 transition-colors"
            >
              {lang === 'en' ? 'हिन्दी' : 'ENG'}
            </button>
            {userRole && onLogout && (
               <button onClick={onLogout} className="p-1.5 rounded-full bg-sky-700 text-sky-100 hover:bg-sky-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
               </button>
            )}
          </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
        {children}
      </main>
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900 bg-opacity-75 p-0 sm:p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up sm:animate-fade-in max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-slate-500">&times;</button>
        </div>
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
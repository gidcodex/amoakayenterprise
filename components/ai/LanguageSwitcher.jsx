"use client";

import { Languages } from "lucide-react";

const LanguageSwitcher = ({ language, onChange }) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm backdrop-blur-xl">
      <span className="flex h-8 w-8 items-center justify-center rounded-full text-green-700">
        <Languages size={16} />
      </span>

      <button
        type="button"
        onClick={() => onChange("en")}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition sm:text-sm ${
          language === "en"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => onChange("tw")}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition sm:text-sm ${
          language === "tw"
            ? "bg-green-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Twi
      </button>
    </div>
  );
};

export default LanguageSwitcher;
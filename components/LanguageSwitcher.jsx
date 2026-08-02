"use client";

import {
  Check,
  ChevronDown,
  Globe2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher({
  mobile = false,
}) {
  const {
    language,
    languages,
    currentLanguage,
    changeLanguage,
    t,
  } = useLanguage();

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const selectLanguage = (code) => {
    changeLanguage(code);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${
        mobile ? "w-full" : "shrink-0"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t("navbar.language")}
        aria-expanded={open}
        className={`
          flex items-center justify-between gap-2
          rounded-full border border-slate-200
          bg-white font-medium text-slate-700
          shadow-sm transition
          hover:border-green-300
          hover:bg-green-50
          hover:text-green-700
          ${
            mobile
              ? "w-full px-4 py-3"
              : "px-3 py-2.5"
          }
        `}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Globe2
            size={18}
            className="shrink-0 text-green-600"
          />

          <span className="truncate text-sm">
            {currentLanguage.nativeName}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`
            z-[9999] mt-2 overflow-hidden
            rounded-2xl border border-slate-200
            bg-white p-2 shadow-2xl
            ${
              mobile
                ? "relative w-full"
                : "absolute right-0 top-full w-56"
            }
          `}
        >
          <div className="px-3 pb-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              {t("navbar.language")}
            </p>
          </div>

          <div className="space-y-1">
            {languages.map((item) => {
              const selected =
                language === item.code;

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() =>
                    selectLanguage(item.code)
                  }
                  className={`
                    flex w-full items-center
                    justify-between gap-3 rounded-xl
                    px-3 py-2.5 text-left
                    transition
                    ${
                      selected
                        ? "bg-green-50 text-green-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      {item.nativeName}
                    </span>

                    {item.nativeName !== item.name && (
                      <span className="block text-xs text-slate-400">
                        {item.name}
                      </span>
                    )}
                  </span>

                  {selected && (
                    <Check
                      size={17}
                      className="text-green-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
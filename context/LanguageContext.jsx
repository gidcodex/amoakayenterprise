"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { languages, translations } from "@/lib/translations";

const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "amoakay-language";
const COOKIE_NAME = "amoakay-language";

const LanguageContext = createContext(null);

function getNestedValue(object, path) {
  if (!object || !path) return undefined;

  return path.split(".").reduce((current, key) => {
    if (
      current !== null &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return current[key];
    }

    return undefined;
  }, object);
}

function isSupportedLanguage(code) {
  return languages.some((item) => item.code === code);
}

function replacePlaceholders(text, values = {}) {
  if (typeof text !== "string") return text;

  return text.replace(
    /\{\{\s*([\w.-]+)\s*\}\}|\{\s*([\w.-]+)\s*\}/g,
    (match, doubleBraceKey, singleBraceKey) => {
      const key = doubleBraceKey || singleBraceKey;
      const value = getNestedValue(values, key);

      return value === undefined || value === null
        ? match
        : String(value);
    }
  );
}

function normalizeTranslationOptions(fallbackOrValues, suppliedValues) {
  if (typeof fallbackOrValues === "string") {
    return {
      fallbackText: fallbackOrValues,
      values: suppliedValues ?? {},
    };
  }

  if (
    fallbackOrValues &&
    typeof fallbackOrValues === "object" &&
    !Array.isArray(fallbackOrValues)
  ) {
    return {
      fallbackText: undefined,
      values: fallbackOrValues,
    };
  }

  return {
    fallbackText: undefined,
    values: suppliedValues ?? {},
  };
}

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}) {
  const safeInitialLanguage = isSupportedLanguage(initialLanguage)
    ? initialLanguage
    : DEFAULT_LANGUAGE;

  const [language, setLanguageState] = useState(safeInitialLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

      if (savedLanguage && isSupportedLanguage(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error("Unable to read saved language:", error);
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";

    try {
      window.localStorage.setItem(STORAGE_KEY, language);

      const secure =
        window.location.protocol === "https:" ? "; Secure" : "";

      document.cookie =
        `${COOKIE_NAME}=${encodeURIComponent(language)}` +
        `; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    } catch (error) {
      console.error("Unable to save selected language:", error);
    }
  }, [language, mounted]);

  const changeLanguage = useCallback((newLanguage) => {
    if (!isSupportedLanguage(newLanguage)) {
      console.warn(`Unsupported language requested: ${newLanguage}`);
      return false;
    }

    setLanguageState(newLanguage);
    return true;
  }, []);

  const t = useCallback(
    (key, fallbackOrValues, suppliedValues) => {
      const { fallbackText, values } = normalizeTranslationOptions(
        fallbackOrValues,
        suppliedValues
      );

      const selectedValue = getNestedValue(
        translations[language],
        key
      );

      const englishValue = getNestedValue(
        translations[DEFAULT_LANGUAGE],
        key
      );

      let resolvedValue;

      if (typeof selectedValue === "string" && selectedValue.trim()) {
        resolvedValue = selectedValue;
      } else if (
        typeof englishValue === "string" &&
        englishValue.trim()
      ) {
        resolvedValue = englishValue;
      } else {
        resolvedValue = fallbackText ?? key;

        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Missing translation: "${key}" for language "${language}"`
          );
        }
      }

      if (typeof resolvedValue !== "string") {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Translation key "${key}" does not resolve to a string.`
          );
        }

        return fallbackText ?? key;
      }

      return replacePlaceholders(resolvedValue, values);
    },
    [language]
  );

  const currentLanguage = useMemo(
    () =>
      languages.find((item) => item.code === language) ??
      languages.find((item) => item.code === DEFAULT_LANGUAGE) ??
      languages[0],
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      currentLanguage,
      languages,
      mounted,
      t,
      changeLanguage,
      setLanguage: changeLanguage,
      isSupportedLanguage,
    }),
    [language, currentLanguage, mounted, t, changeLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
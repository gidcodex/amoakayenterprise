import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL,} from "node:url";

import { translateText } from "../lib/khaya.js";
import { finalTextOverrides, sourceTextOverrides,} from "./translation-overrides.mjs";
import {translationGlossary,} from "./translation-glossary.mjs";

import { getTranslationMemoryEntry,loadTranslationMemory, saveTranslationMemoryEntry, writeTranslationMemory,} from "./translation-memory.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const languageMap = {
  tw: "twi",
  ee: "ewe",
  gaa: "gaa",
};

const languageNames = {
  tw: "Twi",
  ee: "Ewe",
  gaa: "Ga",
};

const args = process.argv.slice(2);

const sectionArgument = args.find((arg) =>
  arg.startsWith("--section=")
);

const sectionPath = sectionArgument
  ? sectionArgument.replace("--section=", "").trim()
  : null;

const delayArgument = args.find((arg) =>
  arg.startsWith("--delay=")
);

const requestDelay = delayArgument
  ? Number(delayArgument.replace("--delay=", ""))
  : 250;

const translationFilePath = path.join(
  projectRoot,
  "lib",
  "translations.js"
);

const generatedDirectory = path.join(
  projectRoot,
  "generated"
);

const translationMemoryFilePath = path.join(
  generatedDirectory,
  "translation-memory.json"
);

const sleep = (milliseconds) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

function getValueByPath(object, objectPath) {
  if (!objectPath) {
    return object;
  }

  return objectPath
    .split(".")
    .reduce(
      (current, key) => current?.[key],
      object
    );
}

function setValueByPath(object, objectPath, value) {
  if (!objectPath) {
    return value;
  }

  const keys = objectPath.split(".");
  const lastKey = keys.pop();

  let current = object;

  for (const key of keys) {
    if (
      !current[key] ||
      typeof current[key] !== "object" ||
      Array.isArray(current[key])
    ) {
      current[key] = {};
    }

    current = current[key];
  }

  current[lastKey] = value;

  return object;
}

function shouldTranslate(
  englishValue,
  currentValue,
  siteLanguage
) {
  if (typeof englishValue !== "string") {
    return false;
  }

  /*
   * Regenerate every Ga string so previous experimental
   * translations can be replaced.
   */
  if (siteLanguage === "gaa") {
    return true;
  }

  if (typeof currentValue !== "string") {
    return true;
  }

  if (!currentValue.trim()) {
    return true;
  }

  /*
   * Twi and Ewe are translated only when missing or
   * when the current value is still identical to English.
   */
  return (
    currentValue.trim() === englishValue.trim()
  );
}

function protectPlaceholders(text) {
  const placeholders = [];

  const protectedText = text.replace(
    /(\{\{[^{}]+\}\}|\{[^{}]+\}|\$\{[^{}]+\}|%[sdif])/g,
    (match) => {
      const placeholder =
        `__PLACEHOLDER_${placeholders.length}__`;

      placeholders.push({
        placeholder,
        original: match,
      });

      return placeholder;
    }
  );

  return {
    protectedText,
    placeholders,
  };
}

function restorePlaceholders(
  text,
  placeholders
) {
  let restoredText = text;

  for (const item of placeholders) {
    restoredText = restoredText.replaceAll(
      item.placeholder,
      item.original
    );
  }

  return restoredText;
}

function countStrings(value) {
  if (typeof value === "string") {
    return 1;
  }

  if (!value || typeof value !== "object") {
    return 0;
  }

  return Object.values(value).reduce(
    (total, child) =>
      total + countStrings(child),
    0
  );
}

async function importTranslations() {
  const fileUrl = pathToFileURL(
    translationFilePath
  );

  fileUrl.searchParams.set(
    "updated",
    Date.now().toString()
  );

  const translationModule = await import(
    fileUrl.href
  );

  if (!translationModule.translations) {
    throw new Error(
      "The translations export could not be found in lib/translations.js."
    );
  }

  return translationModule.translations;
}

/**
 * Checks a generated translation for English words that
 * may indicate an incomplete or awkward translation.
 */
function findReviewReasons(translation) {
  const reasons = [];

  const suspiciousEnglishWords = [
    "automatic",
    "automatically",
    "banner",
    "continue",
    "deal",
    "deals",
    "discount",
    "offer",
    "offers",
    "pause",
    "promotion",
    "promotional",
    "resume",
    "shop",
    "slider",
    "special",
    "temporarily",
    "temporarilly",
  ];

  const normalizedWords = translation
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word.replace(
        /[^a-zà-žŋɛɔ̃ãẽĩõũ]+/gi,
        ""
      )
    )
    .filter(Boolean);

  const detectedWords =
    suspiciousEnglishWords.filter((word) =>
      normalizedWords.includes(word)
    );

  if (detectedWords.length > 0) {
    reasons.push(
      `Possible untranslated English words: ${detectedWords.join(
        ", "
      )}`
    );
  }

  if (!translation.trim()) {
    reasons.push(
      "The generated translation is empty."
    );
  }

  return reasons;
}

async function translateString({
  text,
  siteLanguage,
  khayaLanguage,
  currentPath,
  cache,
  qualityReport,
  translationMemory,
}) {
  /*
   * Priority 1:
   * Use an approved recurring glossary term.
   */
  const glossaryTranslation =
    translationGlossary[siteLanguage]?.[text];

 if (
  typeof glossaryTranslation === "string" &&
  glossaryTranslation.trim() !== ""
) {
  qualityReport.glossary.push({
    language: siteLanguage,
    path: currentPath,
    english: text,
    translation: glossaryTranslation,
  });

  saveTranslationMemoryEntry({
    memory: translationMemory,
    language: siteLanguage,
    english: text,
    sourceText: text,
    translation: glossaryTranslation,
    origin: "glossary",
    approved: true,
    path: currentPath,
  });

  console.log(
    `   ${languageNames[siteLanguage]} glossary: "${text}" → "${glossaryTranslation}"`
  );

  return glossaryTranslation;
}

  /*
   * Priority 2:
   * Use an approved exact phrase override.
   */
  const exactOverride =
    finalTextOverrides[siteLanguage]?.[text];

 if (
  typeof exactOverride === "string" &&
  exactOverride.trim() !== ""
) {
  qualityReport.finalOverrides.push({
    language: siteLanguage,
    path: currentPath,
    english: text,
    translation: exactOverride,
  });

  saveTranslationMemoryEntry({
    memory: translationMemory,
    language: siteLanguage,
    english: text,
    sourceText: text,
    translation: exactOverride,
    origin: "finalOverride",
    approved: true,
    path: currentPath,
  });

  console.log(
    `   ${languageNames[siteLanguage]} approved override: "${text}" → "${exactOverride}"`
  );

  return exactOverride;
}

  /*
   * Priority 3:
   * Send clearer English context to GhanaNLP when an
   * original UI phrase is too short or ambiguous.
   */
  const sourceText =
    sourceTextOverrides[siteLanguage]?.[text] ??
    text;

const memoryEntry =
  getTranslationMemoryEntry({
    memory: translationMemory,
    language: siteLanguage,
    english: text,
    sourceText,
  });

if (memoryEntry) {
  qualityReport.memory.push({
    language: siteLanguage,
    path: currentPath,
    english: text,
    sourceText,
    translation: memoryEntry.translation,
    origin: memoryEntry.origin,
    approved: memoryEntry.approved,
  });

  const memoryReviewReasons =
    findReviewReasons(
      memoryEntry.translation
    );

  if (!memoryEntry.approved) {
    memoryReviewReasons.unshift(
      "Translation-memory entry has not yet been approved."
    );
  }

  if (memoryReviewReasons.length > 0) {
    qualityReport.review.push({
      language: siteLanguage,
      path: currentPath,
      english: text,
      sourceText,
      translation:
        memoryEntry.translation,
      reasons: memoryReviewReasons,
      source: "translationMemory",
    });
  }

  console.log(
    `   ${languageNames[siteLanguage]} memory: "${text}" → "${memoryEntry.translation}"${
      memoryEntry.approved
        ? " [approved]"
        : " [review required]"
    }`
  );

  return memoryEntry.translation;
}

  const cacheKey = [
    siteLanguage,
    khayaLanguage,
    text,
    sourceText,
  ].join(":");

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const {
    protectedText,
    placeholders,
  } = protectPlaceholders(sourceText);

  const translatedResponse =
    await translateText(
      protectedText,
      "eng",
      khayaLanguage
    );

  const translatedValue =
    typeof translatedResponse === "string"
      ? translatedResponse
      : String(translatedResponse ?? "");

  const restoredValue = restorePlaceholders(
    translatedValue,
    placeholders
  );

  cache.set(cacheKey, restoredValue);

  saveTranslationMemoryEntry({
  memory: translationMemory,
  language: siteLanguage,
  english: text,
  sourceText,
  translation: restoredValue,
  origin: "ghanaNLP",
  approved: false,
  path: currentPath,
});

  qualityReport.translated.push({
    language: siteLanguage,
    path: currentPath,
    english: text,
    sourceText,
    translation: restoredValue,
  });

  if (sourceText !== text) {
    qualityReport.contextOverrides.push({
      language: siteLanguage,
      path: currentPath,
      english: text,
      sourceText,
      translation: restoredValue,
    });

    console.log(
      `   ${languageNames[siteLanguage]} contextual translation:`
    );
    console.log(
      `      Original: "${text}"`
    );
    console.log(
      `      Sent:     "${sourceText}"`
    );
    console.log(
      `      Result:   "${restoredValue}"`
    );
  } else {
    console.log(
      `   ${languageNames[siteLanguage]}: "${text}" → "${restoredValue}"`
    );
  }

  const reviewReasons =
    findReviewReasons(restoredValue);

  if (reviewReasons.length > 0) {
    qualityReport.review.push({
      language: siteLanguage,
      path: currentPath,
      english: text,
      sourceText,
      translation: restoredValue,
      reasons: reviewReasons,
    });
  }

  await sleep(requestDelay);

  return restoredValue;
}

async function translateObject({
  englishValue,
  currentValue,
  siteLanguage,
  khayaLanguage,
  currentPath,
  report,
  qualityReport,
  cache,
  translationMemory,
}) {
  if (typeof englishValue === "string") {
    if (
      !shouldTranslate(
        englishValue,
        currentValue,
        siteLanguage
      )
    ) {
      report.preserved.push({
        language: siteLanguage,
        path: currentPath,
        value: currentValue,
      });

      return currentValue;
    }

    try {
     const translatedValue =
       await translateString({
       text: englishValue,
       siteLanguage,
       khayaLanguage,
       currentPath,
       cache,
       qualityReport,
       translationMemory,
  });

      report.translated.push({
        language: siteLanguage,
        path: currentPath,
        english: englishValue,
        translation: translatedValue,
      });

      return translatedValue;
    } catch (error) {
      const failure = {
        language: siteLanguage,
        path: currentPath,
        english: englishValue,
        error: error.message,
      };

      report.failed.push(failure);
      qualityReport.failed.push(failure);

      console.error(
        `   Translation failed for ${siteLanguage}.${currentPath}:`,
        error.message
      );

      return currentValue || englishValue;
    }
  }

  if (Array.isArray(englishValue)) {
    const currentArray = Array.isArray(
      currentValue
    )
      ? currentValue
      : [];

    const translatedArray = [];

    for (
      let index = 0;
      index < englishValue.length;
      index += 1
    ) {
      translatedArray[index] =
        await translateObject({
          englishValue: englishValue[index],
          currentValue: currentArray[index],
          siteLanguage,
          khayaLanguage,
          currentPath: `${currentPath}.${index}`,
          report,
          qualityReport,
          cache,
          translationMemory,
        });
    }

    return translatedArray;
  }

  if (
    englishValue &&
    typeof englishValue === "object"
  ) {
    const translatedObject = {
      ...(currentValue &&
      typeof currentValue === "object" &&
      !Array.isArray(currentValue)
        ? currentValue
        : {}),
    };

    for (const [key, childValue] of Object.entries(
      englishValue
    )) {
      const childPath = currentPath
        ? `${currentPath}.${key}`
        : key;

      translatedObject[key] =
        await translateObject({
          englishValue: childValue,
          currentValue: currentValue?.[key],
          siteLanguage,
          khayaLanguage,
          currentPath: childPath,
          report,
          qualityReport,
          cache,
          translationMemory,
        });
    }

    return translatedObject;
  }

  return currentValue ?? englishValue;
}

async function main() {
  console.log(
    "\nAmoakay translation generator\n"
  );

  if (!process.env.KHAYA_API_KEY) {
    throw new Error(
      "KHAYA_API_KEY is missing from your environment file."
    );
  }

  if (!process.env.KHAYA_TRANSLATION_URL) {
    throw new Error(
      "KHAYA_TRANSLATION_URL is missing from your environment file."
    );
  }

 await fs.mkdir(generatedDirectory, {
  recursive: true,
});

const translationMemory =
  await loadTranslationMemory(
    translationMemoryFilePath
  );

  const translations =
    await importTranslations();

  if (!translations.en) {
    throw new Error(
      "The English translations section was not found."
    );
  }

  const englishSource = sectionPath
    ? getValueByPath(
        translations.en,
        sectionPath
      )
    : translations.en;

  if (englishSource === undefined) {
    throw new Error(
      `The section "${sectionPath}" does not exist in translations.en.`
    );
  }

  const result =
    structuredClone(translations);

  const report = {
    generatedAt: new Date().toISOString(),
    section: sectionPath || "all",
    translated: [],
    preserved: [],
    failed: [],
  };

const qualityReport = {
  generatedAt: new Date().toISOString(),
  section: sectionPath || "all",
  translated: [],
  glossary: [],
  contextOverrides: [],
  finalOverrides: [],
  memory: [],
  review: [],
  failed: [],
};

  const cache = new Map();

  console.log(
    `Section: ${
      sectionPath || "all translations"
    }`
  );

  console.log(
    `English strings found: ${countStrings(
      englishSource
    )}\n`
  );

  for (const [
    siteLanguage,
    khayaLanguage,
  ] of Object.entries(languageMap)) {
    console.log(
      `Translating missing ${languageNames[siteLanguage]} values...`
    );

    const currentLanguageSection = sectionPath
      ? getValueByPath(
          result[siteLanguage],
          sectionPath
        )
      : result[siteLanguage];

    const translatedSection =
  await translateObject({
    englishValue: englishSource,
    currentValue:
      currentLanguageSection,
    siteLanguage,
    khayaLanguage,
    currentPath: sectionPath || "",
    report,
    qualityReport,
    cache,
    translationMemory,
  });

    if (sectionPath) {
      setValueByPath(
        result[siteLanguage],
        sectionPath,
        translatedSection
      );
    } else {
      result[siteLanguage] =
        translatedSection;
    }

    console.log("");
  }

  /*
   * Hausa is preserved exactly because it is not
   * currently generated through GhanaNLP.
   */
  result.ha = structuredClone(
    translations.ha
  );

  await fs.mkdir(generatedDirectory, {
    recursive: true,
  });

  const safeSectionName = sectionPath
    ? sectionPath.replaceAll(".", "-")
    : "all";

  const reviewFilePath = path.join(
    generatedDirectory,
    `translations-${safeSectionName}-review.json`
  );

  const reportFilePath = path.join(
    generatedDirectory,
    `translations-${safeSectionName}-report.json`
  );

  const qualityReportFilePath = path.join(
    generatedDirectory,
    `translations-${safeSectionName}-quality-report.json`
  );

  await fs.writeFile(
    reviewFilePath,
    `${JSON.stringify(
      result,
      null,
      2
    )}\n`,
    "utf8"
  );

  await fs.writeFile(
    reportFilePath,
    `${JSON.stringify(
      report,
      null,
      2
    )}\n`,
    "utf8"
  );

  await fs.writeFile(
    qualityReportFilePath,
    `${JSON.stringify(
      qualityReport,
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeTranslationMemory({
  memory: translationMemory,
  memoryFilePath:
    translationMemoryFilePath,
});

  console.log(
    "Translation generation completed.\n"
  );

  console.log(
    `Translated: ${report.translated.length}`
  );

  console.log(
    `Preserved existing translations: ${report.preserved.length}`
  );

  console.log(
    `Failed: ${report.failed.length}`
  );

  console.log(
    "\n=============================="
  );
  console.log(
    "TRANSLATION QUALITY REPORT"
  );
  console.log(
    "=============================="
  );

  console.log(
    `Glossary used: ${qualityReport.glossary.length}`
  );

  console.log(
    `Context overrides: ${qualityReport.contextOverrides.length}`
  );

  console.log(
    `Approved overrides: ${qualityReport.finalOverrides.length}`
  );

  console.log(
  `Translation memory used: ${qualityReport.memory.length}`
);

  console.log(
    `Needs review: ${qualityReport.review.length}`
  );

  if (qualityReport.review.length > 0) {
    console.log("\nItems requiring review:");

    for (const item of qualityReport.review) {
      console.log(
        `\n• ${languageNames[item.language] ?? item.language}: ${item.english}`
      );

      console.log(
        `  Translation: ${item.translation}`
      );

      for (const reason of item.reasons) {
        console.log(
          `  Reason: ${reason}`
        );
      }
    }
  }

  console.log("\nReview file:");
  console.log(
    path.relative(
      projectRoot,
      reviewFilePath
    )
  );

  console.log("\nReport file:");
  console.log(
    path.relative(
      projectRoot,
      reportFilePath
    )
  );

  console.log("\nQuality report file:");
  console.log(
    path.relative(
      projectRoot,
      qualityReportFilePath
    )
  );

// Add the translation-memory output here
console.log("\nTranslation memory file:");

console.log(
  path.relative(
    projectRoot,
    translationMemoryFilePath
  )
);

  console.log(
    "\nYour original lib/translations.js was not modified."
  );

  console.log(
    "Your Hausa translations were preserved exactly.\n"
  );
}

main().catch((error) => {
  console.error(
    "\nTranslation generator failed:"
  );
  console.error(error.message);
  process.exit(1);
});
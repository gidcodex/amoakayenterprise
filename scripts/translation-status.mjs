import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadTranslationMemory } from "./translation-memory.mjs";
import { loadTranslationQueue } from "./translation-queue.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const translationMemoryFilePath = path.join(
  projectRoot,
  "generated",
  "translation-memory.json"
);

const translationsFilePath = path.join(
  projectRoot,
  "lib",
  "translations.js"
);

const languageLabels = {
  gaa: "Ga",
  tw: "Twi",
  ee: "Ewe",
};

function countStrings(value) {
  if (typeof value === "string") return 1;
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countStrings(item), 0);
  }

  if (value && typeof value === "object") {
    return Object.values(value).reduce(
      (total, item) => total + countStrings(item),
      0
    );
  }

  return 0;
}

async function loadEnglishTranslations() {
  const moduleUrl = pathToFileURL(translationsFilePath).href;
  const translationModule = await import(moduleUrl);

  const translations =
    translationModule.translations ??
    translationModule.default ??
    translationModule.translationData;

  if (!translations || typeof translations !== "object") {
    throw new Error(
      'Could not find the translations object. Expected an export named "translations" or a default export.'
    );
  }

  const english = translations.en;

  if (!english || typeof english !== "object") {
    throw new Error(
      'Could not find the English translation section at translations.en.'
    );
  }

  return english;
}

function summarizeLanguage(entries = {}) {
  const validEntries = Object.values(entries).filter(
    (entry) =>
      entry &&
      typeof entry.translation === "string" &&
      entry.translation.trim()
  );

  const approved = validEntries.filter(
    (entry) => entry.approved === true
  ).length;

  return {
    total: validEntries.length,
    approved,
    drafts: validEntries.length - approved,
  };
}

function calculatePercentage(translated, totalEnglish) {
  if (totalEnglish === 0) return "0.0";
  return Math.min((translated / totalEnglish) * 100, 100).toFixed(1);
}

async function main() {
  const englishTranslations = await loadEnglishTranslations();
  const totalEnglish = countStrings(englishTranslations);

  const memory = await loadTranslationMemory(translationMemoryFilePath);
  const queue = await loadTranslationQueue();

  const summaries = {
    gaa: summarizeLanguage(memory.entries?.gaa),
    tw: summarizeLanguage(memory.entries?.tw),
    ee: summarizeLanguage(memory.entries?.ee),
  };

  const queueCounts = {
    gaa: queue.items.filter((item) => item.language === "gaa").length,
    tw: queue.items.filter((item) => item.language === "tw").length,
    ee: queue.items.filter((item) => item.language === "ee").length,
  };

  console.log("\n========================================");
  console.log("AMOAKAY TRANSLATION DASHBOARD");
  console.log("========================================");

  console.log("\nEnglish Source Strings");
  console.log("----------------------");
  console.log(`Total: ${totalEnglish}`);

  console.log("\nTranslation Memory");
  console.log("----------------------");

  for (const language of ["gaa", "tw", "ee"]) {
    const summary = summaries[language];

    console.log(
      `${languageLabels[language].padEnd(5)}: ${summary.total} ` +
      `(${summary.approved} approved, ${summary.drafts} drafts)`
    );
  }

  console.log("\nPending Queue");
  console.log("----------------------");

  for (const language of ["gaa", "tw", "ee"]) {
    console.log(
      `${languageLabels[language].padEnd(5)}: ${queueCounts[language]}`
    );
  }

  console.log("\nCoverage");
  console.log("----------------------");

  for (const language of ["gaa", "tw", "ee"]) {
    const percentage = calculatePercentage(
      summaries[language].total,
      totalEnglish
    );

    console.log(`${languageLabels[language].padEnd(5)}: ${percentage}%`);
  }

  console.log("\n========================================\n");
}

main().catch((error) => {
  console.error("\nTranslation dashboard failed:");
  console.error(error?.stack || error);
  process.exitCode = 1;
});
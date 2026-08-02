import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

const paths = {
  translations: path.join(root, "lib/translations.js"),
  khaya: path.join(root, "lib/khaya.js"),
  service: path.join(root, "lib/translationService.js"),
  glossary: path.join(root, "scripts/translation-glossary.mjs"),
  overrides: path.join(root, "scripts/translation-overrides.mjs"),
  memoryModule: path.join(root, "scripts/translation-memory.mjs"),
  memory: path.join(root, "generated/translation-memory.json"),
  review: path.join(root, "generated/translations-all-review.json"),
  report: path.join(root, "generated/translations-all-report.json"),
  qualityReport: path.join(root, "generated/translations-all-quality-report.json"),
};

const queueCandidates = [
  path.join(root, "generated/pending-translations.json"),
  path.join(root, "generated/translation-queue.json"),
  path.join(root, "generated/pending-translation-queue.json"),
];

const results = [];
let errors = 0;
let warnings = 0;

function success(message) {
  results.push(`✓ ${message}`);
}

function failure(message) {
  results.push(`✗ ${message}`);
  errors += 1;
}

function warning(message) {
  results.push(`! ${message}`);
  warnings += 1;
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkRequiredFile(label, filePath) {
  if (fileExists(filePath)) {
    success(`${label} found`);
    return true;
  }

  failure(`${label} missing: ${path.relative(root, filePath)}`);
  return false;
}

function checkOptionalFile(label, filePath) {
  if (fileExists(filePath)) {
    success(`${label} found`);
    return true;
  }

  warning(`${label} not found`);
  return false;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failure(`Invalid JSON: ${path.relative(root, filePath)} (${error.message})`);
    return null;
  }
}

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

function findEmptyStrings(value, currentPath = "", emptyPaths = []) {
  if (typeof value === "string") {
    if (!value.trim()) emptyPaths.push(currentPath);
    return emptyPaths;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      findEmptyStrings(item, `${currentPath}[${index}]`, emptyPaths);
    });

    return emptyPaths;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      findEmptyStrings(item, nextPath, emptyPaths);
    });
  }

  return emptyPaths;
}

async function loadTranslations() {
  try {
    const moduleUrl = `${pathToFileURL(paths.translations).href}?doctor=${Date.now()}`;
    const module = await import(moduleUrl);

    return (
      module.default ||
      module.translations ||
      module.TRANSLATIONS ||
      module
    );
  } catch (error) {
    failure(`Could not import lib/translations.js: ${error.message}`);
    return null;
  }
}

async function runDoctor() {
  console.log(`
========================================
AMOAKAY TRANSLATION DOCTOR
========================================
`);

  checkRequiredFile("Translations source", paths.translations);
  checkRequiredFile("Khaya API client", paths.khaya);
  checkRequiredFile("Translation service", paths.service);
  checkRequiredFile("Glossary", paths.glossary);
  checkRequiredFile("Overrides", paths.overrides);
  checkRequiredFile("Translation memory helper", paths.memoryModule);

  if (checkRequiredFile("Translation memory", paths.memory)) {
    const memory = readJson(paths.memory);

    if (memory) {
      success("Translation memory JSON is valid");

      if (typeof memory === "object" && !Array.isArray(memory)) {
        success("Translation memory structure is valid");
      } else {
        failure("Translation memory must contain a JSON object");
      }
    }
  }

  const translations = await loadTranslations();

  if (translations) {
    success("lib/translations.js imported successfully");

    const requiredLanguages = ["en", "tw", "ee", "gaa", "ha"];
    const availableLanguages = Object.keys(translations);

    requiredLanguages.forEach((language) => {
      if (translations[language]) {
        success(`Language section "${language}" found`);
      } else {
        failure(`Language section "${language}" is missing`);
      }
    });

    if (translations.en) {
      const englishStrings = countStrings(translations.en);
      success(`English source contains ${englishStrings} strings`);

      const emptyEnglishStrings = findEmptyStrings(translations.en);

      if (emptyEnglishStrings.length === 0) {
        success("No empty English source strings");
      } else {
        failure(
          `Empty English strings found: ${emptyEnglishStrings.join(", ")}`
        );
      }
    }

    availableLanguages.forEach((language) => {
      if (!translations[language]) return;

      const total = countStrings(translations[language]);

      if (total > 0) {
        success(`${language} contains ${total} translated strings`);
      } else {
        warning(`${language} contains no translated strings`);
      }
    });
  }

  const queuePath = queueCandidates.find(fileExists);

  if (queuePath) {
    const queue = readJson(queuePath);

    if (queue !== null) {
      success(`Pending queue JSON is valid`);
      success(`Queue file: ${path.relative(root, queuePath)}`);

      const queueSize = Array.isArray(queue)
        ? queue.length
        : Array.isArray(queue.items)
          ? queue.items.length
          : Object.keys(queue).length;

      success(`Pending queue contains ${queueSize} item(s)`);
    }
  } else {
    warning("No pending translation queue file found");
  }

  if (checkOptionalFile("Review file", paths.review)) {
    if (readJson(paths.review) !== null) success("Review JSON is valid");
  }

  if (checkOptionalFile("Report file", paths.report)) {
    if (readJson(paths.report) !== null) success("Report JSON is valid");
  }

  if (checkOptionalFile("Quality report", paths.qualityReport)) {
    if (readJson(paths.qualityReport) !== null) {
      success("Quality report JSON is valid");
    }
  }

  console.log(results.join("\n"));

  console.log(`
----------------------------------------
Errors:   ${errors}
Warnings: ${warnings}
----------------------------------------
`);

  if (errors > 0) {
    console.log("Status: UNHEALTHY");
    process.exitCode = 1;
  } else if (warnings > 0) {
    console.log("Status: HEALTHY WITH WARNINGS");
  } else {
    console.log("Status: HEALTHY");
  }

  console.log(`
========================================
`);
}

await runDoctor();
import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

const translationsFilePath = path.join(
  projectRoot,
  "lib",
  "translations.js"
);

const translationMemoryFilePath = path.join(
  projectRoot,
  "generated",
  "translation-memory.json"
);

const diffReportFilePath = path.join(
  projectRoot,
  "generated",
  "translation-diff-report.json"
);

const supportedLanguages = [
  "gaa",
  "tw",
  "ee",
];

/**
 * Reads a command-line option such as:
 *
 * --section=home.heroSlider
 */
function getArgumentValue(argumentName) {
  const prefix = `--${argumentName}=`;

  const argument = process.argv.find((value) =>
    value.startsWith(prefix)
  );

  return argument
    ? argument.slice(prefix.length)
    : null;
}

/**
 * Imports lib/translations.js.
 *
 * This supports:
 *
 * export default translations;
 *
 * or:
 *
 * export const translations = {};
 */
async function importTranslations() {
  const moduleUrl =
    pathToFileURL(
      translationsFilePath
    ).href;

  const importedModule = await import(
    `${moduleUrl}?timestamp=${Date.now()}`
  );

  const possibleTranslations = [
    importedModule.default,
    importedModule.translations,
    ...Object.values(importedModule),
  ];

  const translations =
    possibleTranslations.find(
      (value) =>
        value &&
        typeof value === "object" &&
        value.en &&
        typeof value.en === "object"
    );

  if (!translations) {
    throw new Error(
      "Could not find the translations object in lib/translations.js."
    );
  }

  return translations;
}

/**
 * Gets a nested section using a path such as:
 *
 * home.heroSlider
 */
function getNestedValue(object, sectionPath) {
  if (!sectionPath) {
    return object;
  }

  return sectionPath
    .split(".")
    .reduce(
      (currentValue, key) =>
        currentValue?.[key],
      object
    );
}

/**
 * Converts nested translation objects into:
 *
 * [
 *   {
 *     path: "home.heroSlider.todaysDeals",
 *     english: "Today's Deals"
 *   }
 * ]
 */
function flattenEnglishStrings(
  value,
  currentPath = ""
) {
  const results = [];

  if (typeof value === "string") {
    results.push({
      path: currentPath,
      english: value,
    });

    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const childPath = currentPath
        ? `${currentPath}.${index}`
        : String(index);

      results.push(
        ...flattenEnglishStrings(
          item,
          childPath
        )
      );
    });

    return results;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    for (const [key, childValue] of Object.entries(
      value
    )) {
      const childPath = currentPath
        ? `${currentPath}.${key}`
        : key;

      results.push(
        ...flattenEnglishStrings(
          childValue,
          childPath
        )
      );
    }
  }

  return results;
}

/**
 * Normalizes text before comparison.
 */
function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates the Levenshtein edit distance.
 */
function levenshteinDistance(
  firstValue,
  secondValue
) {
  const first = normalizeText(firstValue);
  const second = normalizeText(secondValue);

  const rows = second.length + 1;
  const columns = first.length + 1;

  const matrix = Array.from(
    { length: rows },
    () => Array(columns).fill(0)
  );

  for (
    let column = 0;
    column < columns;
    column += 1
  ) {
    matrix[0][column] = column;
  }

  for (
    let row = 0;
    row < rows;
    row += 1
  ) {
    matrix[row][0] = row;
  }

  for (
    let row = 1;
    row < rows;
    row += 1
  ) {
    for (
      let column = 1;
      column < columns;
      column += 1
    ) {
      const substitutionCost =
        second[row - 1] ===
        first[column - 1]
          ? 0
          : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] +
          substitutionCost
      );
    }
  }

  return matrix[rows - 1][columns - 1];
}

/**
 * Converts edit distance into a score from 0 to 1.
 *
 * 1 means identical.
 * 0 means completely different.
 */
function calculateSimilarity(
  firstValue,
  secondValue
) {
  const first = normalizeText(firstValue);
  const second = normalizeText(secondValue);

  if (!first && !second) {
    return 1;
  }

  const longestLength = Math.max(
    first.length,
    second.length
  );

  if (longestLength === 0) {
    return 0;
  }

  const distance =
    levenshteinDistance(
      first,
      second
    );

  return Number(
    (
      1 -
      distance / longestLength
    ).toFixed(4)
  );
}

/**
 * Finds an old translation-memory entry that used
 * the same translation path.
 *
 * This is the strongest indication that the English
 * source text was changed.
 */
function findSamePathCandidate({
  languageEntries,
  currentPath,
  newEnglish,
}) {
  for (const [
    oldEnglish,
    entry,
  ] of Object.entries(languageEntries)) {
    if (
      entry?.path === currentPath &&
      oldEnglish !== newEnglish
    ) {
      return {
        matchType: "samePath",
        oldEnglish,
        newEnglish,
        path: currentPath,
        similarity:
          calculateSimilarity(
            oldEnglish,
            newEnglish
          ),
        oldTranslation:
          entry.translation,
        approved:
          entry.approved === true,
        origin:
          entry.origin ?? null,
        reviewedBy:
          entry.reviewedBy ?? null,
        reviewedAt:
          entry.reviewedAt ?? null,
      };
    }
  }

  return null;
}

/**
 * Finds similar old English strings when there is no
 * translation-memory entry with the same path.
 */
function findSimilarCandidates({
  languageEntries,
  newEnglish,
  currentPath,
  minimumSimilarity = 0.72,
  maximumResults = 3,
}) {
  return Object.entries(languageEntries)
    .map(([oldEnglish, entry]) => {
      const similarity =
        calculateSimilarity(
          oldEnglish,
          newEnglish
        );

      return {
        matchType: "similarText",
        oldEnglish,
        newEnglish,
        path: currentPath,
        previousPath:
          entry.path ?? null,
        similarity,
        oldTranslation:
          entry.translation,
        approved:
          entry.approved === true,
        origin:
          entry.origin ?? null,
        reviewedBy:
          entry.reviewedBy ?? null,
        reviewedAt:
          entry.reviewedAt ?? null,
      };
    })
    .filter(
      (candidate) =>
        candidate.similarity >=
        minimumSimilarity
    )
    .sort(
      (firstCandidate, secondCandidate) =>
        secondCandidate.similarity -
        firstCandidate.similarity
    )
    .slice(0, maximumResults);
}

async function main() {
  const sectionPath =
    getArgumentValue("section");

  const translations =
    await importTranslations();

  const englishSection =
    getNestedValue(
      translations.en,
      sectionPath
    );

  if (
    englishSection === undefined
  ) {
    throw new Error(
      `The English section "${sectionPath}" could not be found.`
    );
  }

  const memoryFileContent =
    await fs.readFile(
      translationMemoryFilePath,
      "utf8"
    );

  const translationMemory =
    JSON.parse(memoryFileContent);

  const basePath =
    sectionPath ?? "";

  const englishStrings =
    flattenEnglishStrings(
      englishSection,
      basePath
    );

  const report = {
    generatedAt:
      new Date().toISOString(),
    section:
      sectionPath || "all",
    totalEnglishStrings:
      englishStrings.length,
    languages: {},
    summary: {
      exactMemoryMatches: 0,
      changedAtSamePath: 0,
      similarTextSuggestions: 0,
      completelyNewStrings: 0,
    },
  };

  console.log(
    "\n========================================"
  );

  console.log(
    "AMOAKAY TRANSLATION DIFF ENGINE"
  );

  console.log(
    "========================================"
  );

  console.log(
    `\nSection: ${sectionPath || "all"}`
  );

  console.log(
    `English strings: ${englishStrings.length}`
  );

  for (const language of supportedLanguages) {
    const languageEntries =
      translationMemory.entries?.[
        language
      ] ?? {};

    const languageReport = {
      exactMatches: [],
      changedStrings: [],
      similarSuggestions: [],
      newStrings: [],
    };

    console.log(
      `\nChecking ${language.toUpperCase()}...`
    );

    for (const {
      path: currentPath,
      english,
    } of englishStrings) {
      const exactEntry =
        languageEntries[english];

      if (exactEntry) {
        languageReport.exactMatches.push({
          path: currentPath,
          english,
          translation:
            exactEntry.translation,
          approved:
            exactEntry.approved === true,
          origin:
            exactEntry.origin ?? null,
        });

        report.summary.exactMemoryMatches +=
          1;

        continue;
      }

      const samePathCandidate =
        findSamePathCandidate({
          languageEntries,
          currentPath,
          newEnglish: english,
        });

      if (samePathCandidate) {
        languageReport.changedStrings.push(
          samePathCandidate
        );

        report.summary.changedAtSamePath +=
          1;

        console.log(
          `\n  English changed at: ${currentPath}`
        );

        console.log(
          `  Old: ${samePathCandidate.oldEnglish}`
        );

        console.log(
          `  New: ${samePathCandidate.newEnglish}`
        );

        console.log(
          `  Similarity: ${Math.round(
            samePathCandidate.similarity *
              100
          )}%`
        );

        continue;
      }

      const similarCandidates =
        findSimilarCandidates({
          languageEntries,
          newEnglish: english,
          currentPath,
        });

      if (
        similarCandidates.length > 0
      ) {
        languageReport.similarSuggestions.push(
          {
            path: currentPath,
            english,
            candidates:
              similarCandidates,
          }
        );

        report.summary.similarTextSuggestions +=
          1;

        continue;
      }

      languageReport.newStrings.push({
        path: currentPath,
        english,
      });

      report.summary.completelyNewStrings +=
        1;
    }

    report.languages[language] =
      languageReport;
  }

  await fs.mkdir(
    path.dirname(diffReportFilePath),
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    diffReportFilePath,
    `${JSON.stringify(
      report,
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(
    "\n========================================"
  );

  console.log(
    "TRANSLATION DIFF SUMMARY"
  );

  console.log(
    "========================================"
  );

  console.log(
    `Exact memory matches: ${report.summary.exactMemoryMatches}`
  );

  console.log(
    `Changed at same path: ${report.summary.changedAtSamePath}`
  );

  console.log(
    `Similar-text suggestions: ${report.summary.similarTextSuggestions}`
  );

  console.log(
    `Completely new strings: ${report.summary.completelyNewStrings}`
  );

  console.log(
    "\nDiff report:"
  );

  console.log(
    path.relative(
      projectRoot,
      diffReportFilePath
    )
  );

  console.log("");
}

main().catch((error) => {
  console.error(
    "\nTranslation diff failed:"
  );

  console.error(error);

  process.exitCode = 1;
});
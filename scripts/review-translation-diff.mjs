import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath } from "node:url";

import { translateText } from "../lib/khaya.js";
import { sourceTextOverrides,} from "./translation-overrides.mjs";
import {  addTranslationToQueue,} from "./translation-queue.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const generatedDirectory = path.join(
  projectRoot,
  "generated"
);

const diffReportFilePath = path.join(
  generatedDirectory,
  "translation-diff-report.json"
);

const translationMemoryFilePath = path.join(
  generatedDirectory,
  "translation-memory.json"
);

const languageMap = {
  gaa: "gaa",
  tw: "twi",
  ee: "ewe",
};

const languageNames = {
  gaa: "Ga",
  tw: "Twi",
  ee: "Ewe",
};

const supportedLanguages = [
  "gaa",
  "tw",
  "ee",
];

async function readJsonFile(filePath, fileDescription) {
  try {
    const content = await fs.readFile(
      filePath,
      "utf8"
    );

    return JSON.parse(content);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(
        `${fileDescription} could not be found:\n${filePath}`
      );
    }

    if (error instanceof SyntaxError) {
      throw new Error(
        `${fileDescription} contains invalid JSON:\n${filePath}`
      );
    }

    throw error;
  }
}

async function writeTranslationMemory(memory) {
  memory.updatedAt =
    new Date().toISOString();

  await fs.mkdir(
    path.dirname(translationMemoryFilePath),
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    translationMemoryFilePath,
    `${JSON.stringify(memory, null, 2)}\n`,
    "utf8"
  );
}

function ensureLanguageEntries(
  translationMemory,
  language
) {
  translationMemory.entries ??= {};
  translationMemory.entries[language] ??= {};

  return translationMemory.entries[language];
}

function createMemoryEntry({
  translation,
  sourceText,
  origin,
  approved,
  path: translationPath,
  reviewedBy = null,
  reviewedAt = null,
}) {
  const now = new Date().toISOString();

  return {
    translation,
    sourceText,
    origin,
    approved,
    path: translationPath,
    firstSeenAt: now,
    updatedAt: now,
    reviewedBy,
    reviewedAt,
  };
}

function showChangedString({
  language,
  changedString,
  currentNumber,
  totalNumber,
}) {
  const similarityPercentage = Math.round(
    Number(changedString.similarity || 0) *
      100
  );

  console.log(
    "\n========================================"
  );

  console.log(
    `${languageNames[language]} — ${currentNumber} of ${totalNumber}`
  );

  console.log(
    "========================================"
  );

  console.log("\nPath:");
  console.log(changedString.path);

  console.log("\nOld English:");
  console.log(changedString.oldEnglish);

  console.log("\nNew English:");
  console.log(changedString.newEnglish);

  console.log("\nOld translation:");
  console.log(
    changedString.oldTranslation ||
      "(No previous translation)"
  );

  console.log("\nOld approval status:");
  console.log(
    changedString.approved
      ? "Approved"
      : "Not approved"
  );

  console.log("\nSimilarity:");
  console.log(`${similarityPercentage}%`);

  console.log(
    "\nChoose an action:"
  );

  console.log(
    "r = reuse old translation as an unapproved draft"
  );

console.log(
  "t = request a fresh GhanaNLP translation"
);

console.log(
  "a = add this translation to the pending queue"
);

console.log(
  "e = enter the correct translation manually"
);

  console.log(
    "s = skip this entry"
  );

  console.log(
    "q = save and quit"
  );
}

function isQuotaError(error) {
  const message = String(
    error?.message ||
      error ||
      ""
  ).toLowerCase();

  return (
    message.includes("out of call volume quota") ||
    message.includes("quota exceeded") ||
    message.includes("statuscode\": 403") ||
    message.includes("statuscode: 403")
  );
}

async function requestFreshTranslation({
  language,
  newEnglish,
}) {
  const khayaLanguage =
    languageMap[language];

  if (!khayaLanguage) {
    throw new Error(
      `No Khaya language code is configured for "${language}".`
    );
  }

  const sourceText =
    sourceTextOverrides?.[language]?.[
      newEnglish
    ] ?? newEnglish;

  console.log(
    `\nSending to GhanaNLP: "${sourceText}"`
  );

  const response = await translateText(
    sourceText,
    "eng",
    khayaLanguage
  );

  const translation =
    typeof response === "string"
      ? response.trim()
      : String(response ?? "").trim();

  if (!translation) {
    throw new Error(
      "GhanaNLP returned an empty translation."
    );
  }

  return {
    translation,
    sourceText,
  };
}

async function main() {
  const diffReport = await readJsonFile(
    diffReportFilePath,
    "The translation diff report"
  );

  const translationMemory =
    await readJsonFile(
      translationMemoryFilePath,
      "The translation memory"
    );

  const changedItems = [];

  for (const language of supportedLanguages) {
    const languageChanges =
      diffReport.languages?.[language]
        ?.changedStrings ?? [];

    for (const changedString of languageChanges) {
      changedItems.push({
        language,
        changedString,
      });
    }
  }

  console.log(
    "\n========================================"
  );

  console.log(
    "AMOAKAY TRANSLATION DIFF REVIEW"
  );

  console.log(
    "========================================"
  );

  console.log(
    `\nChanged translations awaiting review: ${changedItems.length}`
  );

  if (changedItems.length === 0) {
    console.log(
      "\nThere are no changed strings to review."
    );

    console.log(
      "Run npm run translate:diff:hero after changing an English source string.\n"
    );

    return;
  }

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

let reusedCount = 0;
let translatedCount = 0;
let queuedCount = 0;
let manuallyEditedCount = 0;
let skippedCount = 0;
let shouldQuit = false;

  try {
    for (
      let index = 0;
      index < changedItems.length;
      index += 1
    ) {
      if (shouldQuit) {
        break;
      }

      const {
        language,
        changedString,
      } = changedItems[index];

      const languageEntries =
        ensureLanguageEntries(
          translationMemory,
          language
        );

      showChangedString({
        language,
        changedString,
        currentNumber: index + 1,
        totalNumber: changedItems.length,
      });

      let decisionCompleted = false;

      while (!decisionCompleted) {
        const answer = (
          await rl.question(
            "\nYour choice (r/t/a/e/s/q): "
          )
        )
          .trim()
          .toLowerCase();

        if (answer === "r") {
          const oldTranslation =
            String(
              changedString.oldTranslation ??
                ""
            ).trim();

          if (!oldTranslation) {
            console.log(
              "\nThere is no old translation to reuse."
            );

            continue;
          }

          languageEntries[
            changedString.newEnglish
          ] = createMemoryEntry({
            translation: oldTranslation,
            sourceText:
              changedString.newEnglish,
            origin: "diffReuse",
            approved: false,
            path: changedString.path,
          });

          await writeTranslationMemory(
            translationMemory
          );

          reusedCount += 1;
          decisionCompleted = true;

          console.log(
            "\nOld translation saved as an unapproved draft."
          );

          continue;
        }

        if (answer === "t") {
  try {
    const {
      translation,
      sourceText,
    } =
      await requestFreshTranslation({
        language,
        newEnglish:
          changedString.newEnglish,
      });

    console.log(
      "\nFresh GhanaNLP translation:"
    );

    console.log(translation);

    languageEntries[
      changedString.newEnglish
    ] = createMemoryEntry({
      translation,
      sourceText,
      origin: "ghanaNLPDiff",
      approved: false,
      path: changedString.path,
    });

    await writeTranslationMemory(
      translationMemory
    );

    translatedCount += 1;
    decisionCompleted = true;

    console.log(
      "\nFresh translation saved as unapproved."
    );
  } catch (error) {
    const errorMessage = String(
      error?.message || error
    );

    console.error(
      "\nGhanaNLP translation failed:"
    );

    console.error(errorMessage);

    if (isQuotaError(error)) {
      const sourceText =
        sourceTextOverrides?.[language]?.[
          changedString.newEnglish
        ] ?? changedString.newEnglish;

      await addTranslationToQueue({
        language,
        english:
          changedString.newEnglish,
        sourceText,
        path: changedString.path,
        reason: "quotaExceeded",
        priority: "high",
        previousEnglish:
          changedString.oldEnglish,
        previousTranslation:
          changedString.oldTranslation,
        errorMessage,
      });

      queuedCount += 1;
      decisionCompleted = true;

      console.log(
        "\nThe translation was automatically added to the pending queue."
      );

      console.log(
        "You can continue reviewing without waiting for the API quota."
      );
    } else {
      console.log(
        "\nChoose another option or try again."
      );
    }
  }

  continue;
}

      if (answer === "a") {
  const sourceText =
    sourceTextOverrides?.[language]?.[
      changedString.newEnglish
    ] ?? changedString.newEnglish;

  await addTranslationToQueue({
    language,
    english:
      changedString.newEnglish,
    sourceText,
    path: changedString.path,
    reason: "manualQueue",
    priority: "normal",
    previousEnglish:
      changedString.oldEnglish,
    previousTranslation:
      changedString.oldTranslation,
  });

  queuedCount += 1;
  decisionCompleted = true;

  console.log(
    "\nTranslation added to the pending queue."
  );

  continue;
}

        if (answer === "e") {
          const manualTranslation = (
            await rl.question(
              "\nEnter the correct translation: "
            )
          ).trim();

          if (!manualTranslation) {
            console.log(
              "\nThe translation cannot be empty."
            );

            continue;
          }

          const now =
            new Date().toISOString();

          languageEntries[
            changedString.newEnglish
          ] = createMemoryEntry({
            translation:
              manualTranslation,
            sourceText:
              changedString.newEnglish,
            origin: "manualDiffReview",
            approved: true,
            path: changedString.path,
            reviewedBy: "Gideon",
            reviewedAt: now,
          });

          await writeTranslationMemory(
            translationMemory
          );

          manuallyEditedCount += 1;
          decisionCompleted = true;

          console.log(
            "\nManual translation saved and approved."
          );

          continue;
        }

        if (answer === "s") {
          skippedCount += 1;
          decisionCompleted = true;

          console.log(
            "\nEntry skipped."
          );

          continue;
        }

        if (answer === "q") {
          shouldQuit = true;
          decisionCompleted = true;

          console.log(
            "\nSaving and exiting..."
          );

          continue;
        }

          console.log(
            "\nInvalid option. Enter r, t, a, e, s, or q."
       );
      }
    }
  } finally {
    rl.close();

    await writeTranslationMemory(
      translationMemory
    );
  }

  console.log(
    "\n========================================"
  );

  console.log(
    "DIFF REVIEW SUMMARY"
  );

  console.log(
    "========================================"
  );

  console.log(
    `Reused as drafts: ${reusedCount}`
  );

  console.log(
  `Fresh GhanaNLP translations: ${translatedCount}`
);

console.log(
  `Added to pending queue: ${queuedCount}`
);

console.log(
  `Manually entered and approved: ${manuallyEditedCount}`
);

  console.log(
    `Skipped: ${skippedCount}`
  );

  console.log(
    "\nTranslation memory:"
  );

  console.log(
    path.relative(
      projectRoot,
      translationMemoryFilePath
    )
  );

  console.log("");
}

main().catch((error) => {
  console.error(
    "\nTranslation diff review failed:"
  );

  console.error(
    error?.stack || error
  );

  process.exitCode = 1;
});
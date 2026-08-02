import { translateText } from "../lib/khaya.js";
import { sourceTextOverrides } from "./translation-overrides.mjs";
import {
  loadTranslationQueue,
  writeTranslationQueue,
} from "./translation-queue.mjs";
import {
  loadTranslationMemory,
  saveTranslationMemoryEntry,
  writeTranslationMemory,
} from "./translation-memory.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const translationMemoryFilePath = path.join(
  projectRoot,
  "generated",
  "translation-memory.json"
);

const languageMap = {
  gaa: "gaa",
  tw: "twi",
  ee: "ewe",
};

function isQuotaError(error) {
  const message = String(error?.message ?? error).toLowerCase();

  return (
    message.includes("out of call volume quota") ||
    message.includes("quota exceeded") ||
    message.includes("403")
  );
}

async function translateQueueItem(item) {
  const targetLanguage = languageMap[item.language];

  if (!targetLanguage) {
    throw new Error(`Unsupported language: ${item.language}`);
  }

  const sourceText =
    item.sourceText ||
    sourceTextOverrides?.[item.language]?.[item.english] ||
    item.english;

  const response = await translateText(
    sourceText,
    "eng",
    targetLanguage
  );

  const translation = String(response ?? "").trim();

  if (!translation) {
    throw new Error("GhanaNLP returned an empty translation.");
  }

  return {
    translation,
    sourceText,
  };
}

async function main() {
  const queue = await loadTranslationQueue();

  console.log("translationMemoryFilePath:", translationMemoryFilePath);

  const memory = await loadTranslationMemory(translationMemoryFilePath);

  if (!Array.isArray(queue.items) || queue.items.length === 0) {
    console.log("No queued translations.");
    return;
  }

  console.log(`Processing ${queue.items.length} queued translations...\n`);

  const remaining = [];
  let completed = 0;
  let failed = 0;

  for (const item of queue.items) {
    console.log(`${item.language.toUpperCase()} → ${item.path}`);

    try {
      const { translation, sourceText } =
        await translateQueueItem(item);

      saveTranslationMemoryEntry({
        memory,
        language: item.language,
        english: item.english,
        translation,
        sourceText,
        origin: "pendingQueue",
        approved: false,
        path: item.path,
      });

      completed += 1;
      console.log(`✓ Completed: ${translation}\n`);
    } catch (error) {
      failed += 1;

      const errorMessage = String(error?.message ?? error);
      const updatedItem = {
        ...item,
        status: isQuotaError(error) ? "waiting" : "failed",
        attempts: Number(item.attempts || 0) + 1,
        lastError: errorMessage,
        lastAttemptAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      remaining.push(updatedItem);

      console.log(
        isQuotaError(error)
          ? "✗ Quota unavailable. Item kept in queue.\n"
          : `✗ Translation failed: ${errorMessage}\n`
      );

      if (isQuotaError(error)) {
        console.log(
          "GhanaNLP quota is unavailable. Remaining items will not be attempted during this run.\n"
        );

        const currentIndex = queue.items.indexOf(item);
        remaining.push(...queue.items.slice(currentIndex + 1));
        break;
      }
    }
  }

  queue.items = remaining;

await writeTranslationMemory({
  memory,
  memoryFilePath: translationMemoryFilePath,
});

  await writeTranslationQueue(queue);

  console.log("================================");
  console.log("QUEUE SUMMARY");
  console.log("================================");
  console.log(`Completed : ${completed}`);
  console.log(`Remaining : ${remaining.length}`);
  console.log(`Failed    : ${failed}`);
}

main().catch((error) => {
  console.error("\nPending translation processing failed:");
  console.error(error?.stack || error);
  process.exitCode = 1;
});
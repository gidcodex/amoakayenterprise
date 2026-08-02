import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export const pendingTranslationsFilePath = path.join(
  projectRoot,
  "generated",
  "pending-translations.json"
);

function createEmptyQueue() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: [],
  };
}

export async function loadTranslationQueue() {
  try {
    const content = await fs.readFile(
      pendingTranslationsFilePath,
      "utf8"
    );

    const queue = JSON.parse(content);

    if (!Array.isArray(queue.items)) {
      queue.items = [];
    }

    return queue;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return createEmptyQueue();
    }

    if (error instanceof SyntaxError) {
      throw new Error(
        `Invalid JSON in ${pendingTranslationsFilePath}`
      );
    }

    throw error;
  }
}

export async function writeTranslationQueue(queue) {
  queue.version ??= 1;
  queue.updatedAt = new Date().toISOString();
  queue.items ??= [];

  await fs.mkdir(
    path.dirname(pendingTranslationsFilePath),
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    pendingTranslationsFilePath,
    `${JSON.stringify(queue, null, 2)}\n`,
    "utf8"
  );
}

function createQueueId({
  language,
  path: translationPath,
}) {
  return `${language}:${translationPath}`;
}

export function findQueuedTranslation({
  queue,
  language,
  path: translationPath,
}) {
  const queueId = createQueueId({
    language,
    path: translationPath,
  });

  return queue.items.find(
    (item) => item.id === queueId
  );
}

export async function addTranslationToQueue({
  language,
  english,
  sourceText,
  path: translationPath,
  reason = "manualQueue",
  priority = "normal",
  previousEnglish = null,
  previousTranslation = null,
  errorMessage = null,
}) {
  const queue = await loadTranslationQueue();

  const now = new Date().toISOString();

  const id = createQueueId({
    language,
    path: translationPath,
  });

  const existingIndex = queue.items.findIndex(
    (item) => item.id === id
  );

  const existingItem =
    existingIndex >= 0
      ? queue.items[existingIndex]
      : null;

  const nextItem = {
    id,
    language,
    english,
    sourceText: sourceText || english,
    path: translationPath,
    status: "pending",
    reason,
    priority,
    attempts: existingItem?.attempts ?? 0,
    previousEnglish:
      previousEnglish ??
      existingItem?.previousEnglish ??
      null,
    previousTranslation:
      previousTranslation ??
      existingItem?.previousTranslation ??
      null,
    lastError:
      errorMessage ??
      existingItem?.lastError ??
      null,
    queuedAt:
      existingItem?.queuedAt ?? now,
    updatedAt: now,
    lastAttemptAt:
      existingItem?.lastAttemptAt ?? null,
    completedAt: null,
  };

  if (existingIndex >= 0) {
    queue.items[existingIndex] = nextItem;
  } else {
    queue.items.push(nextItem);
  }

  await writeTranslationQueue(queue);

  return nextItem;
}

export async function markQueueAttempt({
  language,
  path: translationPath,
  errorMessage = null,
}) {
  const queue = await loadTranslationQueue();

  const queuedItem = findQueuedTranslation({
    queue,
    language,
    path: translationPath,
  });

  if (!queuedItem) {
    return null;
  }

  queuedItem.attempts =
    Number(queuedItem.attempts || 0) + 1;

  queuedItem.lastAttemptAt =
    new Date().toISOString();

  queuedItem.updatedAt =
    new Date().toISOString();

  queuedItem.lastError =
    errorMessage ?? null;

  queuedItem.status = errorMessage
    ? "waiting"
    : "processing";

  await writeTranslationQueue(queue);

  return queuedItem;
}

export async function removeTranslationFromQueue({
  language,
  path: translationPath,
}) {
  const queue = await loadTranslationQueue();

  const id = createQueueId({
    language,
    path: translationPath,
  });

  const previousLength = queue.items.length;

  queue.items = queue.items.filter(
    (item) => item.id !== id
  );

  const removed =
    queue.items.length < previousLength;

  if (removed) {
    await writeTranslationQueue(queue);
  }

  return removed;
}
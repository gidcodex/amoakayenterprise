import fs from "node:fs/promises";
import path from "node:path";

function createEmptyMemory() {
  return {
    version: 1,
    updatedAt: null,
    entries: {
      tw: {},
      ee: {},
      gaa: {},
    },
  };
}

export async function loadTranslationMemory(
  memoryFilePath
) {
  try {
    const fileContent = await fs.readFile(
      memoryFilePath,
      "utf8"
    );

    const parsedMemory = JSON.parse(fileContent);

    return {
      version: parsedMemory.version ?? 1,
      updatedAt: parsedMemory.updatedAt ?? null,

      entries: {
        tw: parsedMemory.entries?.tw ?? {},
        ee: parsedMemory.entries?.ee ?? {},
        gaa: parsedMemory.entries?.gaa ?? {},
      },
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return createEmptyMemory();
    }

    if (error instanceof SyntaxError) {
      throw new Error(
        `The translation-memory file contains invalid JSON: ${memoryFilePath}`
      );
    }

    throw error;
  }
}

export function getTranslationMemoryEntry({
  memory,
  language,
  english,
  sourceText,
}) {
  const entry =
    memory.entries?.[language]?.[english];

  if (!entry) {
    return null;
  }

  if (
    typeof entry.translation !== "string" ||
    !entry.translation.trim()
  ) {
    return null;
  }

  /*
   * If the context-expanded English text has changed,
   * do not reuse the old translation.
   */
  if (
    entry.sourceText &&
    entry.sourceText !== sourceText
  ) {
    return null;
  }

  return entry;
}

export function saveTranslationMemoryEntry({
  memory,
  language,
  english,
  sourceText,
  translation,
  origin,
  approved = false,
  path: translationPath,
}) {
  if (!memory.entries[language]) {
    memory.entries[language] = {};
  }

  const existingEntry =
    memory.entries[language][english];

  const now = new Date().toISOString();

  /*
   * Do not accidentally remove approval from an already
   * approved translation when the wording is unchanged.
   */
  const preserveExistingApproval =
    existingEntry?.approved === true &&
    existingEntry.translation === translation;

  memory.entries[language][english] = {
    translation,
    sourceText,
    origin,
    approved:
      approved || preserveExistingApproval,
    path:
      translationPath ??
      existingEntry?.path ??
      null,
    firstSeenAt:
      existingEntry?.firstSeenAt ?? now,
    updatedAt: now,
    reviewedBy:
      existingEntry?.reviewedBy ?? null,
    reviewedAt:
      existingEntry?.reviewedAt ?? null,
  };

  return memory.entries[language][english];
}

export async function writeTranslationMemory({
  memory,
  memoryFilePath,
}) {
  memory.updatedAt = new Date().toISOString();

  await fs.mkdir(
    path.dirname(memoryFilePath),
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    memoryFilePath,
    `${JSON.stringify(memory, null, 2)}\n`,
    "utf8"
  );
}
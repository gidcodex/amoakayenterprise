import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

const translationMemoryFile = path.join(
  projectRoot,
  "generated",
  "translation-memory.json"
);

const memory = JSON.parse(
  await fs.readFile(
    translationMemoryFile,
    "utf8"
  )
);

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const languages = ["gaa", "tw", "ee"];

let shouldQuit = false;
let approvedCount = 0;
let editedCount = 0;
let skippedCount = 0;

for (const language of languages) {
  if (shouldQuit) {
    break;
  }

  console.log(
    `\n========== ${language.toUpperCase()} ==========\n`
  );

  const entries =
    memory.entries?.[language] ?? {};

  for (const [english, entry] of Object.entries(
    entries
  )) {
    if (shouldQuit) {
      break;
    }

    if (entry.approved === true) {
      continue;
    }

    console.log("====================================");
    console.log(
      `Language: ${language.toUpperCase()}`
    );

    console.log("\nEnglish:");
    console.log(english);

    console.log("\nTranslation:");
    console.log(entry.translation);

    console.log("\nPath:");
    console.log(entry.path ?? "(unknown)");

    console.log("\nOrigin:");
    console.log(entry.origin ?? "(unknown)");

    console.log("====================================");

    const answer = (
      await rl.question(
        "\nApprove? (y = yes, n = edit, s = skip, q = quit): "
      )
    )
      .trim()
      .toLowerCase();

    if (answer === "q") {
      console.log("\nSaving and exiting...");
      shouldQuit = true;
      break;
    }

    if (answer === "s") {
      skippedCount += 1;
      console.log("Skipped.\n");
      continue;
    }

    if (answer === "y") {
      entry.approved = true;
      entry.reviewedBy = "Gideon";
      entry.reviewedAt =
        new Date().toISOString();
      entry.updatedAt =
        new Date().toISOString();

      approvedCount += 1;

      console.log("✓ Approved\n");
      continue;
    }

    if (answer === "n") {
      const correctedTranslation = (
        await rl.question(
          "\nEnter the corrected translation: "
        )
      ).trim();

      if (!correctedTranslation) {
        console.log(
          "No correction entered. Translation skipped.\n"
        );

        skippedCount += 1;
        continue;
      }

      entry.translation =
        correctedTranslation;
      entry.approved = true;
      entry.reviewedBy = "Gideon";
      entry.reviewedAt =
        new Date().toISOString();
      entry.updatedAt =
        new Date().toISOString();
      entry.origin = "manualReview";

      editedCount += 1;

      console.log(
        "✓ Updated and approved\n"
      );

      continue;
    }

    console.log(
      "Invalid option. Translation skipped.\n"
    );

    skippedCount += 1;
  }
}

memory.updatedAt =
  new Date().toISOString();

await fs.writeFile(
  translationMemoryFile,
  `${JSON.stringify(memory, null, 2)}\n`,
  "utf8"
);

rl.close();

console.log(
  "\n✓ Translation memory saved successfully."
);

console.log("\nReview summary:");
console.log(`Approved: ${approvedCount}`);
console.log(`Edited: ${editedCount}`);
console.log(`Skipped: ${skippedCount}`);
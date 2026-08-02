const command = process.argv[2];

const commands = {
  status: "../translation-status.mjs",
  doctor: "../translation-doctor.mjs",
  diff: "../translation-diff.mjs",
  review: "../review-translation-diff.mjs",
  pending: "../process-pending-translations.mjs",
  approve: "../approve-translations.mjs",
  generate: "../generate-translations.mjs",
};

function showHelp() {
  console.log(`
========================================
AMOAKAY TRANSLATION CLI
========================================

Usage:
  npm run translate -- <command>

Commands
----------------------------------------
status      Show translation dashboard
doctor      Validate translation system
generate    Generate missing translations
diff        Detect changed English strings
review      Review translation changes
approve     Approve reviewed translations
pending     Process queued translations
help        Show this help

Examples
----------------------------------------
npm run translate -- status
npm run translate -- doctor
npm run translate -- generate
npm run translate -- diff
npm run translate -- review
npm run translate -- approve
npm run translate -- pending

========================================
`);
}

if (!command || command === "help") {
  showHelp();
  process.exit(0);
}

const script = commands[command];

if (!script) {
  console.error(`\nUnknown command: ${command}\n`);
  showHelp();
  process.exit(1);
}

await import(script);
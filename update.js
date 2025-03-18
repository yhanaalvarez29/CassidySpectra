const { createUpdater } = require("./updater");
const readline = require("readline-sync");

const ignoreInput = readline.question(
  "Enter files/directories to ignore (comma-separated, leave blank for none): "
);
const ignore = ignoreInput ? ignoreInput.split(",").map((f) => f.trim()) : [];
ignore.push(".git", "node_modules");
const dontUpdateInput = readline.question(
  "Enter files that should not be replaced (comma-separated, leave blank for none): "
);
const dontReplace = dontUpdateInput
  ? dontUpdateInput.split(",").map((f) => f.trim())
  : [];

const dontDelete = keyInYNWithDefault("Prevent deletion of removed files?", true);

const options = { ignore, dontReplace, dontDelete };
const updater = createUpdater(undefined, "main", options);

console.log("\nChanges detected:");
updater.changes.added.forEach((file) => console.log(`[added] ${file}`));
updater.changes.modified.forEach((file) => console.log(`[modified] ${file}`));
updater.changes.removed.forEach((file) => console.log(`[removed] ${file}`));

console.log(`\nIgnoring: ${ignore.length > 2 ? ignore.join(", ") : "None"}`);
console.log(
  `Files that won't be replaced: ${
    dontReplace.length > 0 ? dontReplace.join(", ") : "None"
  }`
);
console.log(`File deletion is ${dontDelete ? "disabled" : "enabled"}.`);

const confirmUpdate = readline.keyInYNStrict("\nApply these updates?");
if (confirmUpdate) {
  updater();
  console.log("Update completed successfully.");
} else {
  console.log("Update canceled.");
}

function keyInYNWithDefault(prompt, defaultValue = true) {
  const defaultKey = defaultValue ? "Y" : "N";
  const userInput = readline.keyIn(`${prompt} [Y/N] (default: ${defaultKey}): `, {
    limit: "yn",
    caseSensitive: false,
    guide: false, 
  });

  return userInput === "" ? defaultValue : userInput.toLowerCase() === "y";
}


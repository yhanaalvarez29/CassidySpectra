const readline = require("readline-sync");
const { createUpdater } = require("./updater");

const update = createUpdater();
const changes = update.changes;

console.log("Changes detected:");
console.log("Added:", changes.added.length ? changes.added.join("\n") : "None");
console.log(
  "Modified:",
  changes.modified.length ? changes.modified.join("\n") : "None"
);
console.log(
  "Removed:",
  changes.removed.length ? changes.removed.join("\n") : "None"
);

const proceed = readline
  .question("Do you want to proceed with the update? (yes/no): ")
  .toLowerCase();

if (proceed === "yes" || proceed === "y") {
  console.log("Proceeding with the update...");
  update();
  console.log("Update complete!");
} else {
  console.log("Update canceled.");
}

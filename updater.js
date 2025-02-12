const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { tmpdir } = require("os");

const defaultUrl = "https://github.com/lianecagara/CassidyRedux";

/**
 * Creates an updater module that fetches updates from a repository.
 *
 * @param {string} repoUrl - The repository URL to clone from.
 * @param {string} [branch="main"] - The branch name to fetch updates from.
 * The update function applies changes from the repository.
 *
 * The update function accepts an options object:
 *  @returns {((options: { dontReplace?: string[]; ignore?: string[] }) => void) & { changes: { added: string[]; modified: string[]; removed: string[] } }}
 * - `dontReplace` {string[]} - List of files that should not be replaced.
 * - `ignore` {string[]} - List of files that should be ignored.
 *  Usage:
 * ```js
 * const update = createUpdater("https://github.com/user/repo.git", "dev");
 * update({ dontReplace: ["config.json"], ignore: ["temp/"] });
 * ```
 */

function createUpdater(repoUrl = defaultUrl, branch = "main") {
  const tempDir = path.join(tmpdir(), "repo-update-" + Date.now());
  const backupDir = path.join(process.cwd(), "backup");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const localDir = process.cwd();

  console.log(`Cloning repository...`);
  execSync(`git clone --branch ${branch} --depth 1 ${repoUrl} ${tempDir}`, {
    stdio: "inherit",
  });

  const localPackageJson = path.join(localDir, "package.json");
  const tempPackageJson = path.join(tempDir, "package.json");

  let version = "unknown_version";
  if (fs.existsSync(localPackageJson)) {
    const pkg = JSON.parse(fs.readFileSync(localPackageJson, "utf-8"));
    version = pkg.version || "unknown_version";
  }

  const backupVersionDir = path.join(backupDir, version);

  const changes = getFileChanges(tempDir, localDir);

  function update(options = {}) {
    const { ignore = [], dontReplace = [] } = options;
    const updatedIgnore = [...ignore, ".git"];

    console.log(`Backing up current files to ${backupVersionDir}...`);
    backupFiles(localDir, backupVersionDir);

    console.log("Applying updates...");
    applyChanges(tempDir, localDir, changes, {
      ignore: updatedIgnore,
      dontReplace,
    });

    console.log("Cleaning up package.json...");
    cleanupPackageJson(localPackageJson);

    console.log("Update complete.");
  }

  update.changes = changes;

  return update;
}

/**
 * Get file changes between two directories
 * @param {string} tempDir - The downloaded repository path
 * @param {string} localDir - The current local project path
 * @returns {{ added: Array<string>, modified: Array<string>, removed: Array<string> }} - Added, modified, removed file lists
 */
function getFileChanges(tempDir, localDir) {
  const localFiles = listFiles(localDir);
  const tempFiles = listFiles(tempDir);

  const added = tempFiles.filter((file) => !localFiles.includes(file));
  const removed = localFiles.filter((file) => !tempFiles.includes(file));
  const modified = tempFiles.filter(
    (file) =>
      localFiles.includes(file) &&
      !filesAreEqual(path.join(tempDir, file), path.join(localDir, file))
  );

  return { added, modified, removed };
}

/**
 * List all files recursively in a directory
 * @param {string} dir - The directory to scan
 * @returns {string[]} - List of relative file paths
 */
function listFiles(dir, base = dir) {
  let fileList = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(base, fullPath);
    if (fs.statSync(fullPath).isDirectory()) {
      fileList = fileList.concat(listFiles(fullPath, base));
    } else {
      fileList.push(relativePath);
    }
  }
  return fileList;
}

/**
 * Check if two files are identical
 * @param {string} file1 - First file path
 * @param {string} file2 - Second file path
 * @returns {boolean} - True if files are identical, false otherwise
 */
function filesAreEqual(file1, file2) {
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) return false;
  return (
    fs.readFileSync(file1).toString() === fs.readFileSync(file2).toString()
  );
}

/**
 * Backup local files before updating
 * @param {string} source - Source directory
 * @param {string} destination - Backup directory
 */
function backupFiles(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  const files = listFiles(source);
  files.forEach((file) => {
    const srcPath = path.join(source, file);
    const destPath = path.join(destination, file);
    if (!fs.existsSync(path.dirname(destPath))) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
  });
}

/**
 * Apply file changes based on the update
 * @param {string} tempDir - Downloaded repository directory
 * @param {string} localDir - Local project directory
 * @param {Object} changes - Contains added, modified, removed files
 * @param {Object} options - Ignore or don't replace settings
 */
function applyChanges(tempDir, localDir, changes, options) {
  const { ignore, dontReplace } = options;

  changes.removed.forEach((file) => {
    if (!ignore.includes(file)) {
      fs.unlinkSync(path.join(localDir, file));
    }
  });

  [...changes.added, ...changes.modified].forEach((file) => {
    if (!ignore.includes(file) && !dontReplace.includes(file)) {
      const srcPath = path.join(tempDir, file);
      const destPath = path.join(localDir, file);
      if (!fs.existsSync(path.dirname(destPath))) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

/**
 * Remove "repository.url" from package.json
 * @param {string} packageJsonPath - Path to package.json
 */
function cleanupPackageJson(packageJsonPath) {
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    if (packageJson.repository && packageJson.repository.url) {
      delete packageJson.repository.url;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }
}

module.exports = {
  createUpdater,
  applyChanges,
  backupFiles,
  cleanupPackageJson,
  createUpdater,
  defaultUrl,
  filesAreEqual,
  getFileChanges,
  listFiles,
};

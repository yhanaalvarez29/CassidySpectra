const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { tmpdir } = require("os");

const defaultUrl = "https://github.com/lianecagara/CassidyRedux";

/**
 * @typedef {{ added: string[], modified: string[], removed: string[] }} Changes
 */

/**
 * Creates an updater function for synchronizing a repository.
 * @param {string} [repoUrl=defaultUrl] - The repository URL.
 * @param {string} [branch="main"] - The branch to pull updates from.
 * @param {object} [options={}] - Configuration options.
 * @param {string[]} [options.ignore=[]] - Files or directories to ignore.
 * @param {string[]} [options.dontReplace=[]] - Files not to replace.
 * @param {boolean} [options.dontDelete=false] - Whether to prevent deletion of removed files.
 * @returns {(() => void) & { changes: Changes }} The update function.
 */
function createUpdater(repoUrl = defaultUrl, branch = "main", options = {}) {
  const { ignore = [], dontReplace = [], dontDelete = false } = options;
  const updatedIgnore = [...ignore, ".git", "node_modules", ".env"];

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
  let version = "unknown_version";
  if (fs.existsSync(localPackageJson)) {
    const pkg = JSON.parse(fs.readFileSync(localPackageJson, "utf-8"));
    version = pkg.version || "unknown_version";
  }

  const backupVersionDir = path.join(backupDir, version);
  const changes = getFileChanges(tempDir, localDir, updatedIgnore);

  function update() {
    console.log(`Backing up current files to ${backupVersionDir}...`);
    backupFiles(localDir, backupVersionDir, changes);

    console.log("Applying updates...");
    applyChanges(tempDir, localDir, changes, {
      ignore: updatedIgnore,
      dontReplace,
      dontDelete,
    });

    console.log("Cleaning up package.json...");
    cleanupPackageJson(localPackageJson);

    console.log("Update complete.");
  }

  update.changes = changes;
  return update;
}

/**
 * Determines file changes between two directories.
 * @param {string} tempDir - The temporary directory containing new files.
 * @param {string} localDir - The local directory.
 * @param {string[]} ignore - Files or directories to ignore.
 * @returns {Changes} Added, modified, and removed files.
 */
function getFileChanges(tempDir, localDir, ignore) {
  const localFiles = listFiles(localDir, ignore);
  const tempFiles = listFiles(tempDir, ignore);

  return {
    added: tempFiles.filter((file) => !localFiles.includes(file)),
    removed: localFiles.filter((file) => !tempFiles.includes(file)),
    modified: tempFiles.filter(
      (file) =>
        localFiles.includes(file) &&
        !filesAreEqual(path.join(tempDir, file), path.join(localDir, file))
    ),
  };
}

/**
 * Recursively lists files in a directory, ignoring specified paths.
 * @param {string} dir - The base directory.
 * @param {string[]} ignore - Files or directories to ignore.
 * @param {string} [base=dir] - Base path for relative paths.
 * @returns {string[]} List of file paths.
 */
function listFiles(dir, ignore, base = dir) {
  let fileList = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(base, fullPath);
    if (ignore.some((pattern) => relativePath.startsWith(pattern))) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      fileList = fileList.concat(listFiles(fullPath, ignore, base));
    } else {
      fileList.push(relativePath);
    }
  }
  return fileList;
}

/**
 * Applies file changes from the temporary directory to the local directory.
 * @param {string} tempDir - The source directory.
 * @param {string} localDir - The target directory.
 * @param {object} changes - File changes.
 * @param {object} options - Update options.
 */
function applyChanges(tempDir, localDir, changes, options) {
  const { ignore, dontReplace, dontDelete } = options;

  if (!dontDelete) {
    changes.removed.forEach((file) => {
      if (!ignore.includes(file)) {
        fs.unlinkSync(path.join(localDir, file));
      }
    });
  }

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
 * Checks if two files are identical.
 * @param {string} file1 - First file path.
 * @param {string} file2 - Second file path.
 * @returns {boolean} True if files are equal, otherwise false.
 */
function filesAreEqual(file1, file2) {
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) return false;
  return (
    fs.readFileSync(file1).toString() === fs.readFileSync(file2).toString()
  );
}

/**
 * Backs up only modified and deleted files from one directory to another.
 * @param {string} source - The source directory.
 * @param {string} destination - The backup destination.
 * @param {Changes} changes - The changes to back up.
 */
function backupFiles(source, destination, changes) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  [...changes.modified, ...changes.removed].forEach((file) => {
    const srcPath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.existsSync(srcPath)) {
      if (!fs.existsSync(path.dirname(destPath))) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

/**
 * Cleans up the repository URL from package.json.
 * @param {string} packageJsonPath - Path to package.json.
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
  getFileChanges,
  listFiles,
};

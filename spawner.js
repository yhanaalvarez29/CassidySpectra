global.requireEsm = async function (url) {
  return await import(url);
};

global.discordJS = require("discord.js");

const originalExt = { ...require.extensions };
const { createRequire } = require("module");
const originalRequire = createRequire(__filename);
originalRequire.extensions = { ...originalExt };

global.originalRequire = originalRequire;
// imma modify some require extensions :)
const fs = require("fs-extra");
const { execSync } = require("child_process");
const path = require("path");
const axios = require("axios").default;

require.extensions[".txt"] = function (module, filename) {
  if (!fs.existsSync(filename)) {
    return "";
  }
  const file = fs.readFileSync(filename, "utf8");
  module.exports = file;
};

require.url = async function (url) {
  try {
    if (typeof url !== "string") {
      throw new TypeError(
        `The first argument (url) must be a string. Received ${typeof url}`
      );
    }
    const response = await axios.get(url);
    let fileContent = `${response.data}`;
    if (
      typeof response.data !== "string" &&
      typeof response.data !== "object"
    ) {
      throw new TypeError(
        `The url ${url} returned a non-string value. Received ${typeof response.data}`
      );
    } else if (typeof response.data === "object") {
      fileContent = JSON.stringify(response.data);
    }
    const filePath = `${__dirname}/require-${Date.now()}-${Math.floor(
      Math.random() * 1000000
    )}`;
    fs.writeFileSync(filePath, fileContent);
    const result = require(filePath);
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    const packagePath = path.join("node_modules", packageName);
    return fs.existsSync(packagePath);
  } catch (err) {
    return false;
  }
}
function ensureNPM(packageName) {
  if (!isPackageInstalled(packageName)) {
    try {
      console.log(`Installing ${packageName}...`);
      execSync(`npm install ${packageName}`, { stdio: "inherit" });

      console.log(`Running npm install to ensure it's audited...`);
      execSync("npm install", { stdio: "inherit" });
    } catch (err) {
      throw new Error(`Failed to install ${packageName}: ${err.message}`);
    }
  } else {
    console.log(`${packageName} is already installed.`);
  }
  return require(packageName);
}

require.ensure = function (moduleName) {
  if (moduleName.startsWith(".") || path.isAbsolute(moduleName)) {
    return require(moduleName);
  } else {
    return ensureNPM(moduleName);
  }
};
/*
const originalRequire = require;
const requireProxy = {
  apply(target, thisArg, argumentsList) {
    if (argumentsList[0] && !argumentsList[0].startsWith(".")) {
      ensureNPM(argumentsList[0]);
    }
    console.log("Module required:", argumentsList[0]);

    const requiredModule = Reflect.apply(target, thisArg, argumentsList);

    return requiredModule;
  },
};

require = new Proxy(originalRequire, requireProxy);
*/
// console.log(Error.prepareStackTrace.toString());

// finally execute main file :)
require("ts-node").register();

const { secureRandom } = require("./CommandFiles/modules/unisym");

Math.randomOriginal = Math.random.bind(Math);
Math.random = secureRandom;

const genericErrReg = [
  {
    regex: /^(?!null|undefined)(.*) is not a function$/,
    callback: (match) =>
      `EXC: TYPE_MISMATCH - '${match[1]}' not callable (expected void(*)())`,
  },
  {
    regex: /(undefined|null) is not a function/,
    callback: (match) =>
      `EXC: SIGILL - Illegal Function Call (${
        match[1] == "undefined" ? "void*" : "nullptr"
      } deref)`,
  },
  {
    regex: /cannot read propert(y|ies) '.*' of (undefined|null)/,
    callback: (match) =>
      `EXC: SEGFAULT - Invalid Memory Access (${
        match[2] == "undefined" ? "uninit ptr" : "nullptr"
      })`,
  },
  {
    regex: /TypeError: (.*) is not a (function|object|.*)/,
    callback: (match) =>
      `TYPERR: Invalid Typeid - '${match[1]}' mismatches '${match[2]}*'`,
  },
  {
    regex: /ReferenceError: (.*) is not defined/,
    callback: (match) =>
      `LD_ERR: Unresolved Symbol '${match[1]}' - Missing Definition`,
  },
];

const stackFrameReg = [
  {
    regex: /^\s*at\s+(?:(.+?)\s+)?(?:\(([^)]*?)(?::(\d+))?(?::(\d+))?\))?$/i,
    callback: (match, index) => {
      let funcName = match[1] || "<anonymous>";
      if (funcName === "<anonymous>" || !funcName) {
        funcName = "0xCAFEBABE";
      } else if (funcName.startsWith("async")) {
        funcName = `Future<${funcName.replace("async", "").trim()}>`;
      }

      const fileName = match[2] || "<INVALID_MEM>";
      const lineNo = match[3] || "ERR";
      const colNo = match[4] || "FF";
      const addr = `0x${(0xdead0000 + index * 0x1000)
        .toString(16)
        .toUpperCase()}`;
      return `#${index}  ${addr}  ${funcName}()  ${fileName}  [${lineNo}:${colNo}]`;
    },
  },
  {
    regex: /^\s*at\s+([^\s]+)\s+([^:]+)$/,
    callback: (match, index) => {
      const funcName = match[1] === "<anonymous>" ? "0xCAFEBABE" : match[1];
      const fileName = match[2] || "<INVALID_MEM>";
      const addr = `0x${(0xdead0000 + index * 0x1000)
        .toString(16)
        .toUpperCase()}`;
      return `#${index}  ${addr}  ${funcName}()  ${fileName}  [ERR:FF]`;
    },
  },
  {
    regex: /^\s*at\s+<anonymous>$/,
    callback: (match, index) => {
      const addr = `0x${(0xdead0000 + index * 0x1000)
        .toString(16)
        .toUpperCase()}`;
      return `#${index}  ${addr}  0xCAFEBABE()  <INVALID_MEM>  [ERR:FF]`;
    },
  },
];
let origStack = Error.prepareStackTrace;

Error.prepareStackTrace = (error, structuredStack) => {
  const defaultStack = origStack(error, structuredStack);
  const lines = defaultStack.split("\n");

  let errMsg = lines[0];
  for (const { regex, callback } of genericErrReg) {
    const match = errMsg.match(regex);
    if (match) {
      errMsg = callback(match);
      break;
    }
  }

  const transformedStack = lines.slice(1).map((line, index) => {
    let transformed = line;
    for (const { regex, callback } of stackFrameReg) {
      const match = line.match(regex);
      if (match) {
        transformed = callback(match, index);
        break;
      }
    }
    return transformed;
  });

  return `${errMsg}\n[STACK TRACE] Runtime Environment:\n${transformedStack.join(
    "\n"
  )}\n[TRACE TERMINATED]`;
};

require("./Cassidy");

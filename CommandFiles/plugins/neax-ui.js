import test from "node:test";
import { OutputFileType } from "typescript";

export const meta = {
  name: "neax-ui",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "Pre-Made Unicode Components",
  supported: "^1.0.0",
  order: 1,
  type: "plugin",
};

class UNISym {
  static burger = "☰"; // burger menu
  static standardLine = "━━━━━━━━━━━━━━━"; // Line
  static section = "§"; // Section sign
  static paragraph = "¶"; // Pilcrow sign
  static registered = "®"; // Registered trademark sign
  static trademark = "™"; // Trademark sign
  static copyright = "©"; // Copyright sign
  static degree = "°"; // Degree sign
  static micro = "µ"; // Micro sign
  static bullet = "•"; // Bullet
  static enDash = "–"; // En dash
  static emDash = "—"; // Em dash
  static prime = "′"; // Prime
  static doublePrime = "″"; // Double prime
  static daggers = "†"; // Dagger
  static doubleDagger = "‡"; // Double dagger
  static ellipsis = "…"; // Ellipsis
  static infinity = "∞"; // Infinity symbol
  static currency = "¤"; // Generic currency sign
  static yen = "¥"; // Yen sign
  static euro = "€"; // Euro sign
  static pound = "£"; // Pound sign
  static plusMinus = "±"; // Plus-minus sign
  static approximately = "≈"; // Approximately equal to
  static notEqual = "≠"; // Not equal to
  static lessThanOrEqual = "≤"; // Less than or equal to
  static greaterThanOrEqual = "≥"; // Greater than or equal to
  static summation = "∑"; // Summation sign
  static integral = "∫"; // Integral sign
  static squareRoot = "√"; // Square root sign
  static partialDifferential = "∂"; // Partial differential
  static angle = "∠"; // Angle
  static degreeFahrenheit = "℉"; // Degree Fahrenheit
  static degreeCelsius = "℃"; // Degree Celsius

  // Decorative Symbols
  static floralHeart = "❧"; // Floral Heart
  static starFlower = "✻"; // Star Flower
  static heavyStar = "★"; // Heavy Star
  static sparkle = "✦"; // Sparkle
  static asterisk = "✱"; // Asterisk
  static heavyCheckMark = "✔"; // Heavy Check Mark
  static heavyBallotX = "✖"; // Heavy Ballot X
  static heart = "♥"; // Heart
  static diamond = "♦"; // Diamond
  static club = "♣"; // Club
  static spade = "♠"; // Spade
  static musicalNote = "♪"; // Musical Note
  static doubleMusicalNote = "♫"; // Double Musical Note
  static snowflake = "❄"; // Snowflake
  static sparkleStar = "✨"; // Sparkle Star
  static anchor = "⚓"; // Anchor
  static umbrella = "☔"; // Umbrella
  static hourglass = "⌛"; // Hourglass
  static hourglassNotDone = "⏳"; // Hourglass Not Done
}

class NeaxUI {
  constructor(ctx) {
    this.ctx = ctx;
    this.menuBarOpts = new OptionsList();
    this.menuHandlers = {};
    this.menuSeparator = " | ";
    this.menuTransformer = (i) => `**${i}**`;
    global.logger("NeaxUI initialized", "info");
  }

  assign(...obj) {
    Object.assign(this, ...obj);
  }

  onMenuBar(...args) {
    if (args.length < 2) {
      throw new Error(
        "At least one menu option and a callback function are required."
      );
    }
    const opts = Array.from(args);
    const callback = opts.pop();
    if (typeof callback !== "function") {
      throw new Error("The last argument must be a callback function.");
    }
    for (const option of opts) {
      this.menuHandlers[option] ??= [];
      this.menuHandlers[option].push(callback);
      global.logger(`Callback added for menu option: ${option}`, "info");
    }
  }
  createUI({
    beforeHeader = "",
    afterHeader = "",
    content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    beforeFooter = "",
    afterFooter = "",
    menuBar = null,
    guideBar = null,
    menuTransformer,
    menuSeparator,
  } = {}) {
    const list = this.menuBarOpts.r;
    const mappings = list
      .map(menuTransformer ?? this.menuTransformer)
      .join(menuSeparator ?? this.menuSeparator);
    const menu = menuBar ?? mappings;
    const guide =
      guideBar ??
      `***Type "option:{key}" to trigger an option in the menu, replace {key} with the desired option.***`;
    content = `\n${content}\n`;
    let result = ``;
    for (const item of [
      beforeHeader,
      menu,
      afterHeader,
      content,
      beforeFooter,
      guide,
      afterFooter,
    ]) {
      if (item) {
        result += `${item}\n`;
      }
    }
    return result;
  }
  async replyListen(optionsX, loopCondition = () => false) {
    global.logger("Reply with UI and listening for options", "info");
    const { cassIO } = this.ctx;

    const ui = this.createUI(optionsX);
    const info = await cassIO.out(ui);
    global.logger(`UI sent with messageID: ${info.messageID}`, "info");
    let count = 0;
    const setCount = (i) => (count = i);
    do {
      await this.listenOption(info.messageID);
    } while (await loopCondition(count, setCount));
    return info;
  }
  async listenOption(messageID, ...optionNames) {
    optionNames = optionNames.length > 0 ? optionNames : [...this.menuBarOpts];
    const { cassIO } = this.ctx;
    let targetOption;
    const neax = this;
    const eventData = await cassIO.in({
      messageID,
      test: (input) => input.words[0].toLowerCase().startsWith("option:"),
      async callback(ctx) {
        targetOption = optionNames.find(
          (opt) =>
            opt.toLowerCase() ===
            ctx.input.words[0].replace("option:", "").toLowerCase()
        );
        global.logger(
          `Listening for options: ${optionNames.join(", ")}`,
          "info"
        );
        if (!neax.menuHandlers[targetOption]) {
          const fallback = neax.menuHandlers[":nohandler"] ?? [];
          for (const handler of fallback) {
            global.logger(
              `Executing fallback handler for option: ${targetOption}`,
              "info"
            );
            await handler(ctx);
          }
          return;
        }
        ctx.repObj.resolve(ctx);
      },
      full: true,
    });

    for (const handler of this.menuHandlers[targetOption]) {
      global.logger(`Executing handler for option: ${targetOption}`, "info");
      await handler(eventData);
    }
  }
}
class OptionsList {
  constructor(array) {
    this.raw = Array.from(array ?? []);
  }

  add(...options) {
    options.forEach((option) => {
      if (!this.contains(option)) {
        this.raw.push(option);
      }
    });
  }

  remove(option) {
    this.raw = this.raw.filter((item) => item !== option);
  }

  contains(option) {
    return this.raw.includes(option);
  }

  clear() {
    this.raw.length = 0;
  }

  size() {
    return this.raw.length;
  }

  getOptions() {
    return [...this.raw];
  }

  toString() {
    return this.raw.join(", ");
  }

  log() {
    console.log(this.getOptions());
  }

  forEach(callback) {
    this.raw.forEach(callback);
  }

  get r() {
    return this.raw;
  }

  get rBold() {
    return this.r.map((i) => `**${i}**`).join(" ");
  }

  *[Symbol.iterator]() {
    yield* this.r;
  }
}

class FileNotFoundError extends Error {
  constructor(path) {
    super(
      `File not found: "${path}". Please check the path and ensure the file exists.`
    );
    this.name = "FileNotFoundError";
  }
}

class DirectoryNotFoundError extends Error {
  constructor(path) {
    super(
      `Directory not found: "${path}". Please check the path and ensure the directory exists.`
    );
    this.name = "DirectoryNotFoundError";
  }
}

export class VirtualFiles {
  static fileTypeEmojis = {
    pdf: "📄",
    doc: "📝",
    docx: "📃",
    xls: "📊",
    xlsx: "📈",
    ppt: "📉",
    txt: "🗒️",
    csv: "📊",
    jpg: "🖼️",
    png: "🌄",
    gif: "🎞️",
    mp3: "🎵",
    mp4: "📹",
    zip: "📦",
    rar: "📦",
    html: "🌐",
    css: "🎨",
    js: "💻",
    json: "📜",
    java: "☕",
    python: "🐍",
    javascript: "📜",
    xml: "📄",
    html: "🌐",
    css: "🎨",
    "c++": "💻",
    "c#": "🔵",
    ruby: "💎",
    go: "🚀",
    php: "🐘",
    markdown: "✍️",
    yaml: "🗂️",
    swift: "🍏",
  };

  static getFileEmoji(fileName = "root") {
    const extension = fileName.split(".").pop().toLowerCase();
    return this.fileTypeEmojis[extension] || "📁";
  }

  static DirectoryNotFoundError = DirectoryNotFoundError;
  static FileNotFoundError = FileNotFoundError;

  constructor(data = {}) {
    this.data = { mainDir: [], ...data };
  }

  raw() {
    return this.data;
  }

  mkdir(path) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      let dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        dir = { name: part, content: [], lastModified: Date.now() };
        currentDir.push(dir);
      } else if (!Array.isArray(dir.content)) {
        console.error(`Invalid structure for directory: ${part}`);
        dir.content = [];
      }
      currentDir = dir.content;
    }
  }

  mkdirOld(path) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      let dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        dir = { name: part, content: [], lastModified: Date.now() };
        currentDir.push(dir);
      }
      currentDir = dir.content;
    }
  }

  writeFile(path, content) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!part) continue;
      let dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        console.warn(`Parent directory missing, creating: ${part}`);
        this.mkdir(parts.slice(0, i + 1).join("/"));
        dir = currentDir.find((item) => item.name === part);
      }
      currentDir = dir.content;
    }

    const fileName = parts[parts.length - 1];
    const existingFile = currentDir.find((item) => item.name === fileName);
    if (existingFile) {
      existingFile.content = content;
      existingFile.lastModified = Date.now();
    } else {
      currentDir.push({ name: fileName, content, lastModified: Date.now() });
    }
  }

  writeFileOld(path, content) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        throw new DirectoryNotFoundError(part);
      }
      currentDir = dir.content;
    }

    const fileName = parts[parts.length - 1];
    const file = { name: fileName, content, lastModified: Date.now() };

    const existingFile = currentDir.find((item) => item.name === fileName);
    if (existingFile) {
      existingFile.content = content;
      existingFile.lastModified = Date.now();
    } else {
      currentDir.push(file);
    }
  }

  readFile(path) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        throw new FileNotFoundError(part);
      }
      currentDir = dir.content;
    }

    if (currentDir.length === 0) {
      throw new FileNotFoundError(path);
    }

    return currentDir;
  }

  exists(path) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        return false;
      }
      currentDir = dir.content;
    }

    return true;
  }

  unlink(path) {
    const parts = path.split("/");
    const fileName = parts.pop();
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        throw new DirectoryNotFoundError(part);
      }
      currentDir = dir.content;
    }

    const index = currentDir.findIndex((item) => item.name === fileName);
    if (index !== -1) {
      currentDir.splice(index, 1);
      return true;
    }
    throw new FileNotFoundError(fileName);
  }

  rmdir(path) {
    const parts = path.split("/");
    const dirName = parts.pop();
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        throw new DirectoryNotFoundError(part);
      }
      currentDir = dir.content;
    }

    const index = currentDir.findIndex((item) => item.name === dirName);
    if (index !== -1) {
      currentDir.splice(index, 1);
      return true;
    }
    throw new DirectoryNotFoundError(dirName);
  }

  readdir(path) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        throw new DirectoryNotFoundError(part);
      }
      currentDir = dir.content;
    }

    return currentDir.map((item) => item.name);
  }

  stat(path) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir) {
        throw new FileNotFoundError(part);
      }
      currentDir = dir.content;
    }

    const itemStat = {
      name: currentDir.name,
      type: currentDir.length ? "directory" : "file",
      lastModified: currentDir.lastModified,
      size: currentDir.length ? 0 : currentDir.content.length,
    };

    return itemStat;
  }

  toString(path = "/") {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    if (path) {
      for (let part of parts) {
        if (!part) continue;
        const dir = currentDir.find((item) => item.name === part);
        if (!dir) {
          return `[Error]`;
        }
        currentDir = dir.content;
      }
    }

    const output = this._buildString(currentDir);
    return output;
  }

  _buildString(directory, level = 0) {
    let result = "";
    const indent = "-".repeat(level);

    for (const item of directory) {
      const emoji = VirtualFiles.getFileEmoji(item.name);
      if (Array.isArray(item.content)) {
        result += `${indent}${emoji} ${item.name}/\n`;
        result += this._buildString(item.content, level + 1);
      } else {
        result += `${indent}${emoji} ${item.name}\n`;
      }
    }

    return result;
  }

  isDirectory(path) {
    const parts = path.split("/");
    let currentDir = this.data.mainDir;

    for (let part of parts) {
      if (!part) continue;
      const dir = currentDir.find((item) => item.name === part);
      if (!dir || !Array.isArray(dir.content)) {
        return false;
      }
      currentDir = dir.content;
    }

    return true;
  }
}

export async function use(obj) {
  obj.UNISym = UNISym;
  obj.OptionsList = OptionsList;
  obj.NeaxUI = NeaxUI;
  obj.VirtualFiles = VirtualFiles;
  obj.neaxUI = new NeaxUI(obj);
  return obj.next();
}

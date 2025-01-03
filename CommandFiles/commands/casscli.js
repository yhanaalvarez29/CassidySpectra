import { CLIParser } from "../modules/cliparser.js";

export const meta = {
  name: "casscli",
  author: "Liane Cagara",
  description:
    "CassCLI is a command-line interface subsystem for interacting with the Cassidy Redux chatbot. It allows users to input and execute commands in a terminal-like environment, enabling a powerful and streamlined experience for managing bot functions and settings.",
  usage:
    "Use CassCLI to interact with the bot using simple text-based commands. Example usage: `casscli > help`, `casscli > status`, `casscli > list commands`.",
  version: "1.0.0",
  permissions: [0, 1, 2],
  botAdmin: false,
  noPrefix: false,
  requirement: "2.5.0",
  otherNames: ["ccli", "cbox", "cassbox"],
  waitingTime: 0.01,
};

import util from "util";
import { VirtualFiles } from "../plugins/neax-ui.js";
const { TextEncoder } = util;

export const style = {
  title: "💻 CassCLI",
  titleFont: "bold",
  contentFont: "none",
};

export async function entry({ input, output, money }) {
  const parser = new CLIParser();
  const userData = await money.get(input.senderID);
  const vf = new VirtualFiles(userData.virtualFiles ?? []);

  parser.registerCommand({
    command: "stateget",
    usage: "stateget <uid | 'self'> <key | 'all'>",
    description:
      "Retrieve information about the specified user's state from the database. You can query either your own state or the state of another user using their UID. The query returns the value associated with the given key.",
    async handler({ args, flags }) {
      if (args.length < 3) {
        return `error: missing arguments. Usage: ${this.usage}`;
      }

      const uid = args[1] === "self" ? input.senderID : args[1];

      if (!uid || typeof uid !== "string" || uid.trim() === "") {
        return `error: invalid UID. Please provide a valid UID or 'self'.`;
      }

      const data = uid === input.senderID ? userData : await money.get(uid);

      if (!data) {
        return `error: no data found for user with UID: ${uid}.`;
      }

      const key = args[2] === "all" || !args[1] ? "all" : args[2];

      if (key !== "all" && !data[key]) {
        return `error: invalid key '${key}'. Available keys: ${Object.keys(
          data
        ).join(", ")}`;
      }

      const target = key === "all" ? data : data[key];

      return `${util.inspect(target, { showHidden: false, depth: 1 })}`;
    },
  });

  parser.registerCommand({
    command: "ls",
    usage: "ls <optional path>",
    description:
      "Lists the contents of a directory. If no path is specified, it lists the contents of the root directory.",
    async handler({ args }) {
      const path = args[1] || "/";
      const items = vf.readdir(path);
      return items.length > 0
        ? `${items.join("  ")}`
        : "No files or directories found.";
    },
  });

  parser.registerCommand({
    command: "cat",
    usage: "cat <path>",
    description: "Displays the content of a file at the specified path.",
    async handler({ args }) {
      const path = args[1];
      const data = vf.readFile(path);
      return data;
    },
  });

  const MAX_FILE_SIZE = 100 * 1024;
  parser.registerCommand({
    command: "write",
    usage: "write <path> <content>",
    description:
      "Writes content to a virtual file at the specified path, with a 100KB size limit.",
    async handler({ args }) {
      const path = args[1];
      const content = args.slice(2).join(" ");

      if (new TextEncoder().encode(content).length > MAX_FILE_SIZE) {
        return "Error: File content exceeds the 100KB size limit.";
      }

      await vf.writeFile(path, content);
      await money.set(input.senderID, {
        virtualFiles: vf.raw(),
      });
      return `File ${path} has been updated with new content.`;
    },
  });

  parser.registerCommand({
    command: "rm",
    usage: "rm <path>",
    description: "Removes a virtual file at the specified path.",
    async handler({ args }) {
      const path = args[1];

      if (!vf.exists(path)) {
        return `Error: File ${path} does not exist.`;
      }

      vf.unlink(path);

      await money.set(input.senderID, {
        virtualFiles: vf.raw(),
      });

      return `File ${path} has been successfully removed.`;
    },
  });

  parser.registerCommand({
    command: "echo",
    usage: "echo <message> or echo <message> >> <file-path>",
    description: "Echoes a message or redirects content to a file using >>.",
    async handler({ args }) {
      const redirectIndex = args.indexOf(">>");

      if (redirectIndex === -1) {
        if (args.length < 2) {
          return "Error: No message provided. Usage: echo <message>";
        }
        const message = args.slice(1).join(" ");
        return message;
      }

      const content = args.slice(0, redirectIndex).join(" ");
      const filePath = args[redirectIndex + 1];

      if (!filePath) {
        return "Error: Missing file path after >>.";
      }

      if (!content) {
        return "Error: Missing content before >>.";
      }

      if (!vf.exists(filePath)) {
        return `Error: File ${filePath} does not exist.`;
      }

      const existingContent = vf.readFile(filePath);
      const newContent = existingContent + "\n" + content;

      vf.writeFile(filePath, newContent);

      await money.set(input.senderID, {
        virtualFiles: vf.raw(),
      });

      return `Content has been successfully added to ${filePath}.`;
    },
  });

  parser.registerCommand({
    command: "mv",
    usage: "mv <old-path> <new-path>",
    description: "Renames a virtual file from <old-path> to <new-path>.",
    async handler({ args }) {
      if (args.length < 3) {
        return "Error: Missing arguments. Usage: mv <old-path> <new-path>";
      }

      const oldPath = args[1];
      const newPath = args[2];

      if (!vf.exists(oldPath)) {
        return `Error: File ${oldPath} does not exist.`;
      }

      if (vf.exists(newPath)) {
        return `Error: File ${newPath} already exists.`;
      }

      const content = vf.readFile(oldPath);

      vf.writeFile(newPath, content);

      vf.unlink(oldPath);

      await money.set(input.senderID, {
        virtualFiles: vf.raw(),
      });

      return `File has been renamed from ${oldPath} to ${newPath}.`;
    },
  });

  parser.registerCommand({
    command: "help",
    usage: "help <optional command>",
    description:
      "Displays help information for a specific command or all commands.",
    async handler({ args, flags }) {
      return `**Welcome to CassidyCLI v${
        meta.version
      }**\n\n***Available Commands:***\n\n${parser.showHelp(args[1] || null)}`;
    },
  });
  const pt = await parser.parse(input.arguments.join(" ") || "help");
  if (pt) {
    output.reply(pt);
  }
}

#!/usr/bin/env node

import { exec } from "child_process";

export const meta = {
  name: "npm",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "Execute npm commands",
  usage: "{prefix}npm <command>",
  category: "Utilities",
  permissions: [2],
  waitingTime: 5,
  noPrefix: false,
  whiteList: null,
  ext_plugins: {},
  requirement: "2.5.0",
  icon: "🔧",
};

export const style = {
  title: "NPM Command 🔧",
  titleFont: "bold",
  contentFont: "fancy",
};

export async function entry({ output, input }) {
  output.reaction("⏳");

  const command = input.arguments.join(" ");
  if (!command) {
    await output.reply("❌ Please provide a command to execute.");
    return;
  }
  let foo;
  if (!input.isWeb) {
    foo = await output.reply(`⚙️ Executing Command....`);
  }

  let result = "";

  const childProcess = exec(`npm ${command}`, (error, stdout, stderr) => {
    if (stdout) result += stdout;
    if (stderr) result += stderr;
    if (error) result += error;

    // Don't call output.edit here
  });

  childProcess.on("close", () => {
    output.reaction("✅");
    if (foo) {
      output.edit(
        `✅ Command executed successfully:\n\n${result}`,
        foo.messageID,
      );
    } else {
      output.reply(`✅ Command executed successfully!\n\n${result}`);
    }
  });
}

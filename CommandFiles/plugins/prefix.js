import {
  getCommandByFileName,
  getLatestCommands,
  UNIRedux,
} from "../modules/unisym.js";

export const meta = {
  name: "prefix",
  author: "Liane Cagara",
  version: "2.5.0",
  description: "Nothing special.",
  supported: "^2.5.0",
  order: 4,
  type: "plugin",
};

export async function use(obj) {
  const {
    input,
    output,
    icon,
    prefix,
    popularCMD,
    recentCMD,
    prefixes,
    commands,
  } = obj;
  if (
    input.text?.toLowerCase() === "prefix" ||
    input.text?.toLowerCase() === "cassidy"
  ) {
    const latestCommands = await getLatestCommands(
      process.cwd() + "/CommandFiles/commands"
    );
    const populars = Object.entries(popularCMD)
      .sort((a, b) => b[1] > a[1])
      .map((i) => i[0]);

    const cutLatest = latestCommands
      .slice(0, 10)
      .map((i) => getCommandByFileName(i, commands)?.meta?.name)
      .filter(Boolean);

    console.log(cutLatest);

    const myRecent = recentCMD[input.senderID] ?? [];
    output.reply(`${UNIRedux.redux}
${UNIRedux.standardLine}
✨ | **System Prefix:** [ ${prefix} ]
🌠 | **Other Prefixes:** [ ${prefixes.slice(1).join(", ")} ]
${UNIRedux.standardLine}
📅 | **Latest Commands**:

${
  cutLatest.length > 0
    ? cutLatest.map((i) => `${UNIRedux.disc} ${prefix}${i}`).join("\n")
    : `No latest commands.`
}
${UNIRedux.standardLine}
🔥 | **Popular Commands**:

${
  populars.length > 0
    ? populars
        .toReversed()
        .slice(0, 10)
        .map((i) => `${UNIRedux.disc} ${prefix}${i}`)
        .join("\n")
    : `No popular commands.`
}
${UNIRedux.standardLine}
🕒 | **Recent Commands**:

${
  myRecent.length > 0
    ? myRecent
        .toReversed()
        .slice(0, 10)
        .map((i) => `${UNIRedux.disc} ${prefix}${i}`)
        .join("\n")
    : `No recent commands.`
}
${UNIRedux.standardLine}
Type "${prefix}help" without quotation to view more commands!`);
  } else {
    obj.next();
  }
}

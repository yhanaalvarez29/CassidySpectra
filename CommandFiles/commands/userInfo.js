export const meta = {
  name: "userInfo",
  description: "Check user's info",
  author: "Liane",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "User Management",
  permissions: [0],
  noPrefix: "both",
  noWeb: true,
  requirement: "2.5.0",
  icon: "📛",
};

export async function entry({ input, output, userInfos, args }) {
  const { fonts } = global.utils;
  let ID = input.detectID || input.senderID;
  if (args[0] === "raw") {
    return output.reply(`${ID}`);
  }
  if (args[0] === "tid") {
    return output.reply(`${input.threadID}`);
  }
  const info = await userInfos.get(ID);
  await output.reply(`📛 ${fonts.bold(`${info.name}`)}${
    info.vanity ? `\n📝 ${fonts.sans(`${info.vanity}`)}` : ""
  }${info.alternateName ? `\n✨ ${fonts.sans(`${info.alternateName}`)}` : ""}
${fonts.sans(`${info.gender === 1 ? "👧 Female" : "👦 Male"}`)}

𝙄𝘿: ${ID}
𝙏𝙄𝘿: ${input.threadID}`);
}

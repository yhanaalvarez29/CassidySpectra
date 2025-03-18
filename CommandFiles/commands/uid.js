export const meta = {
  name: "gameid",
  description: "Check game senderID",
  author: "Liane",
  version: "1.0.1",
  usage: "{prefix}{name}",
  category: "Utilities",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
  requirement: "2.5.0",
  otherNames: ["uid"],
  icon: "🎮",
  noLevelUI: true,
};

export async function entry({ input, output }) {
  output.reply(`${input.detectID ?? input.senderID}`);
}

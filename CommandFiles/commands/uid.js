export const meta = {
  name: "gameid",
  description: "Check game senderID",
  author: "Liane",
  version: "1.0.1",
  usage: "{prefix}{name}",
  category: "Fun",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
};

export async function entry({ input, output }) {
  output.reply(`🎲 **Game ID**:\n\n${input.detectID ?? input.senderID}`);
}

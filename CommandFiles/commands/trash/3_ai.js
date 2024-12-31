export const meta = {
  name: "ai",
  author: "Liane Cagara",
  otherNames: ["gpt", "chatgpt", "axis"],
  version: "1.0.1",
  description: "AI Chatbot",
  usage: "{prefix}ai <message>",
  category: "AI",
  permissions: [0, 1, 2],
  waitingTime: 5,
  noPrefix: "both",
  whiteList: null,
  ext_plugins: {
    requester: "^1.2.0",
  },
};

export async function entry({
  input,
  output,
  api,
  event,
  requester,
  repObj,
  commandName,
  detectID,
}) {
  const question = input.arguments.join(" ");
  if (!question) {
    return output.reply(`❌ | Missing query!`);
  }
  let info;
  const logo = `🤖 𝗔𝘅𝗶𝘀`;
  output.reaction("⏳");
  if (!input.isWeb) {
    info = await output.reply(logo + "\n\nFetching...");
  }
  const {
    response: { raw: answer },
    response,
  } = await requester(`https://liaspark.chatbotcommunity.ltd/ask/axis`, {
    query: question,
  });
  if (response.error) {
    if (info) {
      return output.edit(
        `${logo}\n\nAn error occured: ${response.error.message}`,
        info.messageID,
      );
    }
    return output.reply(`${logo}\n\nAn error occured: ${response.error}`);
  }
  if (info) {
    output.edit(logo + "\n\n" + answer, info.messageID);
    output.reaction("✅");
    input.setReply(info.messageID, {
      key: commandName,
    });
  } else {
    output.reply(logo + "\n\n" + answer);
  }
}
export const reply = entry;

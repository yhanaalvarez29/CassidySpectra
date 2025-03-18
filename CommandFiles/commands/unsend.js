export const meta = {
  name: "unsend",
  aliases: ["uns"],
  version: "1.1.0",
  author: "NTKhang // converted By MrkimstersDev",
  permissions: [0],
  category: "Utilities",
  description: "Unsend bot's message",
  usage: "Reply to the bot's message and call the command",
  guide: {
    en: "Reply to the message you want to unsend and call the command `{pn}`.",
  },
};

const langs = {
  en: {
    syntaxError: "Please reply to the bot's message you want to unsend.",
  },
};

export async function entry({ input, output, event, api }) {
  if (
    !event.messageReply ||
    event.messageReply.senderID !== api.getCurrentUserID()
  ) {
    return output.reply(langs.en.syntaxError);
  }

  try {
    await api.unsendMessage(event.messageReply.messageID);
    console.log("Message unsent successfully.");
  } catch (error) {
    console.error(`Failed to unsend message: ${error.message}`);
    await output.reply("❌ | Failed to unsend the message. Please try again.");
  }
}

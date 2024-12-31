export const meta = {
  name: "hi",
  author: "Liane Cagara",
  otherNames: ["hello", "hey"],
  version: "1.0.0",
  description: "Testing?",
  usage: "{prefix}{name}{property}<message>",
  category: "System",
  permissions: [0, 1, 2],
  waitingTime: 5,
  noPrefix: false,
  whiteList: null,
  ext_plugins: {
    "requester": "^1.2.0"
  }
};

export const entry = {
  async test({ input, output, commandName }) {
  if (input.arguments[0] === "Error" && input.arguments[1]) {
    throw new Error(input.arguments.slice(1).join(" "));
  }
  const messageInfo = await output.reply("Hello wazzup, you said " + (input.arguments.join(" ") || "none.") + "\nYour sender ID is " + input.senderID + " and thread id is: " + input.threadID);
  
  output.reaction("💜");
  input.setReply(messageInfo.messageID, {
    key: commandName
  });
},
  async debug({ output, input }) {
    output.reply(JSON.stringify(input, null, 2));
  }
}

export async function reply({ output, repObj, input, detectID, commandName }) {
  
  input.delReply(detectID);
  const messageInfo = await output.reply(`Why the hell are you replying to me?`);
  output.reaction("😭");
  input.setReply(messageInfo.messageID, {
    key: commandName
  });
}


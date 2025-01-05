import { ReduxCMDHome } from "../modules/reduxCMDHome.js";

export const meta = {
  name: "admin",
  author: "Liane Cagara 🎀",
  noPrefix: false,
  version: "1.0.4",
  description: "Manage admins.",
  usage: "admin[prop] [command]",
  permissions: [0, 1, 2],
  requirement: "2.5.0",
  icon: "",
  category: "User Management",
};
const { Cassidy } = global;
export const style = {
  title: "Admins 👑",
  titleFont: "bold",
  contentFont: "fancy",
};

export const entryConfig = {
  async addmod({ input, output, args, userInfos }) {
    const { MODERATORBOT, ADMINBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot add moderators.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to add. Either reply/mention or add the ID to args[0]."
      );
    }
    const { name } = await userInfos.get(ID);
    if (MODERATORBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is already a moderator.`);
    }
    if (ADMINBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is an admin.`);
    }

    MODERATORBOT.push(ID);
    Cassidy.config.MODERATORBOT = MODERATORBOT;
    return output.reply(`✅ | ${name} (${ID}) is now a moderator.`);
  },
  async removemod({ input, output, args, userInfos }) {
    const { MODERATORBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot remove moderators.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to remove. Either reply/mention or add the ID to args[0]."
      );
    }
    if (ID.startsWith("web:") || ID.startsWith("wss:main")) {
      return output.reply(`❌ | Web users and wss main cannot be moderator!`);
    }

    const { name } = await userInfos.get(ID);
    if (!MODERATORBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is not a moderator.`);
    }
    Cassidy.config.MODERATORBOT = MODERATORBOT.filter((item) => item !== ID);
    return output.reply(`✅ | ${name} (${ID}) no longer a moderator.`);
  },

  async add({ input, output, args, userInfos }) {
    const { ADMINBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot add admins.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to add. Either reply/mention or add the ID to args[0]."
      );
    }
    if (ID.startsWith("web:") || ID.startsWith("wss:main")) {
      return output.reply(`❌ | Web users and wss main cannot be admin!`);
    }
    const { name } = await userInfos.get(ID);
    if (ADMINBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is already an admin.`);
    }
    ADMINBOT.push(ID);
    Cassidy.config.ADMINBOT = ADMINBOT;
    return output.reply(`✅ | ${name} (${ID}) is now an admin.`);
  },
  async remove({ input, output, args, userInfos }) {
    const { ADMINBOT } = Cassidy.config;
    if (!input.isAdmin) {
      return output.reply(`❌ | You cannot remove admins.`);
    }
    const ID = input.detectID || args[0];
    if (!ID) {
      return output.reply(
        "❌ | Please specify the ID to remove. Either reply/mention or add the ID to args[0]."
      );
    }
    const { name } = await userInfos.get(ID);
    if (!ADMINBOT.includes(ID)) {
      return output.reply(`❌ | ${name} (${ID}) is not an admin.`);
    }
    Cassidy.config.ADMINBOT = ADMINBOT.filter((item) => item !== ID);
    return output.reply(`✅ | ${name} (${ID}) no longer an admin.`);
  },
  async list({ output, input, userInfos, outputOld }) {
    const { ADMINBOT, MODERATORBOT } = Cassidy.config;
    const concat = [...MODERATORBOT, ...ADMINBOT];
    let result = `Total of ${concat.length} admins and moderators:\n\n`;
    let n = 1;
    result += `👑 ***Admins***:\n`;
    for (const admin of ADMINBOT) {
      const { name } = await userInfos.get(admin);
      result += `${n}. ${name} (${admin})\n`;
      n++;
    }
    result += `\n🛡️ ***Moderators***:\n`;
    for (const moderator of MODERATORBOT) {
      const { name } = await userInfos.get(moderator);
      result += `${n}. ${name} (${moderator})\n`;
      n++;
    }
    result += `\nYou can reply with a number to send a message to the corresponding admin.`;
    const admin = await output.waitForReply(result, ({ repObj, input }) => {
      const { resolve } = repObj;

      const admin = ADMINBOT[parseInt(input.words[0]) - 1];
      if (!admin) {
        return output.reply(`❌ Admin No. ${input.words[0]} doesn't exist`);
      } else {
        output.react("✅");
        return resolve(admin);
      }
    });
    const { adminName } = await userInfos.get(admin);
    const { senderName } = await userInfos.get(input.senderID);
    const message = await output.waitForReply(
      `💌 Enter your message for the admin ${adminName} (${admin})`,
      ({ input, repObj: { resolve, author } }) => {
        if (input.senderID !== author) {
          return output.react("❌");
        }
        output.react("✅");
        resolve(input.censor(input.words.join(" ")));
      }
    );
    const preview = `💌 𝗠𝗲𝘀𝘀𝗮𝗴𝗲

From: ${senderName} (${input.senderID})
To: ${adminName} (${admin})

${message}`;
    await output.quickWaitReact(
      `⚠️ Send this message?

${preview}`,
      {
        authorOnly: true,
        edit: `✅ | Sending...`,
      }
    );
    const { messageID } = await outputOld(preview, {
      threadID: admin,
    });
    input.setReply(messageID, {
      key: "admin",
      callback({ input: input2 }) {
        const body = input2.censor(input2.words.join(" "));
        output.reply(`💌 𝗥𝗮𝗿𝗲 𝗔𝗱𝗺𝗶𝗻 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲

From: ${adminName} (${admin})
To: ${senderName} (${input.senderID})

${body}

𝘠𝘰𝘶 𝘤𝘢𝘯𝘯𝘰𝘵 𝘳𝘦𝘱𝘭𝘺 𝘵𝘰 𝘵𝘩𝘪𝘴 𝘮𝘦𝘴𝘴𝘢𝘨𝘦.`);
      },
    });
    await output.reply(
      `✅ | Message sent to ${adminName} (${admin}), it will not reply.`
    );
    output.react("✅");
  },
};

const home = new ReduxCMDHome({
  entryConfig,
  entryInfo: {
    list: {
      description: "Display the list of admins",
    },
    addmod: {
      description: "Grant moderator privileges",
      args: ["<uid>"],
    },
    removemod: {
      description: "Revoke moderator privileges",
      args: ["<uid>"],
    },
    add: {
      description: "Add a new admin",
      args: ["<uid>"],
    },
    remove: {
      description: "Remove an existing admin",
      args: ["<uid>"],
    },
  },
});

export async function entry(ctx) {
  return home.runInContext(ctx);
}

export const meta = {
  name: "judgement",
  author: "Liane Cagara",
  version: "1.0.0",
  waitingTime: 5,
  description:
    "Provides judgement based on kills, spares, and execution points.",
  category: "Fun",
  usage: "{prefix}{name}",
  requirement: "2.5.0",
  icon: "",
};

const dialogues = {
  highSpareNoExp: [
    "Your mercy is unparalleled. You are a beacon of hope in these dark times.",
    "With no executions, yet full of compassion. Truly remarkable!",
    "Your path of sparing has left a mark on the world, despite your inexperience.",
  ],
  highSpareLowExp: [
    "You have shown great mercy with minimal executions. A true hero!",
    "Your journey is adorned with kindness and minimal bloodshed.",
    "Few executions and many spares. Keep it up!",
  ],
  lowSpareHighKills: [
    "Your path is drenched in blood. Seek redemption.",
    "Many have fallen by your hand. Is there still room for mercy?",
    "You are feared by many. Will you change your ways?",
  ],
  balanced: [
    "You have balanced your actions with both mercy and might.",
    "A fair judge, neither too kind nor too harsh.",
    "Your decisions reflect a balanced soul. Continue on this path.",
  ],
  lowSpareLowKills: [
    "You have neither spared many nor taken many lives. An enigma.",
    "A neutral path, neither good nor evil.",
    "Your actions are minimal, leaving much to be pondered.",
  ],
};

function getJudgement(userStats) {
  const { kills, spares, exp } = userStats;

  const tolerance = 3;

  if (spares > kills && exp === 0) {
    return dialogues.highSpareNoExp;
  } else if (spares > kills && exp > 0) {
    return dialogues.highSpareLowExp;
  } else if (Math.abs(kills - spares) <= tolerance && spares > 0) {
    return dialogues.balanced;
  } else if (kills > spares) {
    return dialogues.lowSpareHighKills;
  } else {
    return dialogues.lowSpareLowKills;
  }
}

export async function reply({ api, input, output, repObj: receive, money }) {
  if (!receive) return;
  const userStats = await money.get(input.senderID);

  const judgementDialogues = getJudgement(userStats);
  let index = receive.index || 0;

  if (judgementDialogues[index]) {
    const info = await output.reply(
      `✦ ${judgementDialogues[index]}\n\n**Next**`,
    );
    receive.mid = info.messageID;
    index++;
    input.setReply(info.messageID, { ...receive, index, mid: info.messageID });
  } else {
    output.reply("The judgement is complete.");
    input.delReply(receive.mid);
  }
}

export async function entry(context) {
  const {
    api,
    input,
    output,
    prefix,
    money: moneyH,
    userStats,
    commandName,
  } = context;
  if (input.arguments[0] === "guide") {
    return output.reply(`𝗢𝘃𝗲𝗿𝘃𝗶𝗲𝘄
This module judges your actions based on the number of kills, spares, and execution points you've accumulated. 

𝗛𝗼𝘄 𝘁𝗼 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝘁𝗲:
1. Ensure your stats are updated.
2. Type ${prefix}judgement to start receiving your judgement.
3. Follow the dialogues and type 'next' to proceed through the judgement.

𝗖𝗼𝗻𝗱𝗶𝘁𝗶𝗼𝗻𝘀:
- Your actions determine the judgement you receive.
- Execution points negatively impact your judgement.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲 𝗨𝘀𝗮𝗴𝗲:
- Input: ${prefix}judgement

𝗘𝗻𝗷𝗼𝘆 𝘁𝗵𝗲 𝗝𝘂𝗱𝗴𝗲𝗺𝗲𝗻𝘁 𝗮𝗻𝗱 𝗟𝗲𝗮𝗿𝗻 𝗳𝗿𝗼𝗺 𝗬𝗼𝘂𝗿 𝗔𝗰𝘁𝗶𝗼𝗻𝘀! 🧠🌟

---
`);
  }
  await reply({
    ...context,

    api,
    input,
    output,
    repObj: { key: commandName, mid: null, index: 0 },
    userStats,
  });
}

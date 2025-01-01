import { abbreviateNumber, UNIRedux } from "../modules/unisym.js";

export const meta = {
  name: "money",
  description: "Check your virtual money",
  otherNames: ["coins", "funds", "moneydashboard", "mdashboard", "mdash"],
  version: "2.5.0",
  usage: "{prefix}{name}",
  category: "Financial",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 0,
};

export const style = {
  title: "💳 Money Dashboard",
  titleFont: "bold",
  contentFont: "fancy",
};

function isBrokenMoney(playerMoney) {
  return !!(
    isNaN(playerMoney) ||
    !isFinite(playerMoney) ||
    playerMoney < 0 ||
    playerMoney > Number.MAX_SAFE_INTEGER
  );
}

function sortUsers(users, top) {
  let result = {};
  let sortedKeys = Object.keys(users).sort(
    (a, b) => Number(users[b].money) - Number(users[a].money)
  );
  if (top) {
    sortedKeys = sortedKeys.slice(0, top);
  }
  for (const key of sortedKeys) {
    result[key] = users[key];
  }
  return result;
}

function getTop(id, users) {
  const sorted = sortUsers(users);
  return Object.keys(sorted).findIndex((key) => key === id) + 1;
}

function totalReducer(totalObj) {
  return Object.values(totalObj).reduce((a, b) => {
    const numA = Number(a);
    const numB = Number(b);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA + numB;
    } else {
      return numA;
    }
  }, 0);
}

const { parseCurrency: pCy } = global.utils;

export async function entry({
  money,
  input,
  output,
  icon,
  prefix,
  clearCurrStack,
}) {
  if (input.arguments[0] === "reset_force_confirmed") {
    await money.set(input.senderID, { money: 0 });
    output.reply(`Your money has been reset to 0$`);
    return;
  }
  if (input.arguments[0] === "fix") {
    const { money: playerMoney } = await money.get(input.senderID);
    if (isBrokenMoney(playerMoney)) {
      await money.set(input.senderID, { money: 0 });
      return output.reply(
        `Your broken money of ${pCy(playerMoney)} has been reset to 0$.`
      );
    } else {
      return output.reply(
        `Your money is ${pCy(playerMoney)}$ and is functioning correctly.`
      );
    }
  }
  if (input.arguments[0] === "lboard") {
    let { participantIDs = [] } = input;
    if (!Array.isArray(participantIDs)) {
      participantIDs = [];
    }
    const users = await money.getAll();

    const topUsers = sortUsers(users, 10);

    let result = `🏅 **Leaderboards (Top 10)** 🏅\n\n`;
    let index = 1;
    let lastMoney;
    for (const key in topUsers) {
      const isGroup = participantIDs.includes(key);

      const {
        name = "Unregistered",
        money: playerMoney,
        maxMoney,
      } = topUsers[key];
      const userData = topUsers[key];
      result += `${index === 1 ? "👑" : index < 10 ? `0${index}` : index}${
        index === 1
          ? ` ✦ [font=double_struck]${name
              .split("")
              .map((name) => name.toUpperCase())
              .join(" ")}[:font=double_struck] ✦`
          : `. **${name}**`
      }\n💰 Money: $**${abbreviateNumber(playerMoney)}**💵\n`;
      if (lastMoney) {
        result += `💸 Gap: $${abbreviateNumber(lastMoney - playerMoney)}💵\n`;
      }
      if (isGroup) {
        result += `✅ In Group\n`;
      }
      for (const key in userData) {
        if (
          !key.endsWith("Total") &&
          key !== "totalCrops" &&
          key !== "totalOres"
        ) {
          continue;
        }
        const totalObj = userData[key];
        if (!Object.values(totalObj).every((value) => !isNaN(value))) {
          continue;
        }
        const exKey = key.replace("Total", "");
        const exKeyCap =
          exKey.charAt(0).toUpperCase() + exKey.slice(1).toLowerCase();
        const sum = totalReducer(totalObj);
        result += `✓ ${exKeyCap}(s): ${abbreviateNumber(sum)}\n`;
      }
      result += `\n`;
      index++;
      lastMoney = playerMoney;
    }
    output.reply(result);
    return;
  }

  let { senderID } = input;
  if (input.replier) {
    ({ senderID } = input.replier);
  }
  if (input.hasMentions) {
    ({ senderID } = input.firstMention);
  }
  if (input.arguments[0] === "check" && input.arguments[1]) {
    senderID = input.arguments[1];
  }

  let i;
  if (!input.isWeb) {
    i = await output.reply(`🔧 Loading...`);
  }

  const allUsers = await money.getAll();
  let warn = "";
  const playerMoney = (await allUsers[senderID]) ?? {};
  playerMoney.money ??= 0;
  playerMoney.name ??= "No name";
  if (isBrokenMoney(playerMoney.money)) {
    warn = `\n\n⚠️ Warning: This money might be corrupted! Use "${prefix}money fix" to reset it.`;
  }

  const topIndex = getTop(senderID, allUsers);
  let topText = `${
    topIndex <= 10
      ? `🏅 **${playerMoney.name}** • Top #${topIndex}!`
      : `🌱 **${playerMoney.name}** • Climbing.`
  }\n✓ Check the Top 10 leaderboard with **money lboard**.

**Disclaimer**: This is a virtual money balance and cannot be exchanged for real money.`;

  const targetName = input.hasMentions
    ? playerMoney.name
    : input.replier
    ? playerMoney.name
    : input.arguments[0]
    ? playerMoney.name
    : "You";
  const has = targetName === "You" ? "have" : "has";

  if (i) {
    output.edit(
      `${targetName} ${has} $${pCy(playerMoney.money)}💵 in the ${
        UNIRedux.redux
      }.${warn}\n\n${topText}`,
      i.messageID
    );
    clearCurrStack();
  } else {
    output.reply(
      `${targetName} ${has} $${pCy(playerMoney.money)}💵 in the ${
        UNIRedux.redux
      }.${warn}\n\n${topText}`
    );
  }
}

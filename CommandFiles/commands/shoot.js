// @ts-check

import { parseBet } from "@cass-modules/ArielUtils";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "shoot",
  description:
    "Test your skills in a high-stakes basketball shooting game to win big or lose it all.",
  version: "1.1.5",
  author: "original idea by Duke Agustin,recreated by Liane Cagara",
  otherNames: ["bball", "shot", "bb"],
  usage: "{prefix}{name}",
  category: "Gambling Games",
  permissions: [0],
  noPrefix: false,
  waitingTime: 0.1,
  icon: "🏀",
  shopPrice: 2500,
  requiredLevel: 10,
  requirement: "3.0.0",
  cmdType: "arl_g",
};

export class style {
  preset = ["cash_games.json"];
}

/**
 *
 * @param {CommandContext} param0
 * @returns
 */
export async function entry({
  output,
  money,
  input,
  styler,
  cancelCooldown,
  Inventory,
}) {
  let {
    money: userMoney,
    inventory: r,
    bbWins = 0,
    bbLooses = 0,
  } = await money.getItem(input.senderID);
  const inventory = new Inventory(r);
  let hasPass = inventory.has("highRollPass");

  const isWin = Math.random() < 0.4;

  const [bet] = input.arguments;

  let amount = parseBet(bet, userMoney);

  if (!hasPass && amount > global.Cassidy.highRoll) {
    return output.reply(
      `You need a **HighRoll Pass** 🃏 to place bets over ${global.Cassidy.highRoll}$`
    );
  }

  if (isNaN(amount) || amount <= 0 || amount > userMoney) {
    cancelCooldown();
    return output.reply(`⚠️ Invalid bet amount.`);
  }
  const cashField = styler.getField("cashField");
  const resultText = styler.getField("resultText");

  if (!isWin) {
    amount = Math.min(amount, userMoney);

    cashField.applyTemplate({
      cash: amount.toLocaleString(),
    });
    bbLooses += amount;

    resultText.changeContent("You lost:");

    await money.setItem(input.senderID, {
      money: userMoney - amount,
      bbLooses,
      bbWins,
    });
    output.reply(`💥 The Ball ⛹🏻‍♂️ missed🏀`);
  } else {
    bbWins += amount;

    cashField.applyTemplate({
      cash: amount.toLocaleString(),
    });

    resultText.changeContent("You Won:");
    await money.setItem(input.senderID, {
      money: userMoney + amount,
      bbWins,
      bbLooses,
    });
    output.reply(`💥 The Ball ⛹🏻‍♂️ was shot successfully🏀`);
  }
}

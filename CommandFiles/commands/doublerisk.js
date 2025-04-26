// @ts-check

import { parseBet } from "@cass-modules/ArielUtils";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "doublerisk",
  description: "Risk your money to potentially double it, or lose it all!",
  version: "1.1.4",
  author: "Liane Cagara",
  usage: "{prefix}doublerisk <amount>",
  category: "Gambling Games",
  permissions: [0],
  noPrefix: false,
  otherNames: ["doubleorlose", "riskitall", "doubleornothing", "don"],
  waitingTime: 30,
  shopPrice: 50000,
  requirement: "3.0.0",
  icon: "💥",
  cmdType: "arl_g",
};

export class style {
  title = {
    text_font: "double_struck",
    content: "Double Risk 💥",
    line_bottom_inside_text_elegant: "Results",
  };
  content = {
    text_font: "fancy",
    line_bottom_: "14chars",
    // text_prefix: "✦ ",
  };
}

/**
 *
 * @param {CommandContext} ctx
 * @returns
 */
export async function entry({
  input,
  output,
  money,
  styler,
  Inventory,
  cancelCooldown,
}) {
  let {
    money: userMoney,
    drWin = 0,
    drLost = 0,
    slotWins = 0,
    slotLooses = 0,
    inventory: rawInv,
  } = await money.get(input.senderID);
  const inventory = new Inventory(rawInv);
  let hasPass = inventory.has("highRollPass");

  const betAmount = parseBet(input.arguments[0], userMoney);

  const title = styler.getField("title");

  if (input.isAdmin) {
    cancelCooldown();
  }

  if (isNaN(betAmount) || betAmount <= 0) {
    output.reply("Please enter a valid bet amount greater than 0.");
    cancelCooldown();
    return;
  }
  if (!hasPass && betAmount > global.Cassidy.highRoll) {
    cancelCooldown();
    return output.reply(
      `You need a **HighRoll Pass** 🃏 to place bets over ${global.Cassidy.highRoll}$`
    );
  }

  if (betAmount > userMoney) {
    cancelCooldown();
    output.reply("You do not have enough money to place this bet.");
    return;
  }

  let outcome = Math.random() < 0.3 ? "win" : "lose"; // HAHA DI FAIR

  let resultText;
  let newBalance;
  const winnings = Math.floor(betAmount * 0.5);

  if (outcome === "win") {
    newBalance = userMoney + winnings;
    drWin += betAmount;

    title.style.line_bottom_inside_text_elegant = `Won`;
    resultText = `🎉 Congratulations! You won ${winnings}$ and now have ${newBalance}$.`;
  } else {
    newBalance = userMoney - betAmount;
    drLost += betAmount;
    title.style.line_bottom_inside_text_elegant = `Lost`;
    resultText = `😢 You lost your bet and now have ${newBalance}$.`;
  }

  await money.setItem(input.senderID, {
    money: newBalance,
    drWin,
    drLost,
  });
  const i = slotWins - slotLooses;

  output.reply(`**Double Risk**:
You bet: ${betAmount}$
Outcome: ${outcome === "win" ? "Win" : "Lose"}
\n${resultText}\n\n**Total Wins**: ${drWin - drLost}${
    i < 0
      ? `\n[font=typewriter]Are you playing this because you lost in slot?[:font=typewriter]`
      : ``
  }`);
}

export const meta = {
  name: "doublerisk",
  description: "Risk your money to potentially double it, or lose it all!",
  version: "1.1.4",
  author: "Liane Cagara",
  usage: "{prefix}doublerisk <amount>",
  category: "Fun",
  permissions: [0],
  noPrefix: false,
  otherNames: ["doubleorlose", "riskitall", "doubleornothing", "don"],
  waitingTime: 60,
  shopPrice: 5,
};

export class style {
  title = {
    text_font: "double_struck",
    content: "💥 Double Risk",
    line_bottom_inside_text_elegant: "Results",
  };
  content = {
    text_font: "fancy",
    line_bottom_: "14chars",
    // text_prefix: "✦ ",
  };
}
export async function entry({ input, output, money, icon, styler, Inventory }) {
  let {
    money: userMoney,
    drWin = 0,
    drLost = 0,
    slotWins = 0,
    slotLooses = 0,
    inventory,
  } = await money.get(input.senderID);
  inventory = new Inventory(inventory);
  let hasPass = inventory.has("highRollPass");

  const betAmount = parseFloat(input.arguments[0]);
  const title = styler.getField("title");

  if (isNaN(betAmount) || betAmount <= 0) {
    output.reply("Please enter a valid bet amount greater than 0.");
    return;
  }
  if (!hasPass && betAmount > 100000) {
    return output.reply(
      `You need a **HighRoll Pass** 🃏 to place bets over 100000$`,
    );
  }

  if (betAmount > userMoney) {
    output.reply("You do not have enough money to place this bet.");
    return;
  }

  const outcome = Math.random() < 0.5 ? "win" : "lose";
  let resultText;
  let newBalance;

  if (outcome === "win") {
    newBalance = userMoney + betAmount;
    drWin += betAmount;
    title.style.line_bottom_inside_text_elegant = `Won`;
    resultText = `🎉 Congratulations! You doubled your bet and now have ${newBalance}$.`;
  } else {
    newBalance = userMoney - betAmount;
    drLost += betAmount;
    title.style.line_bottom_inside_text_elegant = `Lost`;
    resultText = `😢 You lost your bet and now have ${newBalance}$.`;
  }

  await money.set(input.senderID, { money: newBalance, drWin, drLost });
  const i = slotWins - slotLooses;

  output.reply(`**Double Risk**:
You bet: ${betAmount}$
Outcome: ${outcome === "win" ? "Win" : "Lose"}
\n${resultText}\n\n**Total Wins**: ${drWin - drLost}${i < 0 ? `\n[font=typewriter]Are you playing this because you lost in slot?[:font=typewriter]` : ``}`);
}

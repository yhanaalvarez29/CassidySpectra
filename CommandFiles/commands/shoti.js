// @ts-check
/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "shoti",
  description: "Send a random Shoti video",
  author: "0xVoid | Liane?",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "Media",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["shoti_"],
  icon: "😋",
};

import { abbreviateNumber, parseBet } from "@cass-modules/ArielUtils";
import { CassidyResponseStylerControl } from "@cassidy/styler";
import Shoti from "shoti";

const shoti = new Shoti("$shoti-b04f8c279e");

/**
 *
 * @param {CommandContext} ctx
 */
export async function entry({ output, input, usersDB, Inventory }) {
  if (input.arguments[0]) {
    const cashGames = new CassidyResponseStylerControl({
      preset: ["cash_games.json"],
    });
    cashGames.activateAllPresets();

    const cashField = cashGames.getField("cashField");
    const resultText = cashGames.getField("resultText");

    const userData = await usersDB.getItem(input.sid);
    const bet = parseBet(input.arguments[0], userData.money);
    const inv = new Inventory(userData.inventory);
    let hasPass = inv.has("highRollPass");

    if (isNaN(bet) || bet > userData.money || bet <= 0) {
      return output.reply("⚠️ Invalid Bet");
    }

    if (!hasPass && bet > global.Cassidy.highRoll) {
      return output.reply(
        `You need a **HighRoll Pass** 🃏 to place bets over ${global.Cassidy.highRoll}$`
      );
    }

    const isWin = Math.random() < 0.7;
    let mod = 0;

    let text = "";

    if (isWin) {
      mod += +bet;

      cashField.applyTemplate({
        cash: abbreviateNumber(Math.abs(mod)),
      });

      resultText.changeContent("You won:");

      text = `😋 ***SARAP*** ni gurl! You won $${abbreviateNumber(
        Math.abs(mod)
      )}💵.`;
    } else {
      mod += -bet;

      cashField.applyTemplate({
        cash: abbreviateNumber(Math.abs(mod)),
      });

      resultText.changeContent("You lost:");

      text = `😝 ***ASIM*** ni gurl! You lost $${abbreviateNumber(
        Math.abs(mod)
      )}💵.`;
    }

    if (isNaN(mod)) {
      return output.wentWrong();
    }

    await usersDB.setItem(input.sid, {
      money: userData.money + mod,
    });

    text += ` Your new balance is $${abbreviateNumber(
      (await usersDB.getCache(input.sid)).money
    )}💵`;

    return output.replyStyled(text, {
      ...cashGames.getFields(),
    });
  }
  const info = await output.reply("🔎 Fetching...");
  try {
    const data = await shoti.getShoti({ type: "video" });
    if ("error" in data) {
      return info.editSelf("❌ Cannot fetch.");
    }
    info.editSelf("📥 Downloading...");

    const message =
      `**Country**: ${data.region ?? "N/A"}\n` +
      `**Instagram**: ${data.user.instagram ?? "N/A"}\n` +
      `**Nickname**: ${data.user.nickname ?? "N/A"}\n` +
      `**Signature**: ${data.user.signature ?? "N/A"}\n` +
      `**Twitter**: ${data.user.twitter ?? "N/A"}\n` +
      `**Username**: ${data.user.username ?? "N/A"}`;

    await output.attach(message, data.content, {
      title: "😋 Shoti",
      titleFont: "bold",
      contentFont: "fancy",
    });
    info.unsendSelf();
  } catch (err) {
    return info.editSelf(
      `❌ Failed to fetch Shoti video: ${err.message || err}`
    );
  }
}

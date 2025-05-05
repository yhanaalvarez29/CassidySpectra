import { SpectralCMDHome, Config } from "@cassidy/spectral-home";
import { defineEntry } from "@cass/define";
import { UNISpectra } from "@cassidy/unispectra";
import { formatCash, parseBet } from "@cass-modules/ArielUtils";
import { FontSystem } from "cassidy-styler";

export const meta: CassidySpectra.CommandMeta = {
  name: "mtls",
  description: "Minting Token and Lending Service. (Rework 3.6.0)",
  author: "Liane Cagara",
  version: "4.0.0",
  category: "Finance",
  role: 0,
  noPrefix: false,
  waitingTime: 1,
  requirement: "3.0.0",
  icon: "🪙",
};

export const style: CassidySpectra.CommandStyle = {
  title: {
    content: `${UNISpectra.charm} MTLS 🪙`,
    line_bottom: "default",
    text_font: "double_struck",
  },
  content: {
    text_font: "fancy",
    line_bottom_inside_x: "default",
    content: null,
  },
  footer: {
    content: "Made with 🤍 by **Liane Cagara**",
    text_font: "fancy",
  },
};

const configs: Config[] = [
  {
    key: "lend",
    description: "Lend a money and retrieve it soon.",
    args: ["<amount>"],
    aliases: ["-le"],
    icon: "📤",
    async handler({ usersDB, input, output }, { spectralArgs }) {
      const userData = await usersDB.getItem(input.sid);
      const amount = parseBet(spectralArgs[0], userData.money);

      if (isInvalidAm(amount, userData.money)) {
        return output.reply(
          `📋 | The amount (first argument) must be a **valid numerical**, not lower than **1**, and **not higher** than your **balance.** (${formatCash(
            userData.money,
            true
          )})`
        );
      }

      const newLend = amount;
      const newBal = Number(userData.money - newLend);

      const lendAmount = Number(userData.lendAmount ?? 0);

      if (isNaN(lendAmount) || isNaN(newLend) || isNaN(newBal)) {
        console.log({
          lendAmount,
          newBal,
          newLend,
        });
        return output.wentWrong();
      }

      if (lendAmount > 0 && userData.lendTimestamp) {
        return output.reply(
          `📋 | You cannot lend right now. You already have a **valid lend** of ${formatCash(
            lendAmount,
            true
          )}, please **retrieve** it first!`
        );
      }

      await usersDB.setItem(input.sid, {
        lendAmount: newLend,
        money: newBal,
        lendTimestamp: Date.now(),
      });

      return output.reply(
        `💌 | Successfully lent ${formatCash(
          amount,
          true
        )}\n\nYour new **balance** is: ${formatCash(newBal, true)}`
      );
    },
  },
  {
    key: "retrieve",
    description: "Finally retrieve a lent amount and check for interest/gains.",
    aliases: ["-re"],
    args: ["[force]"],
    icon: "📥",
    async handler(
      { usersDB, input, output, getInflationRate },
      { spectralArgs }
    ) {
      const userData = await usersDB.getItem(input.sid);
      const otherMoney = usersDB.extractMoney(userData);
      const isForce = spectralArgs[0]?.toLowerCase() === "force";

      const lendAmount = Number(userData.lendAmount ?? 0);

      if (!userData.lendTimestamp) {
        return output.reply("❕ | No **active** lend to retrieve.");
      }

      const now = Date.now();

      const durationInSeconds = (now - userData.lendTimestamp) / 1000;
      const inflationRate = await getInflationRate();

      const interestNoInflation =
        lendAmount * (0.001 / 365) * durationInSeconds;

      const interest = Math.floor(
        Math.max(
          0,
          interestNoInflation - interestNoInflation * (inflationRate / 1000)
        )
      );

      const cap = Math.floor(otherMoney.total * 0.5);

      const interestCapped = Math.min(interest, cap);
      const totalAmount = Math.floor(lendAmount + interestCapped);

      const newBal = Number(userData.money + totalAmount);

      if (isNaN(lendAmount) || isNaN(newBal) || isNaN(totalAmount)) {
        console.log({
          lendAmount,
          newBal,
          totalAmount,
          interestCapped,
          inflationRate,
          interestNoInflation,
          otherMoney,
          cap,
          interest,
          bal: userData.money,
        });
        return output.wentWrong();
      }

      if (interestCapped < 1 && !isForce) {
        return output.reply(
          `📋 | You **cannot retrieve** this lent amount because the **capped interest** is too **LOW** (${formatCash(
            interestCapped,
            true
          )}). You would **not earn** anything. Please wait or add a **force** argument.`
        );
      }

      await usersDB.setItem(input.sid, {
        money: newBal,
        lendTimestamp: null,
        lendAmount: 0,
      });

      return output.reply(
        `🎉 | Successfully retrieved ${formatCash(
          totalAmount,
          true
        )}$. (***GAIN*** = ${formatCash(
          interestCapped,
          true
        )})\n\nYour new balance is: ${formatCash(newBal, true)}`
      );
    },
  },
  {
    key: "send",
    description: "Transfer a balance to another user for FREE!",
    args: ["<name|uid> <amount>"],
    aliases: ["-tr", "-se", "transfer"],
    icon: "📤",
    async handler({ usersDB, input, output, Inventory }, { spectralArgs }) {
      const userData = await usersDB.getItem(input.sid);
      const targTest = spectralArgs[0];
      const inventory = new Inventory(userData.inventory);

      let recipient: UserData;

      if ((await usersDB.exists(targTest)) && targTest !== "undefined") {
        recipient = await usersDB.getCache(targTest);
      }

      if (!recipient && targTest !== "Unregistered") {
        recipient = await usersDB.queryItem({ "value.name": targTest });
      }

      if (
        !recipient ||
        (recipient?.name !== targTest && recipient?.userID !== targTest)
      ) {
        return output.reply(
          `❕ | Recipient **not found**. Ensure you are providing the correct user's **name** or user's **ID** as a first argument.`
        );
      }

      if (recipient.userID === input.sid) {
        return output.reply(`❕ | You cannot send money **to yourself**!`);
      }

      const amount = parseBet(spectralArgs[1], userData.money);

      if (isInvalidAm(amount, userData.money)) {
        return output.reply(
          `📋 | The amount (second argument) must be a **valid numerical**, not lower than **1**, and **not higher** than your **balance.** (${formatCash(
            userData.money,
            true
          )})`
        );
      }

      const newBal = Number(userData.money - amount);
      const reciBal = Number(recipient.money + amount);

      if (
        reciBal < recipient.money ||
        isNaN(reciBal) ||
        isNaN(newBal) ||
        isNaN(amount)
      ) {
        console.log({
          reciBal,
          recipientBal: recipient.money,
          bal: userData.money,
          newBal,
          amount,
        });
        return output.wentWrong();
      }

      await usersDB.setItem(input.sid, {
        money: newBal,
      });
      await usersDB.setItem(recipient.userID, {
        money: reciBal,
      });

      return output.reply(
        `💥 | Successfully used **0** 🌑 to send ${formatCash(
          amount,
          true
        )}$ to **${
          recipient.name ?? "Unregistered"
        }**\n\nRemaining **Shadow Coins**: ${formatCash(
          inventory.getAmount("shadowCoin"),
          "🌑",
          true
        )}`
      );
    },
  },
  {
    key: "send",
    description: "Transfer a balance to another user for FREE!",
    args: ["<name|uid> <amount>"],
    aliases: ["-tr", "-se", "transfer"],
    icon: "📤",
    async handler({ usersDB, input, output, Inventory }, { spectralArgs }) {
      const userData = await usersDB.getItem(input.sid);
      const targTest = spectralArgs[0];
      const inventory = new Inventory(userData.inventory);

      let recipient: UserData;

      if ((await usersDB.exists(targTest)) && targTest !== "undefined") {
        recipient = await usersDB.getCache(targTest);
      }

      if (!recipient && targTest !== "Unregistered") {
        recipient = await usersDB.queryItem({ "value.name": targTest });
      }

      if (
        !recipient ||
        (recipient?.name !== targTest && recipient?.userID !== targTest)
      ) {
        return output.reply(
          `❕ | Recipient **not found**. Ensure you are providing the correct user's **name** or user's **ID** as a first argument.`
        );
      }

      if (recipient.userID === input.sid) {
        return output.reply(`❕ | You cannot send money **to yourself**!`);
      }

      const amount = parseBet(spectralArgs[1], userData.money);

      if (isInvalidAm(amount, userData.money)) {
        return output.reply(
          `📋 | The amount (second argument) must be a **valid numerical**, not lower than **1**, and **not higher** than your **balance.** (${formatCash(
            userData.money,
            true
          )})`
        );
      }

      const newBal = Number(userData.money - amount);
      const reciBal = Number(recipient.money + amount);

      if (
        reciBal < recipient.money ||
        isNaN(reciBal) ||
        isNaN(newBal) ||
        isNaN(amount)
      ) {
        console.log({
          reciBal,
          recipientBal: recipient.money,
          bal: userData.money,
          newBal,
          amount,
        });
        return output.wentWrong();
      }

      await usersDB.setItem(input.sid, {
        money: newBal,
      });
      await usersDB.setItem(recipient.userID, {
        money: reciBal,
      });

      return output.reply(
        `💥 | Successfully used **0** 🌑 to send ${formatCash(
          amount,
          true
        )}$ to **${
          recipient.name ?? "Unregistered"
        }**\n\nRemaining **Shadow Coins**: ${formatCash(
          inventory.getAmount("shadowCoin"),
          "🌑",
          true
        )}`
      );
    },
  },
];

const home = new SpectralCMDHome(
  {
    argIndex: 0,
    isHypen: false,
    async home({ output, input, usersDB }, { itemList }) {
      const cache = await usersDB.getCache(input.sid);
      return output.reply(
        `💌 | Hello **${cache.name}**! Welcome to ${FontSystem.applyFonts(
          "MTLS",
          "double_struck"
        )} (Minting Token and Lending Service). Please use one of our **services**:\n\n${itemList}\n\n📤 **Lent**: ${formatCash(
          cache.lendAmount ?? 0,
          true
        )}`
      );
    },
  },
  configs
);

export const entry = defineEntry((ctx) => home.runInContext(ctx));

function isInvalidAm(amount: number, balance: number) {
  return isNaN(amount) || amount < 1 || amount > balance;
}

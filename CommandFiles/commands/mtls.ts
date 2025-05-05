import { SpectralCMDHome, Config } from "@cassidy/spectral-home";
import { defineEntry } from "@cass/define";
import { formatTime, UNISpectra } from "@cassidy/unispectra";
import { formatCash, parseBet } from "@cass-modules/ArielUtils";
import { FontSystem } from "cassidy-styler";
import { UserStatsManager } from "@cass-modules/cassidyUser";
import { Collectibles } from "@cassidy/ut-shop";

export const meta: CassidySpectra.CommandMeta = {
  name: "mtls",
  description: "Minting Token and Lending Service. (Rework 3.6.0)",
  author: "Liane Cagara",
  version: "4.1.0",
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

      const durationInSeconds = Math.max(
        (now - userData.lendTimestamp) / 1000 - 60 * 60 * 1000,
        0
      );
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
    key: "stalk",
    description: "Stalk a specific user using a name or UID.",
    args: ["<name|uid> <amount>"],
    aliases: ["-stk"],
    icon: "📤",
    async handler({ usersDB, output }, { spectralArgs }) {
      const targTest = spectralArgs[0];

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
          `❕ | Target **not found**. Ensure you are providing the correct user's **name** or user's **ID** as a first argument.`
        );
      }

      const texts = [
        `👤 | **Name**: ${recipient.name}`,
        `🪙 | **Balance**: ${formatCash(recipient.money, true)}`,
        `🎲 | **User ID**: ${recipient.userID}`,
        `📤 | **Lent Amount**: ${formatCash(recipient.lendAmount ?? 0, true)}`,
        `⏳ | **Lent Since**: ${
          recipient.lendTimestamp
            ? `${formatTime(Date.now() - recipient.lendTimestamp)}`
            : "No active lend."
        }`,
      ];
      return output.replyStyled(texts.join("\n"), {
        ...style,
        content: {
          text_font: "none",
          line_bottom: "none",
        },
      });
    },
  },
  {
    key: "newtokenid",
    description: "Creates a new token/currency/mint id.",
    args: ["<icon>", "<name>", "<id>"],
    aliases: ["-ntid"],
    icon: "➕",
    async handler({ usersDB, output, input, globalDB }, { spectralArgs, key }) {
      const [icon = "", name = "", id = ""] = spectralArgs;

      if (icon.length < 1 || name.length < 5 || id.length < 5) {
        return output.reply(
          `💌 | **SYNTAX**:\n${input.words[0]} ${input.arguments[0]} ${key} <icon> <name> <id>\n\n⚠️ | The icon **must be longer** than 0 character, name **must be longer** than 5 characters, and id **must be longer** than 5 characters.`
        );
      }
      const { mints = {} }: Mints = await globalDB.getCache(MINT_KEY());
      const mint: MintItem = {
        asset: 0,
        icon,
        id,
        name,
        author: input.sid,
        creationDate: Date.now(),
        copies: 0,
      };

      const exists = findExistingMint(mint, mints);

      if (exists.length > 0) {
        return output.reply(
          `📋 | **Mint Already Exists!!**\n\n${await formatMint(
            exists[0].mintItem,
            usersDB
          )}`
        );
      }

      const me: MintUser = mints[input.sid] ?? [];
      if (me.length > MINT_LIMIT()) {
        return output.reply(
          `📋 | You can only make mints **up to ${MINT_LIMIT()}**!`
        );
      }
      me.push(mint);

      mints[input.sid] = me;

      await globalDB.setItem(MINT_KEY(), {
        mints,
      });

      return output.reply(
        `☑️ | **Success Created**!\n\n${await formatMint(mint, usersDB)}`
      );
    },
  },
  {
    key: "tokens",
    description: "Lists all of your tokens/currency created",
    aliases: ["-tks"],
    icon: "📃",
    async handler({ usersDB, output, input, globalDB }, {}) {
      const { mints = {} }: Mints = await globalDB.getCache(MINT_KEY());
      const me: MintUser = mints[input.sid] ?? [];
      const mapped = (
        await Promise.all(
          me.map(async (i) => `${await formatMint(i, usersDB)}`)
        )
      ).join("\n\n");

      return output.reply(`💌 | **YOUR MINTS**:\n\n${mapped}`);
    },
  },
  {
    key: "killtoken",
    description:
      "Removes your ability to reproduce the token and delete it forever.",
    aliases: ["-tks"],
    icon: "📃",
    async handler({ usersDB, output, input, globalDB }, { spectralArgs }) {
      const { mints = {} }: Mints = await globalDB.getCache(MINT_KEY());
      const me: MintUser = mints[input.sid] ?? [];
      const id = spectralArgs[0] ?? "";
      if (!id) {
        return output.reply(`📋 | Please use a valid id.`);
      }
      if (!me.some((i) => i.id === id)) {
        return output.reply(`📋 | No **mint** found on the specificed it..`);
      }
      const ind = me.findIndex((i) => i.id === id);

      const item = me.find((i) => i.id === id);

      if (ind !== -1) {
        me.splice(ind, 1);
      } else {
        return output.wentWrong();
      }

      mints[input.sid] = me;

      await globalDB.setItem(MINT_KEY(), {
        mints,
      });

      return output.reply(
        `☑️ **DELETED**\n\n${await formatMint(item, usersDB)}`
      );
    },
  },
  {
    key: "mint",
    description:
      "Mints new copies of token (without backing asset) based on token id.",
    args: ["<tokenid>", "<amount>"],
    aliases: ["-mt"],
    icon: "🪙",
    async handler({ usersDB, output, input, globalDB }, { spectralArgs }) {
      const userData = await usersDB.getItem(input.sid);
      const { mints = {} }: Mints = await globalDB.getCache(MINT_KEY());
      const me: MintUser = mints[input.sid] ?? [];
      const tokenId = spectralArgs[0] ?? "";
      const amount = parseBet(spectralArgs[1], userData.money);

      if (!tokenId) {
        return output.reply(`📋 | Please provide a valid **token ID**.`);
      }

      if (isInvalidAm(amount, userData.money)) {
        return output.reply(
          `📋 | The amount (second argument) must be a **valid numerical**, not lower than **1**, and **not higher** than your **balance.** (${formatCash(
            userData.money,
            true
          )})`
        );
      }

      const mint = me.find((i) => i.id === tokenId);
      if (!mint) {
        return output.reply(
          `📋 | No **mint** found with the specified ID: ${tokenId}.`
        );
      }

      const newCopies = (mint.copies ?? 0) + amount;
      const updatedMint: MintItem = { ...mint, copies: newCopies };

      const userMints = me.map((m) => (m.id === tokenId ? updatedMint : m));
      mints[input.sid] = userMints;

      await globalDB.setItem(MINT_KEY(), { mints });
      const converted = convertMintToCll(updatedMint);

      const cll = new Collectibles(userData.collectibles ?? []);
      const KEY = converted.key;
      if (!cll.has(KEY)) {
        cll.register(KEY, converted);
      }
      cll.raise(KEY, amount);

      await usersDB.setItem(input.sid, {
        collectibles: Array.from(cll),
      });

      return output.reply(
        `🪙 | Successfully minted **${amount}** copies of **${mint.name}** [${
          mint.id
        }].\nTotal copies: **${newCopies}**\n\n${await formatMint(
          updatedMint,
          usersDB
        )}`
      );
    },
  },
  {
    key: "asset",
    description:
      "Adds a backing asset on your token id without minting or creating a copy of the token.",
    args: ["<tokenid>", "<amount>"],
    aliases: ["-ast"],
    icon: "💰",
    async handler({ usersDB, output, input, globalDB }, { spectralArgs }) {
      const userData = await usersDB.getItem(input.sid);
      const { mints = {} }: Mints = await globalDB.getCache(MINT_KEY());
      const me: MintUser = mints[input.sid] ?? [];
      const tokenId = spectralArgs[0] ?? "";
      const amount = parseBet(spectralArgs[1], userData.money);

      if (!tokenId) {
        return output.reply(`📋 | Please provide a valid **token ID**.`);
      }

      if (isInvalidAm(amount, userData.money)) {
        return output.reply(
          `📋 | The amount (second argument) must be a **valid numerical**, not lower than **1**, and **not higher** than your **balance.** (${formatCash(
            userData.money,
            true
          )})`
        );
      }

      const mint = me.find((i) => i.id === tokenId);
      if (!mint) {
        return output.reply(
          `📋 | No **mint** found with the specified ID: ${tokenId}.`
        );
      }

      const newAsset = (mint.asset ?? 0) + amount;
      const newBal = userData.money - amount;
      const updatedMint: MintItem = { ...mint, asset: newAsset };

      const userMints = me.map((m) => (m.id === tokenId ? updatedMint : m));
      mints[input.sid] = userMints;

      await globalDB.setItem(MINT_KEY(), { mints });
      await usersDB.setItem(input.sid, { money: newBal });

      return output.reply(
        `💰 | Successfully added **${formatCash(
          amount,
          true
        )}** as backing asset to **${mint.name}** [${
          mint.id
        }].\nNew asset value: **${formatCash(
          newAsset,
          true
        )}**\nNew balance: **${formatCash(
          newBal,
          true
        )}**\n\n${await formatMint(updatedMint, usersDB)}`
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
        )} (Minting Token and Lending Service). Please use one of our **services**:\n\n${itemList}\n\n📤 | **Lent Amount**: ${formatCash(
          cache.lendAmount ?? 0,
          true
        )}\n⏳ | **Lent Since**: ${
          cache.lendTimestamp
            ? `${formatTime(Date.now() - cache.lendTimestamp)}`
            : "No active lend."
        }`
      );
    },
  },
  configs
);

export const entry = defineEntry((ctx) => home.runInContext(ctx));

function MINT_LIMIT() {
  return 8;
}

export function MINT_KEY(): string {
  return "mints";
}

function isInvalidAm(amount: number, balance: number) {
  return isNaN(amount) || amount < 1 || amount > balance;
}

export interface MintUser extends Array<MintItem> {}

export interface MintItem {
  readonly name: string;
  readonly id: string;
  readonly icon: string;
  asset: number;
  copies: number;
  readonly author: string;
  readonly creationDate: number;
}

export interface Mints extends UserData {
  mints?: Record<string, MintUser>;
}

export function convertMintToCll(mint: MintItem) {
  return {
    key: `mtls_${mint.id}`,
    name: mint.name,
    flavorText: "Minted from MTLS.",
    icon: mint.icon,
    type: "MTLS",
    author: mint.author,
    creationDate: mint.creationDate ?? Date.now(),
    copies: mint.copies,
  };
}

export function convertCllToMint(
  cll: ReturnType<typeof convertMintToCll>,
  asset: number
): MintItem {
  const id = cll.key.replace("mtls_", "");

  return {
    id: id,
    name: cll.name,
    icon: cll.icon,
    asset,
    author: cll.author,
    creationDate: cll.creationDate,
    copies: cll.copies,
  };
}

export function findExistingMint(
  target: MintItem,
  mints: Mints["mints"]
): Array<{ author: string; mintItem: MintItem }> {
  const results = Object.entries(mints)
    .filter(([, mintUser]) =>
      mintUser?.some(
        (mintItem) => mintItem.name === target.name || mintItem.id === target.id
      )
    )
    .map(([author, mintUser]) => {
      return mintUser
        ?.filter(
          (mintItem) =>
            mintItem.name === target.name || mintItem.id === target.id
        )
        .map((mintItem) => ({ author, mintItem }));
    })
    .flat();

  return results;
}

export async function formatMint(mint: MintItem, usersDB: UserStatsManager) {
  const { name = "???" } = await usersDB.getCache(mint.author);
  return `${mint.icon} **${mint.name}** [${
    mint.id
  }]\n**By ${name}**\n**Since**: ${formatTime(
    Date.now() - mint.creationDate
  )}\n🪙 **Market Value**: ${formatCash(mint.asset / mint.copies || 0, true)}`;
}

import { ReduxCMDHome } from "../modules/reduxCMDHome.js";
import { toTitleCase, UNIRedux } from "../modules/unisym.js";
import { ShopClass } from "../plugins/shopV2.js";

export const meta = {
  name: "shop",
  description: "Buy anything!",
  version: "1.1.9",
  author: "Liane Cagara",
  usage: "{prefix}shop",
  category: "Shopping",
  permissions: [0],
  noPrefix: "both",
  otherNames: [],
  requirement: "2.5.0",
  icon: "🛒",
};

export const style = {
  title: "Shop 🛒",
  titleFont: "bold",
  contentFont: "fancy",
};
const stoData = {
  bank: {
    price: 1000,
    key: "cbankStorage",
  },
  harvest: {
    price: 50,
    key: "plantMaxZ",
  },
  mine: {
    price: 1000,
    key: "mineMaxZ",
  },
  littlejohn: {
    price: 20,
    key: "littlejohnMaxZ",
  },
  recycle: {
    price: 50,
    key: "recycleMaxZ",
  },
  resto: {
    price: 100,
    key: "restoMaxZ",
  },
  plantita: {
    price: 100,
    key: "plantitaMaxZ",
  },
  spaceexplorer: {
    price: 500,
    key: "spaceexplorerMaxZ",
  },
  deepseadiver: {
    price: 500,
    key: "deepseadiverMaxZ",
  },
  wizardsforge: {
    price: 500,
    key: "wizardsforgeMaxZ",
  },
};

global.stoData = stoData;
const { UserSorter } = global.utils; //{ users, limit = null, sortBy = "money", defaultValue = 0 }

export const entryConfig = {
  async top({ input, output, money }) {
    const allData = await money.getAll();
    let usersCalc = {};
    let top = {};

    for (const userID in allData) {
      const uData = allData[userID];
      for (const key in stoData) {
        if (!usersCalc[key]) {
          usersCalc[key] = {};
        }
        const dataKey = stoData[key].key;
        if (!uData[dataKey]) {
          continue;
        }
        const storage = uData[dataKey];
        if (!usersCalc[key][userID]) {
          usersCalc[key][userID] = [];
        }
        usersCalc[key][userID].push(storage);
      }
    }

    for (const key in usersCalc) {
      const topUsers = Object.entries(usersCalc[key])
        .map(([userID, storages]) => ({
          userID,
          totalStorage: storages.reduce((acc, curr) => acc + curr, 0),
          topStorages: storages.sort((a, b) => b - a).slice(0, 3),
        }))
        .sort((a, b) => b.totalStorage - a.totalStorage)
        .slice(0, 20);

      top[key] = topUsers;
    }

    const allAccu = {};
    for (const key in top) {
      top[key].forEach((user) => {
        if (!allAccu[user.userID]) {
          allAccu[user.userID] = 0;
        }
        allAccu[user.userID] += user.totalStorage;
      });
    }

    const sortedAccu = Object.entries(allAccu)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    let result = ``;
    for (const [userID, accu] of sortedAccu) {
      const { name } = allData[userID];
      const topStorages = [];
      for (const key in top) {
        const user = top[key].find((u) => u.userID === userID);
        if (user) {
          topStorages.push({
            category: key,
            storages: user.topStorages,
            lv: (allData[userID][stoData[key]?.key + "_upgrades"] ?? 0) + 1,
          });
        }
      }

      result += `👑 **${name ?? "Unregistered"}**\n✦ Total Storage: ${accu}\n`;
      topStorages.forEach(({ category, storages, lv }) => {
        result += `✓ LV${lv} ***${category}*** - ${storages.join(", ")}\n`;
      });
      result += `\n`;
    }
    return output.reply(result);
  },
  async cmd(context) {
    const { input, output, args, money, prefix } = context;
    if (args[0] === "buy") {
      if (!args[1]) {
        return output.reply(
          "❌ Please enter the command name you want to buy."
        );
      }
      const {
        shopInv = {},
        money: userMoney,
        name,
      } = await money.get(input.senderID);
      const shop = new ShopClass(shopInv);
      if (!name) {
        return output.reply(
          "❌ Please register first using the identity-setname command."
        );
      }
      async function buyReply(item, price) {
        // await output.quickWaitReact(
        //   `⚠️ Buy "${
        //     args[1]
        //   }" for ${price}$?\n\n**Balance**\nBefore - ${userMoney}$\nAfter - ${
        //     userMoney - price
        //   }$`,
        //   {
        //     authorOnly: true,
        //     edit: "✅ Proceeding...",
        //   }
        // );

        return output.reply(`✅ Successfully purchased ${item} for ${price}$!`);
      }

      if (shopInv[args[1]]) {
        return buyReply("an already-purchased item", 0);
      }
      const price = shop.getPrice(args[1]);
      if (price === null) {
        return buyReply("a non-existent item", 0);
      }
      if (price <= 0) {
        return buyReply("a free item", 0);
      }
      if (isNaN(price)) {
        return output.reply("Something went wrong...");
      }
      const canPurchase = await shop.canPurchase(args[1], userMoney);
      if (!canPurchase) {
        return output.reply(
          `❌ You don't have enough money to buy "${args[1]}" for ${price}$.`
        );
      }

      await shop.purchase(args[1], userMoney);

      await money.set(input.senderID, {
        shopInv: shop.raw(),
        money: userMoney - price,
      });
      return buyReply(`"${args[1]}"`, price);
    } else {
      const { shopInv = {}, money: userMoney } = await money.get(
        input.senderID
      );
      const shop = new ShopClass(shopInv);
      const allItems = shop.getItems();
      let result = "";
      let i = 0;
      result += `🔍 Type ${prefix}**shop-cmd buy <item name>** to buy an item.\n\n`;

      for (const { meta } of allItems) {
        i++;
        result += `${i}. ${meta.icon || "📄"} **${toTitleCase(
          meta.name
        )}**\n- **${Number(meta.shopPrice).toLocaleString()}**$ ${
          shopInv[meta.name]
            ? " ✅"
            : userMoney >= meta.shopPrice
            ? " 💰"
            : " ❌"
        }\n${UNIRedux.charm} ${meta.description}\n\n`;
      }

      return output.reply(result.trimEnd());
    }
  },

  async storage({ input, output, args, money, prefix, Inventory }) {
    if (args[0] !== "buy") {
      let text = "";
      const userData = await money.get(input.senderID);
      if (!userData.name) {
        return output.reply(
          "❌ Please register first using the identity-setname command."
        );
      }
      const inventory = new Inventory(userData.inventory);
      let hasDiscount = inventory.has("silkRibbon");
      let multiplier = 1;
      if (hasDiscount) {
        multiplier = 0.75;
      }

      for (const name in stoData) {
        const val = stoData[name];
        const originalPrice =
          val.price * 2 ** (userData[`${val.key}_upgrades`] ?? 0);
        const LV = (userData[`${val.key}_upgrades`] ?? 0) + 1;
        const price = Math.floor(originalPrice * multiplier);
        const storage = userData[val.key]
          ? userData[val.key] * 2
          : "Unknown..?";
        text += `**${name}** - ${price}💷 ${
          hasDiscount ? `(${originalPrice}$) \n25% OFF! 🎀` : ""
        }${userData.battlePoints < price ? "❌" : "💰"}\n🗃️ LV${LV} Storage: ${
          isNaN(storage) ? storage : storage / 2
        }\n🗃️ LV${LV + 1} Storage: ${storage}\n\n`;
      }
      return output.reply(
        `${text}
Type ${prefix}**shop.storage buy <item name>** fo buy an upgrade.`
      );
    }
    if (!args[1]) {
      return output.reply(
        `❌ Please enter the command name that you want to upgrade in storage.`
      );
    }
    if (!stoData[args[1]]) {
      return output.reply(`❌ Storage data not found for "${args[1]}"`);
    }
    const data = stoData[args[1]];
    let {
      [data.key]: storage,
      battlePoints: userMoney = 0,
      [`${data.key}_upgrades`]: upgrades = 0,
      inventory,
      name,
    } = await money.get(input.senderID);
    inventory = new Inventory(inventory);
    let hasDiscount = inventory.has("silkRibbon");
    let multiplier = 1;
    if (hasDiscount) {
      multiplier = 0.75;
    }
    if (!name) {
      return output.reply(
        "❌ Please register first using the identity-setname command."
      );
    }

    if (isNaN(storage)) {
      return output.reply(
        `❌ You don't have any "${data.key}" in the database.`
      );
    }
    let price = Math.floor(data.price * 2 ** upgrades * multiplier);
    if (userMoney < price) {
      return output.reply(
        `❌ The price of "${args[1]}" **storage** upgrade is ${price}💷 but you only have ${userMoney}💷.`
      );
    }
    await output.quickWaitReact(
      `⚠️ Buy "${
        args[1]
      }" storage upgrade for ${price}💷?\n**Old Storage**: ${storage} 🗃️\n**New Storage**: ${
        storage * 2
      } 🗃️\n\n**Battle Points**\nBefore - ${userMoney}💷\nAfter - ${
        userMoney - price
      }💷`,
      {
        authorOnly: true,
        edit: "✅ Proceeding...",
      }
    );
    await money.set(input.senderID, {
      [`${data.key}_upgrades`]: upgrades + 1,
      battlePoints: userMoney - price,
      [data.key]: storage * 2,
    });
    await output.reply(
      `✅ Successfully purchased "${args[1]}"${
        hasDiscount ? "25% OFF! 🎀" : ""
      } storage upgrade for ${price}💷!\n\n**Old Storage**: ${storage} 🗃️\n**New Storage**: ${
        storage * 2
      } 🗃️\n**New Battle Points**: ${userMoney - price}💷 (-${price})`
    );
  },
};

const home = new ReduxCMDHome({
  entryConfig,
  isHypen: true,
  entryInfo: {
    cmd: {
      key: "command",
      description: "Buy or unlock commands using your balance.",
      args: ["buy <item_name | no argument: lists items>"],
      aliases: ["-c", "cmd"],
    },
    storage: {
      key: "storage",
      description:
        "Upgrade your storage for games like Harvest or Mine using your battle points.",
      args: ["buy <item_name | no argument: lists items>"],
      aliases: ["-s", "sto"],
    },
    top: {
      key: "top",
      description: "View the highest upgraded storage.",
      aliases: ["-t"],
    },
  },
});

export async function entry(ctx) {
  home.runInContext(ctx);
}

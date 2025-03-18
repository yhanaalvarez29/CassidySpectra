import { ReduxCMDHome } from "../modules/reduxCMDHome.js";
import { UNIRedux } from "../modules/unisym.js";

export const meta = {
  name: "vault",
  description:
    "Organize and manage your external inventory with an additional 100 slots.",
  author: "Liane Cagara",
  version: "1.1.3",
  usage: "{prefix}vault <action> [arguments]",
  category: "Inventory",
  permissions: [0],
  noPrefix: false,
  waitingTime: 1,
  otherNames: ["box", "bx", "vt"],
  shopPrice: 10000,
  requirement: "2.5.0",
  icon: "🗃️",
};

const { invLimit } = global.Cassidy;

export const style = {
  title: "Vault 🗃️",
  titleFont: "bold",
  contentFont: "fancy",
};

export async function entry(ctx) {
  const { input, output, money, args, Inventory, prefix } = ctx;
  const userData = await money.get(input.senderID);
  let userInventory = new Inventory(userData.inventory);

  let [...actionArgs] = args;
  let action = input.propertyArray[0];
  let newActionArgs = [];
  for (let i = 0; i < actionArgs.length; i++) {
    const value = actionArgs[i];
    let [key, amount = "1"] = value.split("*");
    amount = parseInt(amount);
    if (isNaN(amount)) {
      amount = 1;
    }
    if (amount > invLimit) {
      amount = invLimit;
    }
    for (let j = 0; j < amount; j++) {
      newActionArgs.push(key);
    }
  }
  actionArgs = newActionArgs;

  let vaultItems = userData.boxItems || [];
  let vaultInventory = new Inventory(vaultItems, 100);
  async function createList() {
    const vaultItemsList = vaultInventory.getAll();
    let pushedKeys = [];
    let vaultItemList = vaultItemsList
      .map((item) => {
        if (pushedKeys.includes(item.key)) {
          return null;
        }
        const amount = vaultInventory.getAmount(item.key);
        pushedKeys.push(item.key);
        return `${item.icon} ${
          amount > 1 ? `**x${amount}** ${UNIRedux.charm} ` : ""
        }${item.name} (${item.key})`;
      })
      .filter(Boolean)
      .join("\n");
    vaultItemList ||= "[ Empty ]";
    const invItemsList = userInventory.getAll();
    let pushedKeys2 = [];
    let invItemList = invItemsList
      .map((item) => {
        if (pushedKeys2.includes(item.key)) {
          return null;
        }
        const amount = userInventory.getAmount(item.key);

        pushedKeys2.push(item.key);
        return `${item.icon} ${
          amount > 1 ? `**x${amount}** ${UNIRedux.charm} ` : ""
        }${item.name} (${item.key})`;
      })
      .filter(Boolean)
      .join("\n");
    invItemList ||= "[ Empty ]";
    const arrayInv = invItemList.split("\n");
    const diff = 8 - arrayInv.length;
    for (let i = 0; i < diff; i++) {
      arrayInv.push("");
    }
    let result = [];
    arrayInv.forEach((val) => {
      if (!val) {
        result.push("_".repeat(15));
      }
    });
    if (result) {
      invItemList += `\n`;
    }
    invItemList += result.join("\n");

    const arrayvault = vaultItemList.split("\n");
    const diff2 = 8 - arrayvault.length;
    for (let i = 0; i < diff2; i++) {
      arrayvault.push("");
    }
    let result2 = [];
    arrayvault.forEach((val) => {
      if (!val) {
        result2.push("_".repeat(15));
      }
    });
    if (result2) {
      vaultItemList += `\n`;
    }
    vaultItemList += result2.join("\n");
    vaultItemList += `\n...[ ${
      100 - vaultInventory.getAll().length
    } Free Slots ]`;

    return `**🎒 Inventory ${
      UNIRedux.charm
    } ${userInventory.size()}/${invLimit}** (${Math.floor(
      (userInventory.size() / invLimit) * 100
    )}%)\n\n${invItemList}\n${UNIRedux.standardLine}\n**🔒 Vault ${
      UNIRedux.charm
    } ${vaultInventory.size()}/100** (${Math.floor(
      (vaultInventory.size() / 100) * 100
    )}%)\n\n${vaultItemList}`;
  }

  const home = new ReduxCMDHome(
    {
      isHypen: true,
    },
    [
      {
        key: "list",
        description: "Lists all items in your vault inventory",
        aliases: ["-l"],
        async handler() {
          return output.reply(`${await createList()}`);
        },
      },
      {
        key: "check",
        description: "Check someone's items.",
        args: ["<uid>"],
        aliases: ["-c"],

        async handler() {
          const {
            inventory = [],
            vaultItems = [],
            name = "Unregistered",
          } = await money.get(actionArgs[0]);
          vaultInventory = new Inventory(vaultItems, 100);
          userInventory = new Inventory(inventory, 100);
          await output.reply(`Checking **${name}**:
    
    ${await createList()}`);
          return;
        },
      },
      {
        key: "store",
        aliases: ["-s"],

        description: "Store an item from your inventory into the vault.",
        args: ["<key1> <key2> <...etc>"],
        async handler() {
          const keysToStore = actionArgs;

          if (keysToStore.length < 1) {
            return output.reply(
              `❌ Please specify an item key to store in the vault\n\n${await createList()}`
            );
          }
          let str = ``;
          for (const keyToStore of keysToStore) {
            const itemToStore = userInventory.getOne(keyToStore);
            if (!itemToStore) {
              str += `❌ Item with key "${keyToStore}" not found in your inventory.\n`;
              continue;
            }
            if (vaultInventory.getAll().length >= 100) {
              str += `❌ The vault inventory is full.\n`;
              continue;
            }
            if (itemToStore.cannotvault === true) {
              str += `❌ Item with key "${keyToStore}" cannot be stored in the vault.\n`;
              continue;
            }
            userInventory.deleteOne(keyToStore);
            vaultInventory.addOne(itemToStore);

            str += `✅ Stored ${itemToStore.icon} ${itemToStore.name} in the vault.\n`;
          }
          await money.set(input.senderID, {
            inventory: Array.from(userInventory),
            boxItems: Array.from(vaultInventory),
          });

          return output.reply(`${str.trim()}\n\n${await createList()}`);
        },
      },
      {
        key: "retrieve",
        aliases: ["-r"],

        description: "Retrieve an item from the vault into your inventory.",
        args: ["<key1> <key2> <...etc>"],
        async handler() {
          const keysToRetrieve = actionArgs;
          if (keysToRetrieve.length < 1) {
            return output.reply(
              `❌ Please specify an item key to retrieve from the vault.\n\n${await createList()}`
            );
          }
          let str2 = ``;
          for (const keyToRetrieve of keysToRetrieve) {
            const itemToRetrieve = vaultInventory.getOne(keyToRetrieve);
            if (!itemToRetrieve) {
              str2 += `❌ Item with key "${keyToRetrieve}" not found in the vault.\n`;
              continue;
            }
            if (userInventory.getAll().length >= invLimit) {
              str2 += `❌ Your Inventory is full.\n`;
              continue;
            }
            vaultInventory.deleteOne(keyToRetrieve);
            userInventory.addOne(itemToRetrieve);
            str2 += `✅ Retrieved ${itemToRetrieve.icon} ${itemToRetrieve.name} from the vault.\n`;
          }
          await money.set(input.senderID, {
            inventory: Array.from(userInventory),
            boxItems: Array.from(vaultInventory),
          });

          return output.reply(`${str2.trim()}\n\n${await createList()}`);
        },
      },
    ]
  );
  home.runInContext(ctx);
}

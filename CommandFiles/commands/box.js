export const meta = {
  name: "box",
  description: "Manage your external box inventory,  (extra 100 slots)",
  author: "Liane Cagara",
  version: "1.1.3",
  usage: "{prefix}box <action> [args]",
  category: "User Management",
  permissions: [0],
  noPrefix: false,
  waitingTime: 1,
  otherNames: ["vault", "bx"],
  shopPrice: 200,
};

export const style = {
  title: "📦 Box",
  titleFont: "bold",
  contentFont: "fancy",
};

export async function entry({ input, output, money, args, Inventory, prefix }) {
  const userData = await money.get(input.senderID);
  let userInventory = new Inventory(userData.inventory);

  let [action = "", ...actionArgs] = args;
  let newActionArgs = [];
  for (let i = 0; i < actionArgs.length; i++) {
    const value = actionArgs[i];
    let [key, amount = "1"] = value.split("*");
    amount = parseInt(amount);
    if (isNaN(amount)) {
      amount = 1;
    }
    if (amount > 8) {
      amount = 8;
    }
    for (let j = 0; j < amount; j++) {
      newActionArgs.push(key);
    }
  }
  actionArgs = newActionArgs;

  let boxItems = userData.boxItems || [];
  let boxInventory = new Inventory(boxItems, 100);
  async function createList() {
    const boxItemsList = boxInventory.getAll();
    let pushedKeys = [];
    let boxItemList = boxItemsList
      .map((item) => {
        if (pushedKeys.includes(item.key)) {
          return null;
        }
        const amount = boxInventory.getAmount(item.key);
        pushedKeys.push(item.key);
        return `${item.icon} ${amount > 1 ? `**x${amount}** ` : ""}${item.name} (${item.key})`;
      })
      .filter(Boolean)
      .join("\n");
    boxItemList ||= "[ Empty ]";
    const invItemsList = userInventory.getAll();
    let invItemList = invItemsList
      .map((item) => `${item.icon} ${item.name} (${item.key})`)
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

    const arrayBox = boxItemList.split("\n");
    const diff2 = 8 - arrayBox.length;
    for (let i = 0; i < diff2; i++) {
      arrayBox.push("");
    }
    let result2 = [];
    arrayBox.forEach((val) => {
      if (!val) {
        result2.push("_".repeat(15));
      }
    });
    if (result2) {
      boxItemList += `\n`;
    }
    boxItemList += result2.join("\n");
    boxItemList += `\n...[ ${100 - boxInventory.getAll().length} Free Slots ]`;

    return `**Inventory**\n${invItemList}\n\n**Box**\n${boxItemList}`;
  }
  if (action.toLowerCase() === "check" && actionArgs[0]) {
    const {
      inventory = [],
      boxItems = [],
      name = "Chara",
    } = await money.get(actionArgs[0]);
    boxInventory = new Inventory(boxItems, 100);
    userInventory = new Inventory(inventory, 100);
    await output.reply(`Checking **${name}**:

${await createList()}`);
    return;
  }

  switch (action.toLowerCase()) {
    case "store":
      const keysToStore = actionArgs;
      if (!keysToStore) {
        return output.reply(
          `❌ Please specify an item key to store in the box.

${await createList()}`,
        );
      }
      let str = ``;
      for (const keyToStore of keysToStore) {
        const itemToStore = userInventory.getOne(keyToStore);
        if (!itemToStore) {
          str += `❌ Item with key "${keyToStore}" not found in your inventory.\n`;
          continue;
        }
        if (boxInventory.getAll().length >= 100) {
          str += `❌ The box inventory is full.\n`;
          continue;
        }
        if (itemToStore.cannotBox === true) {
          str += `❌ Item with key "${keyToStore}" cannot be stored in the box.\n`;
          continue;
        }
        userInventory.deleteOne(keyToStore);
        boxInventory.addOne(itemToStore);

        str += `✅ Stored ${itemToStore.icon} ${itemToStore.name} in the box.\n`;
      }
      await money.set(input.senderID, {
        inventory: Array.from(userInventory),
        boxItems: Array.from(boxInventory),
      });

      return output.reply(
        `${str.trim()}

${await createList()}`,
      );

    case "retrieve":
      const keysToRetrieve = actionArgs;
      if (!keysToRetrieve) {
        return output.reply(
          `❌ Please specify an item key to retrieve from the box.

${await createList()}`,
        );
      }
      let str2 = ``;
      for (const keyToRetrieve of keysToRetrieve) {
        const itemToRetrieve = boxInventory.getOne(keyToRetrieve);
        if (!itemToRetrieve) {
          str2 += `❌ Item with key "${keyToRetrieve}" not found in the box.\n`;
          continue;
        }
        if (userInventory.getAll().length >= 8) {
          str2 += `❌ Your Inventory is full.\n`;
          continue;
        }
        boxInventory.deleteOne(keyToRetrieve);
        userInventory.addOne(itemToRetrieve);
        str2 += `✅ Retrieved ${itemToRetrieve.icon} ${itemToRetrieve.name} from the box.\n`;
      }
      await money.set(input.senderID, {
        inventory: Array.from(userInventory),
        boxItems: Array.from(boxInventory),
      });

      return output.reply(
        `${str2.trim()}

${await createList()}`,
      );

    case "list":
      return output.reply(`${await createList()}`);

    default:
      return output.reply(
        `❌ Invalid action. Usage:\n\n` +
          `\`${meta.usage.replace("{prefix}", prefix)} store <...keys>\`: Store an item from your inventory into the box.\n` +
          `\`${meta.usage.replace("{prefix}", prefix)} retrieve <...keys>\`: Retrieve an item from the box into your inventory.\n` +
          `\`${meta.usage.replace("{prefix}", prefix)} list\`: Lists all items in your box inventory.\n\n` +
          `Example: box store apple*2 canFood magicSword cosmicCrunch*3`,
      );
  }
}

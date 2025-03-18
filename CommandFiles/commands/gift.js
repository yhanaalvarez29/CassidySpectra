export const meta = {
  name: "gift",
  description: "Claim your gift every hours.",
  version: "1.0.0",
  author: "Liane Cagara",
  category: "Rewards",
  permissions: [0],
  waitingTime: 1,
  noPrefix: false,
  requirement: "2.5.0",
  icon: "🎁",
  requiredLevel: 3,
};
export const style = {
  title: "Free Gift 💗",
  titleFont: "bold",
  contentFont: "fancy",
};
const diaCost = 2;
const { parseCurrency: pCy } = global.utils;
const { invLimit } = global.Cassidy;

async function handlePaid({
  input,
  output,
  money,
  Inventory,
  generateGift,
  Collectibles,
}) {
  let { inventory = [], collectibles = [] } = await money.get(input.senderID);
  if (String(input.words[0]).toLowerCase() !== "buy") {
    return;
  }
  if (inventory.length >= invLimit) {
    return output.reply(`❌ You're carrying too many items!`);
  }
  inventory = new Inventory(inventory);
  collectibles = new Collectibles(collectibles);
  if (!collectibles.hasAmount("gems", diaCost)) {
    if (input.isAdmin && input.words[1] === "cheat") {
    } else {
      return output.reply(`❌ You don't have enough gems to purchase it.`);
    }
  }
  const giftItem = generateGift();
  Object.assign(giftItem, {
    key: "fortuneEnv",
    name: "Fortune Envelope",
    icon: "🧧",
    flavorText:
      "A token of luck and prosperity, sealed with good wishes and ancient blessings, that might grant you something. It's not guaranteed, but you can use it with the inventory command, if you know how.",
    type: "treasure",
    treasureKey: "generic_exclude=>curse",
    cannotSend: true,
    cannotToss: true,
    cannotTrade: true,
    sellPrice: 20000,
  });
  inventory.addOne(giftItem);
  collectibles.raise("gems", -diaCost);
  await money.set(input.senderID, {
    inventory: Array.from(inventory),
    collectibles: Array.from(collectibles),
  });
  return output.reply(
    `✅ You bought a **${giftItem.icon} ${
      giftItem.name
    }**! Check your inventory to see it.\n\n💎 **${pCy(
      collectibles.getAmount("gems")
    )}** (-${diaCost})`
  );
}

export async function entry({
  input,
  output,
  money,
  Inventory,
  generateGift,
  Collectibles,
}) {
  let {
    inventory = [],
    lastGiftClaim,
    collectibles = [],
  } = await money.get(input.senderID);
  if (inventory.length >= invLimit) {
    return output.reply(`❌ You're carrying too many items!`);
  }
  inventory = new Inventory(inventory);

  collectibles = new Collectibles(collectibles);
  const currentTime = Date.now();
  // const msWait = 60 * 60 * 1000;
  const msWait = 20 * 60 * 1000;

  let canClaim = false;

  if (!lastGiftClaim) {
    canClaim = true;
  } else {
    const timeElapsed = currentTime - lastGiftClaim;
    if (timeElapsed >= msWait) {
      canClaim = true;
    } else if (input.isAdmin && input.arguments[0] === "cheat") {
      canClaim = true;
    } else {
      const timeRemaining = msWait - timeElapsed;
      const hoursRemaining = Math.floor(
        (timeRemaining / (1000 * 60 * 60)) % 24
      );
      const minutesRemaining = Math.floor((timeRemaining / 1000 / 60) % 60);
      const secondsRemaining = Math.floor((timeRemaining / 1000) % 60);

      const info = await output.reply(
        `⏳ You've already claimed your free gift. Please wait for ${hoursRemaining} hours, ${minutesRemaining} minutes, and ${secondsRemaining} seconds before claiming again.\nReply **buy** to purchase a fortune **envelope** for ${diaCost}💎\n\n**💎 ${pCy(
          collectibles.getAmount("gems")
        )}**`
      );
      input.setReply(info.messageID, {
        callback: handlePaid,
        key: "gift",
      });
      return;
    }
  }

  if (canClaim) {
    const giftItem = generateGift();
    giftItem.cannotSend = true;
    inventory.addOne(giftItem);

    await money.set(input.senderID, {
      inventory: Array.from(inventory),
      lastGiftClaim: currentTime,
    });

    output.reply(
      `🎁 You've claimed your free gift! Check your inventory and come back later for more.`
    );
  }
}

export const meta = {
  name: "recycle",
  description: "Recycle items and earn rewards!",
  version: "1.0.5",
  author: "Liane Cagara",
  usage: "{prefix}recycle",
  category: "Idle Accumulation Games",
  permissions: [0],
  noPrefix: false,
  otherNames: [],
  requirement: "2.5.0",
  icon: "♻️",
  requiredLevel: 3,
};

export const style = {
  title: "Recycling ♻️",
  contentFont: "fancy",
  titleFont: "bold",
};

const recyclableItems = [
  {
    name: "Glass Shard",
    priceA: 20,
    priceB: 30,
    delay: 0.5,
    icon: "🔮",
    chance: 0.2,
  },
  {
    name: "Plastic Bottle",
    priceA: 30,
    priceB: 80,
    delay: 0.5,
    icon: "🧴",
    chance: 0.2,
  },
  {
    name: "Old Newspaper",
    priceA: 20,
    priceB: 80,
    delay: 0.4,
    icon: "📰",
    chance: 0.25,
  },
  {
    name: "Aluminum Can",
    priceA: 40,
    priceB: 70,
    delay: 0.4,
    icon: "🥫",
    chance: 0.15,
  },
  {
    name: "Cardboard Box",
    priceA: 30,
    priceB: 70,
    delay: 0.6,
    icon: "📦",
    chance: 0.2,
  },
  {
    name: "Plastic Utensils",
    priceA: 50,
    priceB: 90,
    delay: 0.4,
    icon: "🍴",
    chance: 0.3,
  },
  {
    name: "Glass Bottle",
    priceA: 40,
    priceB: 80,
    delay: 0.6,
    icon: "🍾",
    chance: 0.25,
  },
  {
    name: "Newspaper Bundle",
    priceA: 30,
    priceB: 60,
    delay: 0.5,
    icon: "🗞️",
    chance: 0.2,
  },
  {
    name: "Plastic Bag",
    priceA: 20,
    priceB: 70,
    delay: 0.4,
    icon: "🛍️",
    chance: 0.3,
  },
  {
    name: "Metal Wire",
    priceA: 60,
    priceB: 200,
    delay: 0.6,
    icon: "🔗",
    chance: 0.15,
  },
  {
    name: "Paper Towel Roll",
    priceA: 20,
    priceB: 50,
    delay: 0.5,
    icon: "🧻",
    chance: 0.2,
  },
  {
    name: "Plastic Wrap",
    priceA: 30,
    priceB: 70,
    delay: 0.4,
    icon: "🎁",
    chance: 0.25,
  },
  {
    name: "Steel Can",
    priceA: 50,
    priceB: 90,
    delay: 0.6,
    icon: "🥫",
    chance: 0.2,
  },
  {
    name: "Magazine",
    priceA: 20,
    priceB: 50,
    delay: 0.5,
    icon: "📖",
    chance: 0.25,
  },
  {
    name: "Plastic Plate",
    priceA: 40,
    priceB: 80,
    delay: 0.4,
    icon: "🍽️",
    chance: 0.3,
  },
  {
    name: "Paper Bag",
    priceA: 30,
    priceB: 70,
    delay: 0.6,
    icon: "🛍️",
    chance: 0.2,
  },
  {
    name: "Tin Foil",
    priceA: 20,
    priceB: 60,
    delay: 0.5,
    icon: "🍽️",
    chance: 0.25,
  },
  {
    name: "Plastic Tray",
    priceA: 40,
    priceB: 70,
    delay: 0.4,
    icon: "🍽️",
    chance: 0.3,
  },
  {
    name: "Glass Bowl",
    priceA: 30,
    priceB: 50,
    delay: 0.6,
    icon: "🍲",
    chance: 0.2,
  },
  {
    name: "Paper Cup",
    priceA: 20,
    priceB: 40,
    delay: 0.5,
    icon: "🥤",
    chance: 0.25,
  },
];

export async function entry({
  input,
  output,
  money,
  args,
  prefix,
  CassExpress,
}) {
  const {
    money: userMoney,
    recycleStamp,
    recycleMaxZ: recycleMax = 50,
    totalRecycledItems = {},
    name,
  } = await money.get(input.senderID);
  if (!name) {
    return output.reply(
      "❌ Please register first using the identity-setname command."
    );
  }

  if (args[0] === "total") {
    let result = "📝 **Total Items Recycled**:\n\n";
    const sortedItems = Array.from(recyclableItems).sort((a, b) => {
      const totalA = totalRecycledItems[a.name] || 0;
      const totalB = totalRecycledItems[b.name] || 0;
      return totalB - totalA;
    });
    for (const item of sortedItems) {
      result += `♻️ ${item.icon} **${item.name}**: ${
        totalRecycledItems[item.name] || 0
      }\n`;
    }
    let totalRecycleCount = 0;
    for (const key in totalRecycledItems) {
      totalRecycleCount += totalRecycledItems[key];
    }

    result += `\n**Total**: ${totalRecycleCount}`;
    return output.reply(result);
  }

  const currentTimestamp = Date.now();
  let text = "";
  let newMoney = userMoney;
  let totalRecycled = 0;
  let failRecycle = 0;

  if (!recycleStamp) {
    text =
      "♻️ Cannot recycle since there are no items. Start collecting recyclables now, come back later!";
  } else {
    const elapsedTime = (currentTimestamp - recycleStamp) / 1000 / 60;

    let recycledItems = Array.from(recyclableItems).map((item) => {
      let recycleAmount = Math.max(0, Math.floor(elapsedTime / item.delay));
      const recycleArray = Array(recycleAmount).fill();
      recycleAmount = recycleArray.reduce(
        (acc) => acc + (Math.random() < item.chance / 2 ? 1 : 0),
        0
      );
      if (totalRecycled + recycleAmount > recycleMax) {
        failRecycle += totalRecycled + recycleAmount - recycleMax;
        recycleAmount = recycleMax - totalRecycled;
      }

      if (recycleAmount <= 0) {
        return null;
      }
      let price = Math.floor(
        Math.random() * (item.priceB - item.priceA + 1) + item.priceA
      );
      price = CassExpress.farmUP(price, totalRecycledItems);

      totalRecycled += recycleAmount;
      if (!totalRecycledItems[item.name]) {
        totalRecycledItems[item.name] = 0;
      }
      totalRecycledItems[item.name] += recycleAmount;

      return {
        ...item,
        price,
        recycleAmount,
        total: recycleAmount * price,
      };
    });
    recycledItems = recycledItems.filter((item) => item !== null);

    const totalRewards = recycledItems.reduce(
      (sum, item) => sum + item.total,
      0
    );
    newMoney += totalRewards;

    text = ` 📝 **Recycling Summary**:\n`;
    let types = 0;
    recycledItems = recycledItems.sort((a, b) => a.total - b.total);
    recycledItems.forEach((item) => {
      if (item.recycleAmount < 1) {
        return;
      }
      text += `♻️ ${item.icon} ${item.recycleAmount} **${item.name}(s)** recycled for **${item.price}$** each, total: **${item.total}$**\n`;
      types++;
    });
    if (failRecycle > 0) {
      text += `🥲 **Failed** recycling other ${failRecycle} **item(s)** due to full storage.\n`;
    }
    if (types === 0) {
      text += `\n🥲 No items recycled, start collecting recyclables!\n`;
    } else {
      text += `\n💚 Recycled ${types} type(s) of items.\n`;
      text += `\n📦 Storage: ${totalRecycled}/${recycleMax}\n♻️ You can **upgrade** your recycling capacity in the **shop!**\n`;
    }
    text += `\n💰 **Total earnings**: ${totalRewards}$\n💵 **Your Balance**: ${newMoney}$\n\n♻️ Start collecting recyclables now to earn more rewards!\n\nCome back after ${Math.floor(
      (currentTimestamp - recycleStamp) / 1000 / 60
    )} minutes to get the same amount of rewards.

You can also type **${prefix}recycle total**`;
  }

  await money.set(input.senderID, {
    money: newMoney,
    recycleStamp: currentTimestamp,
    recycleMaxZ: recycleMax,
    totalRecycledItems,
  });

  output.reply(text);
}

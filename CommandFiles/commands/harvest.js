export const meta = {
  name: "harvest",
  description: "Harvest crops and earn money!",
  version: "2.0.0",
  author: "Liane Cagara, Original Idea by: Rue",
  usage: "{prefix}harvest",
  category: "Fun",
  permissions: [0],
  noPrefix: "both",
  otherNames: [],
  shopPrice: 100,
  requirement: "2.5.0",
  icon: "",
};

export const style = {
  title: "Harvest 🌾",
  contentFont: "fancy",
  titleFont: "bold",
};

const crops = [
  {
    name: "Wheat",
    priceA: 30,
    priceB: 70,
    delay: 0.5,
    icon: "🌾",
    chance: 0.2,
  },
  {
    name: "Rice",
    priceA: 50,
    priceB: 100,
    delay: 0.5,
    icon: "🌾",
    chance: 0.2,
  },
  {
    name: "Corn",
    priceA: 20,
    priceB: 40,
    delay: 0.4,
    icon: "🌽",
    chance: 0.25,
  },
  {
    name: "Banana",
    priceA: 50,
    priceB: 250,
    delay: 2,
    icon: "🍌",
    chance: 0.3,
  },
  {
    name: "Tomato",
    priceA: 70,
    priceB: 150,
    delay: 1.5,
    icon: "🍅",
    chance: 0.4,
  },
  {
    name: "Carrot",
    priceA: 300,
    priceB: 400,
    delay: 2.5,
    icon: "🥕",
    chance: 0.5,
  },
  {
    name: "Potato",
    priceA: 600,
    priceB: 1500,
    delay: 7,
    icon: "🥔",
    chance: 0.7,
  },
  {
    name: "Kiwi",
    priceA: 10000,
    priceB: 20000,
    delay: 1,
    icon: "🥝",
    chance: 0.005,
  },
];

export async function entry({
  input,
  output,
  money,
  args,
  prefix,
  Inventory,
  generateGift,
  CassExpress,
}) {
  const {
    money: userMoney,
    plantStamp,
    plantMaxZ: plantMax = 30,
    totalCrops = {},
    name,
    inventory = [],
  } = await money.get(input.senderID);
  const userInventory = new Inventory(inventory);
  const gift = generateGift();
  if (!name) {
    return output.reply(
      "❌ Please register first using the identity-setname command."
    );
  }

  if (args[0] === "total") {
    let result = "📝 **Total Crops Harvested**:\n\n";
    const sortedCrops = Array.from(crops).sort((a, b) => {
      const totalA = totalCrops[a.name] || 0;
      const totalB = totalCrops[b.name] || 0;
      return totalB - totalA;
    });
    for (const crop of sortedCrops) {
      result += `✓ ${crop.icon} **${crop.name}**: ${
        totalCrops[crop.name] || 0
      }\n`;
    }
    let totalHarvest = 0;
    for (const key in totalCrops) {
      totalHarvest += totalCrops[key];
    }

    result += `\n**Total**: ${totalHarvest}`;
    return output.reply(result);
  }
  const currentTimestamp = Date.now();
  let text = "";
  let newMoney = userMoney;
  let totalYield = 0;
  let failYield = 0;

  if (!plantStamp) {
    text =
      "🌱 Cannot harvest since nothing is planted. Planting seeds now, come back later!";
  } else {
    const elapsedTime = (currentTimestamp - plantStamp) / 1000 / 60;

    let harvestedCrops = Array.from(crops).map((crop) => {
      let yieldAmount = Math.max(0, Math.floor(elapsedTime / crop.delay));
      const yieldArray = Array(yieldAmount).fill();
      yieldAmount = yieldArray.reduce(
        (acc) => acc + (Math.random() < crop.chance ? 1 : 0),
        0
      );
      if (totalYield + yieldAmount > plantMax) {
        failYield += totalYield + yieldAmount - plantMax;
        yieldAmount = plantMax - totalYield;
      }

      if (yieldAmount <= 0) {
        return null;
      }
      let price = Math.floor(
        Math.random() * (crop.priceB - crop.priceA + 1) + crop.priceA
      );
      price = CassExpress.farmUP(price, totalCrops);

      totalYield += yieldAmount;
      if (!totalCrops[crop.name]) {
        totalCrops[crop.name] = 0;
      }
      totalCrops[crop.name] += yieldAmount;

      return {
        ...crop,
        price,
        yieldAmount,
        total: yieldAmount * price,
      };
    });
    harvestedCrops = harvestedCrops.filter((crop) => crop !== null);

    const totalEarnings = harvestedCrops.reduce(
      (sum, crop) => sum + crop.total,
      0
    );
    newMoney += totalEarnings;

    text = ` 📝 **Harvest Summary**:\n`;
    let types = 0;
    harvestedCrops = harvestedCrops.sort((a, b) => a.total - b.total);
    harvestedCrops.forEach((crop) => {
      if (crop.yieldAmount < 1) {
        return;
      }
      text += `✓ ${crop.icon} ${crop.yieldAmount} **${crop.name}(s)** sold for **${crop.price}$** each, total: **${crop.total}$**\n`;
      types++;
    });
    if (failYield > 0) {
      text += `🥲 **Failed** harvesting other ${failYield} **crop(s)** due to full storage.\n`;
    }
    if (types === 0) {
      text += `\n🥲 No Crops harvested, you should wait for the next harvest!\n`;
    } else {
      text += `\n💗 Harvested ${types} type(s) of crops.\n`;
      text += `\n🗃️ Storage: ${totalYield}/${plantMax}\n✓ You can **upgrade** this storage by checking the **shop!**\n`;
    }
    const { invLimit } = global.Cassidy;

    if (totalYield > 100 && userInventory.getAll().length < invLimit) {
      text += `\n🎁 You received a **gift** from your harvest!\n`;
      userInventory.addOne(gift);
    }
    text += `\n✨ **Total earnings**: ${totalEarnings}$\n💰 **Your Balance**: ${newMoney}$\n\n🌱 Replanting seeds now, come back in ${Math.floor(
      (currentTimestamp - plantStamp) / 1000 / 60
    )} minutes if you want to harvest the same amount of crops.\n\nYou can also type **${prefix}harvest total**.`;
  }

  await money.set(input.senderID, {
    money: newMoney,
    plantStamp: currentTimestamp,
    plantMaxZ: plantMax,
    totalCrops,
    inventory: Array.from(userInventory),
  });

  output.reply(text);
}

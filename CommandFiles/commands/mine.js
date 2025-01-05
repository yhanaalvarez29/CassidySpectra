export const meta = {
  name: "mine",
  description: "Mine ores and earn money!",
  version: "1.2.2",
  author: "Liane Cagara, Original Idea by: Dymyrius",
  usage: "{prefix}mine",
  category: "Idle Accumulation Games",
  permissions: [0],
  noPrefix: "both",
  otherNames: [],
  shopPrice: 1000000,
  requirement: "2.5.0",
  icon: "⛏️",
};

export const style = {
  title: "Mine ⛏️",
  contentFont: "fancy",
  titleFont: "bold",
};

const ores = [
  { name: "Coal", priceA: 200, priceB: 1000, delay: 4, icon: "🪨", chance: 0.6 },
  { name: "Iron", priceA: 100, priceB: 400, delay: 8, icon: "⛏️", chance: 0.5 },
  {
    name: "Gold",
    priceA: 2000,
    priceB: 10000,
    delay: 16,
    icon: "🏅",
    chance: 0.4,
  },
  {
    name: "Diamond",
    priceA: 5000,
    priceB: 20000,
    delay: 24,
    icon: "💎",
    chance: 0.2,
  },
  {
    name: "Emerald",
    priceA: 8000,
    priceB: 30000,
    delay: 32,
    icon: "📿",
    chance: 0.1,
  },
];

export async function entry({ input, output, money, args, prefix, CassExpress }) {
  const {
    money: userMoney,
    mineStamp,
    mineMaxZ: mineMax = 30,
    totalOres = {},
    name,
  } = await money.get(input.senderID);

  if (!name) {
    return output.reply(
      "❌ Please register first using the identity-setname command.",
    );
  }

  if (args[0] === "total") {
    let result = "📝 **Total Ores Mined**:\n\n";
    const sortedOres = Array.from(ores).sort((a, b) => {
      const totalA = totalOres[a.name] || 0;
      const totalB = totalOres[b.name] || 0;
      return totalB - totalA;
    });
    for (const ore of sortedOres) {
      result += `✓ ${ore.icon} **${ore.name}**: ${totalOres[ore.name] || 0}\n`;
    }
    result += `\n**Total**: ${Object.values(totalOres).reduce((acc, val) => acc + val, 0)}`;
    return output.reply(result);
  }

  const currentTimestamp = Date.now();
  let text = "";
  let newMoney = userMoney;
  let totalYield = 0;

  if (!mineStamp) {
    text =
      "⛏️ You haven't started mining yet. Start mining and come back later to collect ores!";
  } else {
    const elapsedTime = (currentTimestamp - mineStamp) / 1000 / 60;
    let minedOres = Array.from(ores)
      .reverse()
      .map((ore) => {
        let yieldAmount = Math.max(0, Math.floor(elapsedTime / ore.delay));
        const yieldArray = Array(yieldAmount).fill();
        yieldAmount = yieldArray.reduce(
          (acc) => acc + (Math.random() < ore.chance ? 1 : 0),
          0,
        );
        if (totalYield + yieldAmount > mineMax) {
          yieldAmount = mineMax - totalYield;
        }

        if (yieldAmount <= 0) {
          return null;
        }
        let price = Math.floor(
          Math.random() * (ore.priceB - ore.priceA + 1) + ore.priceA,
        );
        price = CassExpress.farmUP(price, totalOres);

        totalYield += yieldAmount;
        if (!totalOres[ore.name]) {
          totalOres[ore.name] = 0;
        }
        totalOres[ore.name] += yieldAmount;

        return {
          ...ore,
          price,
          yieldAmount,
          total: yieldAmount * price,
        };
      });
    minedOres = minedOres.filter((ore) => ore !== null);

    const totalEarnings = minedOres.reduce((sum, ore) => sum + ore.total, 0);
    newMoney += totalEarnings;

    text = `📝 **Mining Summary**:\n`;
    let types = 0;
    minedOres = minedOres.sort((a, b) => a.total - b.total);
    minedOres.forEach((ore) => {
      if (ore.yieldAmount < 1) {
        return;
      }
      text += `✓ ${ore.icon} ${ore.yieldAmount} **${ore.name}(s)** sold for **${ore.price}$** each, total: **${ore.total}$**\n`;
      types++;
    });
    if (types === 0) {
      text += `\n🥲 No ores mined, you should wait for the next mining cycle!\n`;
    } else {
      text += `\n💗 Mined ${types} type(s) of ores.\n`;
      text += `\n🗃️ Storage: ${totalYield}/${mineMax}\n✓ You can **upgrade** this storage by checking the **shop!**\n`;
    }
    text += `\n✨ **Total earnings**: ${totalEarnings}$\n💰 **Your Balance**: ${newMoney}$\n\n⛏️ Starting a new mining cycle, come back in ${Math.floor((currentTimestamp - mineStamp) / 1000 / 60)} minutes if you want to collect the same amount of ores.\n\nYou can also type **${prefix}mine total** to see your total ores mined.`;
  }

  await money.set(input.senderID, {
    money: newMoney,
    mineStamp: currentTimestamp,
    mineMaxZ: mineMax,
    totalOres,
  });

  output.reply(text);
}

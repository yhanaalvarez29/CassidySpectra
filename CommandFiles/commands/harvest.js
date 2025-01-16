export const meta = {
  name: "harvest",
  description: "Harvest crops and earn money!",
  version: "2.5.0",
  author: "Liane Cagara, Original Idea by: Rue",
  usage: "{prefix}harvest",
  category: "Idle Accumulation Games",
  permissions: [0],
  noPrefix: "both",
  otherNames: ["plant"],
  shopPrice: 100,
  requirement: "2.5.0",
  icon: "🌾",
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

const harv = {
  key: "plant",
  verb: "harvest",
  verbing: "harvesting",
  pastTense: "harvested",
  checkIcon: "✓",
  initialStorage: 30,
  itemData: crops,
  actionEmoji: "🌱",
};

/**
 * @type {CommandEntry}
 */
export async function entry({ GameSimulator }) {
  const simu = new GameSimulator(harv);
  await simu.simulateAction();
}

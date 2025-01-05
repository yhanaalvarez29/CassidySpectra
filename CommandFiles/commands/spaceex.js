export const meta = {
  name: "spaceexplorer",
  description:
    "Explore distant planets, collect space resources, and upgrade your ship for more rewards in the cosmos!",
  version: "1.0.0",
  author: "Liane Cagara",
  usage: "{prefix}spaceexplorer",
  category: "Idle Accumulation Games",
  permissions: [0],
  noPrefix: false,
  requirement: "2.5.0",
  icon: "🚀",
  otherNames: ["spaceex"],
  shopPrice: 700,
};

export const style = {
  title: "Space Explorer 🚀",
  contentFont: "fancy",
  titleFont: "bold",
};

const spaceExplorerSimulation = {
  key: "spaceexplorer",
  verb: "explore",
  verbing: "exploring",
  pastTense: "explored",
  checkIcon: "✅",
  initialStorage: 50,
  itemData: [
    {
      icon: "🌑",
      delay: 10,
      priceA: 50,
      priceB: 80,
      name: "Moon Rock",
      chance: 0.85,
    },
    {
      icon: "💫",
      delay: 12,
      priceA: 60,
      priceB: 100,
      name: "Star Dust",
      chance: 0.75,
    },
    {
      icon: "🛸",
      delay: 15,
      priceA: 100,
      priceB: 150,
      name: "Alien Tech",
      chance: 0.65,
    },
    {
      icon: "🪐",
      delay: 20,
      priceA: 200,
      priceB: 300,
      name: "Planetary Crystals",
      chance: 0.6,
    },
  ],
  actionEmoji: "🚀",
};

export async function entry({ GameSimulator }) {
  const simu = new GameSimulator(spaceExplorerSimulation);
  await simu.simulateAction();
}

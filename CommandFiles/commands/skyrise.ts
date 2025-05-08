/* SkyForge Empire - A floating island empire simulator */
import { InventoryItem } from "@cass-modules/cassidyUser";
import { CassEXP } from "../modules/cassEXP.js";
import { UNIRedux } from "../modules/unisym.js";
import { Inventory } from "@cassidy/ut-shop";
import { SpectralCMDHome } from "@cassidy/spectral-home";
import { formatCash } from "@cass-modules/ArielUtils";

export const meta: CassidySpectra.CommandMeta = {
  name: "skyrise",
  description: "Build and manage your floating island empire!",
  otherNames: ["srs", "sky", "skyr"],
  version: "1.0.1",
  usage: "{prefix}{name} <command> [args]",
  category: "Idle Investment Games",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 1,
  requirement: "3.0.0",
  icon: "🏰",
  cmdType: "cplx_g",
};

const { invLimit } = global.Cassidy;

export const style: CassidySpectra.CommandStyle = {
  title: "SkyRise Empire 🏰",
  titleFont: "bold",
  contentFont: "fancy",
  footer: {
    content: "Made with 🤍 by Liane Cagara",
    text_font: "fancy",
  },
};

interface Production {
  resource: "aether" | "crystal" | "stone" | "all" | "none";
  amount: number;
  interval: number;
}

type SkyForgeBuilding = InventoryItem & {
  level: number;
  lastCollect: number;
  production: Production;
  workers: number;
  key: string;
  name: string;
  icon: string;
  achievements?: string[];
};

const shopItems: Array<{
  icon: string;
  name: string;
  flavorText: string;
  key: string;
  type?: string;
  price: { aether: number; crystal: number; stone: number; money: number };
  onPurchase: (context: {
    moneySet: { inventory: SkyForgeBuilding[]; srworkers: number };
  }) => void;
}> = [
  {
    icon: "🌬️",
    name: "Aether Collector",
    flavorText: "Harvests mystical **Aether** from the skies.",
    key: "aetherCollector",
    price: { aether: 0, crystal: 0, stone: 0, money: 5000 },
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Aether Collector",
        key: "aetherCollector",
        flavorText: "Produces **Aether** over time.",
        icon: "🌬️",
        type: "srbuilding",
        sellPrice: 25,
        production: { resource: "aether", amount: 10, interval: 60 * 1000 },
        level: 1,
        lastCollect: Date.now(),
        workers: 0,
      });
    },
  },
  {
    icon: "💎",
    name: "Crystal Mine",
    flavorText: "Mines sparkling **Crystals** from the island core.",
    key: "crystalMine",
    price: { aether: 50, crystal: 0, stone: 0, money: 10000 },
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Crystal Mine",
        key: "crystalMine",
        flavorText: "Produces **Crystals** over time.",
        icon: "💎",
        type: "srbuilding",
        sellPrice: 25,
        production: { resource: "crystal", amount: 10, interval: 60 * 1000 },
        level: 1,
        lastCollect: Date.now(),
        workers: 0,
      });
    },
  },
  {
    icon: "🪨",
    name: "Stone Quarry",
    flavorText: "Extracts sturdy **Stone** from the island.",
    key: "stoneQuarry",
    price: { aether: 50, crystal: 50, stone: 0, money: 20000 },
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Stone Quarry",
        key: "stoneQuarry",
        flavorText: "Produces **Stone** over time.",
        icon: "🪨",
        type: "srbuilding",
        sellPrice: 25,
        production: { resource: "stone", amount: 10, interval: 60 * 1000 },
        level: 1,
        lastCollect: Date.now(),
        workers: 0,
      });
    },
  },
  {
    icon: "⚒️",
    name: "Sky Forge",
    flavorText: "Crafts powerful upgrades for your empire.",
    key: "skyForge",
    price: { aether: 100, crystal: 100, stone: 100, money: 100000 },
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Sky Forge",
        key: "skyForge",
        flavorText: "Boosts production of **all resources** when upgraded.",
        icon: "⚒️",
        type: "srbuilding",
        sellPrice: 50,
        production: { resource: "all", amount: 5, interval: 120 * 1000 },
        level: 1,
        lastCollect: Date.now(),
        workers: 0,
      });
    },
  },
  {
    icon: "🛠️",
    name: "Worker",
    type: "srworker",
    flavorText: "Increases building efficiency.",
    key: "srworker",
    price: { aether: 200, crystal: 200, stone: 200, money: 200000 },
    onPurchase({ moneySet }) {
      moneySet.srworkers = (moneySet.srworkers || 0) + 1;
    },
  },
];

function updateBuildingData(building: SkyForgeBuilding): SkyForgeBuilding {
  const defaults: Partial<SkyForgeBuilding> = {
    level: 1,
    lastCollect: Date.now(),
    production: building.production || {
      resource: "none",
      amount: 0,
      interval: 0,
    },
    workers: 0,
    key: building.key || `building:unknown_${Date.now()}`,
    name: building.name || "Unnamed",
    icon: building.icon || "🏠",
    type: building.type || "srbuilding",
    sellPrice: building.sellPrice || 0,
  };
  const updatedBuilding = { ...defaults, ...building };
  updatedBuilding.level = Math.max(1, Math.floor(updatedBuilding.level));
  return updatedBuilding;
}

function calculateProduction(
  building: SkyForgeBuilding,
  _srworkers: number
): number {
  const updatedBuilding = updateBuildingData(building);
  const timeSinceCollect = Date.now() - updatedBuilding.lastCollect;
  const intervals = Math.floor(
    timeSinceCollect / updatedBuilding.production.interval
  );
  const workerBoost = 1 + (updatedBuilding.workers || 0) * 0.2;
  const baseAmount =
    updatedBuilding.production.amount *
    updatedBuilding.level *
    intervals *
    workerBoost;
  return Math.floor(baseAmount * ((_srworkers ?? 0) + 1));
}

function calculateUpgradeCost(building: SkyForgeBuilding) {
  const level = building.level || 1;
  return {
    aether: 50 * level,
    crystal: 50 * level,
    stone: 50 * level,
    money: 50 * level,
  };
}

function hasEnoughResources(
  playerResources: {
    aether: number;
    crystal: number;
    stone: number;
    money: number;
  },
  cost: { aether: number; crystal: number; stone: number; money: number }
) {
  return (
    playerResources.aether >= (cost.aether || 0) &&
    playerResources.crystal >= (cost.crystal || 0) &&
    playerResources.stone >= (cost.stone || 0) &&
    playerResources.money >= (cost.money || 0)
  );
}

function suggestNextAction(
  buildingsData: Inventory,
  resources: { aether: number; crystal: number; stone: number; money: number },
  srworkers: number,
  prefix: string
): string {
  const buildings = buildingsData.getAll() as SkyForgeBuilding[];
  const hasResources =
    resources.aether >= 50 || resources.crystal >= 50 || resources.stone >= 50;
  const canUpgrade = buildings.some((b) => {
    const cost = calculateUpgradeCost(b);
    return hasEnoughResources(resources, cost);
  });
  const canBuyWorker = hasEnoughResources(resources, {
    aether: 200,
    crystal: 200,
    stone: 200,
    money: 0,
  });
  const totalAssignedWorkers = buildings.reduce(
    (sum, b) => sum + (b.workers || 0),
    0
  );

  if (buildings.length === 0) {
    return `***Start building*** your empire! Use ${prefix}skyrise shop to buy an **Aether Collector**.`;
  }
  if (buildings.some((b) => calculateProduction(b, srworkers) > 0)) {
    return `***Collect resources*** now! Use ${prefix}skyrise collect to gather **Aether**, **Crystal**, and **Stone**.`;
  }
  if (canUpgrade) {
    return `***Upgrade a building*** to boost production! Use ${prefix}skyrise upgrade <building_name> (check ${prefix}skyrise status).`;
  }
  if (canBuyWorker && totalAssignedWorkers < srworkers) {
    return `***Assign workers*** to improve efficiency! Use ${prefix}skyrise worker <building_name> assign 1 or buy more with ${prefix}skyrise shop.`;
  }
  if (hasResources && buildings.length < invLimit) {
    return `***Expand your empire***! Use ${prefix}skyrise shop to build more structures like a **Crystal Mine**.`;
  }
  return `***Defend your empire***! Use ${prefix}skyrise defend to protect against **Sky Pirates**.`;
}

const achievements: Record<
  string,
  {
    condition: (buildings: SkyForgeBuilding[]) => boolean;
    reward: { aether?: number; crystal?: number; stone?: number };
  }
> = {
  "First Collector": {
    condition: (buildings) =>
      buildings.some((b) => b.key === "aetherCollector"),
    reward: { aether: 100 },
  },
  "Mining Magnate": {
    condition: (buildings) =>
      buildings.filter((b) => b.key === "crystalMine").length >= 3,
    reward: { crystal: 200 },
  },
  "Stone Lord": {
    condition: (buildings) =>
      buildings.filter((b) => b.key === "stoneQuarry").length >= 3,
    reward: { stone: 200 },
  },
  "Forge Master": {
    condition: (buildings) =>
      buildings.some((b) => b.key === "skyForge" && b.level >= 2),
    reward: { aether: 150, crystal: 150, stone: 150 },
  },
};

export async function entry(ctx: CommandContext) {
  const { input, output, money, Inventory, prefix } = ctx;
  const {
    name = "Unregistered",
    srbuildings: rawBuildingsData = [],
    inventory: rawInventory = [],
    aether = 0,
    crystal = 0,
    stone = 0,
    srworkers = 0,
    cassEXP: cxp,
    money: userMoney,
    tutorialStep = 0,
  } = await money.getCache(input.senderID);

  const home = new SpectralCMDHome(
    {
      isHypen: false,
      defaultKey: "lobby",
    },
    [
      {
        key: "status",
        description: "View your empire's **status** and **resources**",
        aliases: ["-s"],
        async handler() {
          const buildingsData = new Inventory(rawBuildingsData);
          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Empire Status***\n\n`;
          result += `**Resources**:\n`;
          result += `🌬️ **Aether**: ${aether}\n`;
          result += `💎 **Crystal**: ${crystal}\n`;
          result += `🪨 **Stone**: ${stone}\n`;
          result += `👷 **Workers**: ${srworkers}/10\n`;
          result += `💰 **Money**: ${formatCash(userMoney)}\n\n`;
          result += `${UNIRedux.arrow} ***Buildings***\n\n`;
          const buildings = buildingsData.getAll() as SkyForgeBuilding[];
          if (buildings.length === 0) {
            result += `❌ No **buildings** yet! Visit the **Sky Market** with ${prefix}skyrise shop.\n`;
          } else {
            for (const building of buildings) {
              const updatedBuilding = updateBuildingData(building);
              const production = calculateProduction(
                updatedBuilding,
                srworkers
              );
              result += `${updatedBuilding.icon} **${updatedBuilding.name}** (Level ${updatedBuilding.level})\n`;
              result += `👷 Workers: ${updatedBuilding.workers || 0}\n`;
              result += `📈 Production: ${production} **${updatedBuilding.production.resource}**\n`;
              result += `🆔 ID: ${updatedBuilding.key}\n\n`;
            }
          }
          result += `\n📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Check ${prefix}skyrise guide for all commands!`;
          return output.reply(result);
        },
      },
      {
        key: "build",
        description: "Construct a new **building** for your empire",
        aliases: ["-b"],
        args: ["<building_key>"],
        async handler(_, { spectralArgs }) {
          const buildingsData = new Inventory(rawBuildingsData);
          const inventory = new Inventory(rawInventory);
          const buildingKey = spectralArgs[0];

          if (!buildingKey) {
            let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Build Guide***\n\n`;
            result += `❌ No **building key** provided! To ***build***, visit the **Sky Market** to purchase a building.\n\n`;
            result += `**Usage**: ${prefix}skyrise build <building_key>\n`;
            result += `**Example**: ${prefix}skyrise build aetherCollector to build an **Aether Collector**.\n\n`;
            result += `📝 **Next Step**: Use ${prefix}skyrise shop to browse available **buildings**!\n`;
            result += `🔔 **Reminder**: Check your **resources** with ${prefix}skyrise status.`;
            return output.reply(result);
          }

          const newBuilding = inventory.getOne(buildingKey) as
            | SkyForgeBuilding
            | undefined;
          if (!newBuilding) {
            return output.reply(
              `👤 **${name}** (SkyForge)\n\n❌ Invalid **building key**! Use ${prefix}skyrise shop to see options.\n` +
                `\n📝 **Next Step**: ${suggestNextAction(
                  buildingsData,
                  { aether, crystal, stone, money: userMoney },
                  srworkers,
                  prefix
                )}\n` +
                `🔔 **Reminder**: Collect **resources** with ${prefix}skyrise collect.`
            );
          }

          if (buildingsData.getAll().length >= invLimit) {
            return output.reply(
              `👤 **${name}** (SkyForge)\n\n❌ **Island full**! Max ${invLimit} **buildings**.\n` +
                `\n📝 **Next Step**: ${suggestNextAction(
                  buildingsData,
                  { aether, crystal, stone, money: userMoney },
                  srworkers,
                  prefix
                )}\n` +
                `🔔 **Reminder**: ***Upgrade*** existing buildings with ${prefix}skyrise upgrade <building_name>.`
            );
          }

          inventory.deleteOne(buildingKey);
          buildingsData.addOne({
            ...newBuilding,
            key: `building:${buildingKey}_${Date.now()}`,
            level: 1,
            lastCollect: Date.now(),
            workers: 0,
          });

          await money.setItem(input.senderID, {
            srbuildings: Array.from(buildingsData),
            inventory: Array.from(inventory),
          });

          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***New Building***\n\n`;
          result += `✅ Built ${newBuilding.icon} **${newBuilding.name}**!\n`;
          result += `📈 Produces ${newBuilding.production.amount} **${newBuilding.production.resource}**/min.\n`;
          result += `📜 Your empire grows stronger with this **building**! It will generate **resources** over time.\n`;
          result += `\n📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Collect **resources** regularly with ${prefix}skyrise collect.`;
          return output.reply(result);
        },
      },
      {
        key: "collect",
        description: "Collect **resources** from your buildings",
        aliases: ["-c"],
        async handler() {
          const buildingsData = new Inventory(rawBuildingsData);
          const cassEXP = new CassEXP(cxp);
          let totalAether: number = aether;
          let totalCrystal: number = crystal;
          let totalStone: number = stone;
          let totalMoney: number = userMoney;
          let collected = false;

          for (const building of buildingsData.getAll() as SkyForgeBuilding[]) {
            const updatedBuilding = updateBuildingData(building);
            const production = calculateProduction(updatedBuilding, srworkers);
            if (production > 0) {
              collected = true;
              if (updatedBuilding.production.resource === "aether") {
                totalAether += production;
              } else if (updatedBuilding.production.resource === "crystal") {
                totalCrystal += production;
              } else if (updatedBuilding.production.resource === "stone") {
                totalStone += production;
              } else if (updatedBuilding.production.resource === "all") {
                totalAether += production;
                totalCrystal += production;
                totalStone += production;
              }
              totalMoney += production;
              updatedBuilding.lastCollect = Date.now();
              buildingsData.deleteOne(updatedBuilding.key);
              buildingsData.addOne(updatedBuilding);
            }
          }

          if (!collected) {
            return output.reply(
              `👤 **${name}** (SkyForge)\n\n❌ No **resources** to ***collect*** yet! Wait for your **buildings** to produce.\n` +
                `\n📝 **Next Step**: ${suggestNextAction(
                  buildingsData,
                  { aether, crystal, stone, money: userMoney },
                  srworkers,
                  prefix
                )}\n` +
                `🔔 **Reminder**: Check your **status** with ${prefix}skyrise status.`
            );
          }

          cassEXP.expControls.raise(10);
          await money.setItem(input.senderID, {
            aether: totalAether,
            crystal: totalCrystal,
            stone: totalStone,
            money: totalMoney,
            srbuildings: Array.from(buildingsData),
            cassEXP: cassEXP.raw(),
          });

          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Resources Collected***\n\n`;
          result += `✅ Gathered **resources** from your **buildings**!\n`;
          result += `🌬️ **Aether**: ${totalAether} (+${
            totalAether - aether
          })\n`;
          result += `💎 **Crystal**: ${totalCrystal} (+${
            totalCrystal - crystal
          })\n`;
          result += `🪨 **Stone**: ${totalStone} (+${totalStone - stone})\n`;
          result += `🌟 **EXP**: +10\n`;
          result += `💰 **Money**: ${formatCash(totalMoney)} (${formatCash(
            totalMoney - userMoney
          )})\n`;
          result += `📜 Collecting keeps your empire thriving! Use **resources** to ***build*** or ***upgrade***.\n`;
          result += `\n📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Protect your **resources** with ${prefix}skyrise defend.`;
          return output.reply(result);
        },
      },
      {
        key: "upgrade",
        description: "Upgrade a **building** to boost production",
        aliases: ["-u"],
        args: ["<building_name>"],
        async handler(_, { spectralArgs }) {
          const buildingsData = new Inventory(rawBuildingsData);
          const buildingName = spectralArgs.join(" ");

          if (!buildingName) {
            let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Upgrade Guide***\n\n`;
            result += `❌ No **building name** provided! To ***upgrade***, specify a building from your empire.\n\n`;
            result += `**Usage**: ${prefix}skyrise upgrade <building_name>\n`;
            result += `**Example**: ${prefix}skyrise upgrade Aether Collector to upgrade an **Aether Collector**.\n\n`;
            result += `**Your Buildings**:\n`;
            const buildings = buildingsData.getAll() as SkyForgeBuilding[];
            if (buildings.length === 0) {
              result += `❌ No **buildings** yet! Visit the **Sky Market** with ${prefix}skyrise shop.\n`;
            } else {
              buildings.forEach((b) => {
                const cost = calculateUpgradeCost(b);
                result += `${b.icon} **${b.name}** (Level ${b.level})\n`;
                result += `💰 Cost: ${cost.aether} **Aether**, ${
                  cost.crystal
                } **Crystal**, ${cost.stone} **Stone**, and ${formatCash(
                  cost.money
                )}\n\n`;
              });
            }
            result += `📝 **Next Step**: ${suggestNextAction(
              buildingsData,
              { aether, crystal, stone, money: userMoney },
              srworkers,
              prefix
            )}\n`;
            result += `🔔 **Reminder**: Check your **buildings** with ${prefix}skyrise status.`;
            return output.reply(result);
          }

          const building = (buildingsData.getAll() as SkyForgeBuilding[]).find(
            (b) => b.name.toLowerCase() === buildingName.toLowerCase()
          );
          if (!building) {
            return output.reply(
              `👤 **${name}** (SkyForge)\n\n❌ No **building** named "${buildingName}"! Check ${prefix}skyrise status.\n` +
                `\n📝 **Next Step**: ${suggestNextAction(
                  buildingsData,
                  { aether, crystal, stone, money: userMoney },
                  srworkers,
                  prefix
                )}\n` +
                `🔔 **Reminder**: Collect **resources** with ${prefix}skyrise collect.`
            );
          }

          const cost = calculateUpgradeCost(building);
          if (
            !hasEnoughResources(
              { aether, crystal, stone, money: userMoney },
              cost
            )
          ) {
            return output.reply(
              `👤 **${name}** (SkyForge)\n\n❌ Not enough **resources**! Need: ${
                cost.aether
              } **Aether**, ${cost.crystal} **Crystal**, ${
                cost.stone
              } **Stone** and ${formatCash(cost.money)}\n` +
                `\n📝 **Next Step**: ${suggestNextAction(
                  buildingsData,
                  { aether, crystal, stone, money: userMoney },
                  srworkers,
                  prefix
                )}\n` +
                `🔔 **Reminder**: Collect **resources** with ${prefix}skyrise collect.`
            );
          }

          building.level += 1;
          building.lastCollect = Date.now();
          buildingsData.deleteOne(building.key);
          buildingsData.addOne(updateBuildingData(building));

          await money.setItem(input.senderID, {
            aether: aether - (cost.aether ?? 0),
            crystal: crystal - (cost.crystal ?? 0),
            stone: stone - (cost.stone ?? 0),
            money: userMoney - (cost.money ?? 0),
            srbuildings: Array.from(buildingsData),
          });

          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Building Upgraded***\n\n`;
          result += `✅ Upgraded ${building.icon} **${building.name}** to **Level ${building.level}**!\n`;
          result += `💰 Spent: ${cost.aether} **Aether**, ${
            cost.crystal
          } **Crystal**, ${cost.stone} **Stone**, and ${formatCash(
            cost.money
          )}\n`;
          result += `📈 **Production increased**! Your **${building.name}** now generates more **${building.production.resource}**.\n`;
          result += `\n📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Assign **workers** to this building with ${prefix}skyrise worker ${building.name} assign 1.`;
          return output.reply(result);
        },
      },
      {
        key: "defend",
        description: "Defend against **Sky Pirates**",
        aliases: ["-d"],
        async handler() {
          const buildingsData = new Inventory(rawBuildingsData);
          const cassEXP = new CassEXP(cxp);
          const totalLevel = (
            buildingsData.getAll() as SkyForgeBuilding[]
          ).reduce((sum, b) => sum + b.level, 0);
          const pirateStrength = Math.floor(Math.random() * 10) + 5;
          const defenseStrength = totalLevel + srworkers * 2;

          const success = defenseStrength >= pirateStrength;
          let reward = { aether: 0, crystal: 0, stone: 0 };
          let loss = { aether: 0, crystal: 0, stone: 0 };

          if (success) {
            reward = {
              aether: 100 * buildingsData.getAll().length,
              crystal: 100 * buildingsData.getAll().length,
              stone: 100 * buildingsData.getAll().length,
            };
            cassEXP.expControls.raise(20);
          } else {
            loss = {
              aether: Math.min(aether, 50 * buildingsData.getAll().length),
              crystal: Math.min(crystal, 50 * buildingsData.getAll().length),
              stone: Math.min(stone, 50 * buildingsData.getAll().length),
            };
            cassEXP.expControls.raise(5);
          }

          await money.setItem(input.senderID, {
            aether: aether + reward.aether - loss.aether,
            crystal: crystal + reward.crystal - loss.crystal,
            stone: stone + reward.stone - loss.stone,
            cassEXP: cassEXP.raw(),
          });

          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Sky Pirate Raid***\n\n`;
          result += `🏴‍☠️ Defense: ${defenseStrength} vs **Pirates**: ${pirateStrength}\n`;
          if (success) {
            result += `✅ **Repelled Sky Pirates**!\n`;
            result += `🏆 Rewards: ${reward.aether} **Aether**, ${reward.crystal} **Crystal**, ${reward.stone} **Stone**\n`;
            result += `🌟 **EXP**: +20\n`;
            result += `📜 Your empire stands strong! These **resources** will fuel your growth.\n`;
          } else {
            result += `❌ **Sky Pirates stole resources**!\n`;
            result += `💥 Loss: ${loss.aether} **Aether**, ${loss.crystal} **Crystal**, ${loss.stone} **Stone**\n`;
            result += `🌟 **EXP**: +5\n`;
            result += `📜 Don't worry, rebuild stronger! ***Upgrade*** your **buildings** to improve defense.\n`;
          }
          result += `\n📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Check ${prefix}skyrise status to monitor your empire.`;
          return output.reply(result);
        },
      },
      {
        key: "shop",
        description: "Visit the **Sky Market** to buy buildings or workers",
        aliases: ["-sh"],
        args: ["[buy <item_key>]"],
        async handler(_, { spectralArgs }) {
          const buildingsData = new Inventory(rawBuildingsData);
          const inventory = new Inventory(rawInventory);

          if (spectralArgs[0] === "buy" && spectralArgs[1]) {
            const itemKey = spectralArgs[1];
            const shopItem = shopItems.find((item) => item.key === itemKey);
            if (!shopItem) {
              return output.reply(
                `👤 **${name}** (SkyForge)\n\n❌ Invalid **item key** "${itemKey}"! Use ${prefix}skyrise shop to see available items.\n` +
                  `\n📝 **Next Step**: ${suggestNextAction(
                    buildingsData,
                    { aether, crystal, stone, money: userMoney },
                    srworkers,
                    prefix
                  )}\n` +
                  `🔔 **Reminder**: Collect **resources** with ${prefix}skyrise collect.`
              );
            }

            if (
              !hasEnoughResources(
                { aether, crystal, stone, money: userMoney },
                shopItem.price
              )
            ) {
              return output.reply(
                `👤 **${name}** (SkyForge)\n\n❌ Not enough **resources**! Need: ${
                  shopItem.price.aether
                } **Aether**, ${shopItem.price.crystal} **Crystal**, ${
                  shopItem.price.stone
                } **Stone**, and ${formatCash(shopItem.price.money)}\n` +
                  `\n📝 **Next Step**: ${suggestNextAction(
                    buildingsData,
                    { aether, crystal, stone, money: userMoney },
                    srworkers,
                    prefix
                  )}\n` +
                  `🔔 **Reminder**: Collect **resources** with ${prefix}skyrise collect.`
              );
            }

            shopItem.onPurchase({
              moneySet: {
                inventory: inventory.inv as SkyForgeBuilding[],
                srworkers,
              },
            });
            await money.setItem(input.senderID, {
              aether: aether - (shopItem.price.aether || 0),
              crystal: crystal - (shopItem.price.crystal || 0),
              stone: stone - (shopItem.price.stone || 0),
              money: userMoney - (shopItem.price.money || 0),
              inventory: Array.from(inventory),
              srworkers:
                shopItem.type === "srworker" ? srworkers + 1 : srworkers,
            });

            let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Purchase Successrul***\n\n`;
            result += `✅ Bought ${shopItem.icon} **${shopItem.name}**!\n`;
            result += `💰 Spent: ${shopItem.price.aether} **Aether**, ${
              shopItem.price.crystal
            } **Crystal**, ${shopItem.price.stone} **Stone**, and ${formatCash(
              shopItem.price.money
            )}\n`;
            result += `📜 ${
              shopItem.type === "srworker"
                ? `Your new **worker** can be assigned to buildings!`
                : `Use ${prefix}skyrise build ${shopItem.key} to construct this **building**.`
            }\n`;
            result += `\n📝 **Next Step**: ${suggestNextAction(
              buildingsData,
              { aether, crystal, stone, money: userMoney },
              srworkers,
              prefix
            )}\n`;
            result += `🔔 **Reminder**: Check ${prefix}skyrise status to monitor your empire.`;
            return output.reply(result);
          }

          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Sky Market***\n\n`;
          result += `🏪 Welcome to the **Sky Market**! Browse **buildings** and **workers** to expand your empire.\n\n`;
          result += `**Usage**: ${prefix}skyrise shop [buy <item_key>]\n`;
          result += `**Example**: ${prefix}skyrise shop buy aetherCollector to buy an **Aether Collector**.\n\n`;
          result += `**Available Items**:\n`;
          shopItems.forEach((item) => {
            result += `${item.icon} **${item.name}** (${item.key})\n`;
            result += `💰 Cost: ${item.price.aether} **Aether**, ${
              item.price.crystal
            } **Crystal**, ${item.price.stone} **Stone**, and ${formatCash(
              item.price.money
            )}\n`;
            result += `📜 ${item.flavorText}\n\n`;
          });
          result += `📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Collect **resources** with ${prefix}skyrise collect to afford purchases.`;
          return output.reply(result);
        },
      },
      {
        key: "worker",
        description: "Assign or remove **workers** from buildings",
        aliases: ["-w"],
        args: ["<building_name>", "<assign|remove>", "<amount>"],
        async handler(_, { spectralArgs }) {
          const buildingsData = new Inventory(rawBuildingsData);
          const [buildingName, action, amountStr] = spectralArgs;
          const amount = parseInt(amountStr) || 1;

          if (!buildingName || !action || isNaN(amount)) {
            let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Worker Guide***\n\n`;
            result += `❌ Missing or invalid arguments! To manage **workers**, specify a **building**, action, and amount.\n\n`;
            result += `**Usage**: ${prefix}skyrise worker <building_name> <assign|remove> <amount>\n`;
            result += `**Examples**:\n`;
            result += `- ${prefix}skyrise worker Aether Collector assign 1 to assign 1 **worker**.\n`;
            result += `- ${prefix}skyrise worker Crystal Mine remove 2 to remove 2 **workers**.\n\n`;
            result += `**Your Buildings**:\n`;
            const buildings = buildingsData.getAll() as SkyForgeBuilding[];
            if (buildings.length === 0) {
              result += `❌ No **buildings** yet! Visit the **Sky Market** with ${prefix}skyrise shop.\n`;
            } else {
              buildings.forEach((b) => {
                result += `${b.icon} **${b.name}** (Workers: ${
                  b.workers || 0
                })\n`;
              });
            }
            result += `\n📝 **Next Step**: ${suggestNextAction(
              buildingsData,
              { aether, crystal, stone, money: userMoney },
              srworkers,
              prefix
            )}\n`;
            result += `🔔 **Reminder**: Buy more **workers** with ${prefix}skyrise shop.`;
            return output.reply(result);
          }

          const building = (buildingsData.getAll() as SkyForgeBuilding[]).find(
            (b) => b.name.toLowerCase() === buildingName.toLowerCase()
          );
          if (!building) {
            return output.reply(
              `👤 **${name}** (SkyForge)\n\n❌ No **building** named "${buildingName}"! Check ${prefix}skyrise status.\n` +
                `\n📝 **Next Step**: ${suggestNextAction(
                  buildingsData,
                  { aether, crystal, stone, money: userMoney },
                  srworkers,
                  prefix
                )}\n` +
                `🔔 **Reminder**: Collect **resources** with ${prefix}skyrise collect.`
            );
          }

          const currentWorkers = building.workers || 0;
          const totalAssigned = (
            buildingsData.getAll() as SkyForgeBuilding[]
          ).reduce((sum, b) => sum + (b.workers || 0), 0);
          let newWorkers;

          if (action === "assign") {
            if (totalAssigned + amount > srworkers) {
              return output.reply(
                `👤 **${name}** (SkyForge)\n\n❌ Not enough **workers**! Available: ${
                  srworkers - totalAssigned
                }\n` +
                  `\n📝 **Next Step**: ${suggestNextAction(
                    buildingsData,
                    { aether, crystal, stone, money: userMoney },
                    srworkers,
                    prefix
                  )}\n` +
                  `🔔 **Reminder**: Buy more **workers** with ${prefix}skyrise shop.`
              );
            }
            newWorkers = currentWorkers + amount;
          } else if (action === "remove") {
            newWorkers = Math.max(0, currentWorkers - amount);
          } else {
            return output.reply(
              `👤 **${name}** (SkyForge)\n\n❌ Invalid action! Use **assign** or **remove**.\n` +
                `\n📝 **Next Step**: ${suggestNextAction(
                  buildingsData,
                  { aether, crystal, stone, money: userMoney },
                  srworkers,
                  prefix
                )}\n` +
                `🔔 **Reminder**: Check ${prefix}skyrise status for **worker** assignments.`
            );
          }

          building.workers = newWorkers;
          buildingsData.deleteOne(building.key);
          buildingsData.addOne(updateBuildingData(building));

          await money.setItem(input.senderID, {
            srbuildings: Array.from(buildingsData),
          });

          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***Worker Management***\n\n`;
          result += `✅ Updated **workers** for ${building.icon} **${building.name}**!\n`;
          result += `👷 **Workers**: ${newWorkers} (${
            action === "assign" ? "+" : "-"
          }${amount})\n`;
          result += `📈 **${building.name}** now produces ${
            action === "assign" ? "more" : "less"
          } **${building.production.resource}**.\n`;
          result += `\n📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Protect your empire with ${prefix}skyrise defend.`;
          return output.reply(result);
        },
      },
      {
        key: "tutorial",
        description: "Start or continue the **tutorial**",
        aliases: ["-t"],
        async handler() {
          const steps = [
            {
              text: `Welcome to **SkyForge Empire**! Let's build your first **Aether Collector**.\nUse ${prefix}skyrise shop and buy an **Aether Collector**.`,
              condition: () =>
                !rawBuildingsData.some((b: SkyForgeBuilding) =>
                  b.key.includes("aetherCollector")
                ),
            },
            {
              text: `Great! Now ***collect resources*** from your **Aether Collector**.\nUse ${prefix}skyrise collect.`,
              condition: () =>
                rawBuildingsData.some((b: SkyForgeBuilding) =>
                  b.key.includes("aetherCollector")
                ),
            },
            {
              text: `Nice work! ***Upgrade*** your **Aether Collector** to boost production.\nUse ${prefix}skyrise upgrade Aether Collector.`,
              condition: () => aether >= 50 && crystal >= 50 && stone >= 50,
            },
            {
              text: `You're ready to ***defend*** your empire! Fight off **Sky Pirates**.\nUse ${prefix}skyrise defend.`,
              condition: () =>
                rawBuildingsData.some((b: SkyForgeBuilding) => b.level >= 2),
            },
            {
              text: `**Tutorial complete**! Explore more with ${prefix}skyrise guide.`,
              condition: () => true,
            },
          ];

          const currentStep = steps[tutorialStep] || steps[steps.length - 1];
          const nextStep =
            tutorialStep + 1 < steps.length && !currentStep.condition()
              ? tutorialStep
              : tutorialStep + 1;

          await money.setItem(input.senderID, { tutorialStep: nextStep });

          return output.reply(
            `👤 **${name}** (SkyForge)\n\n📜 **Tutorial Step ${
              tutorialStep + 1
            }**\n${currentStep.text}`
          );
        },
      },
      {
        key: "guide",
        description: "View all **commands** and **guides**",
        aliases: ["-h"],
        async handler() {
          const buildingsData = new Inventory(rawBuildingsData);
          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***SkyForge Empire Guide***\n\n`;
          result += `Build a floating island empire by collecting **Aether**, **Crystal**, and **Stone**.\n\n`;
          result += `**Commands**:\n`;
          result += `- **status** (-s): Check your **resources** and **buildings**.\n`;
          result += `- **build** (-b) <building_key>: Construct a new **building** from the **Sky Market**.\n`;
          result += `- **collect** (-c): Gather **resources** from your **buildings**.\n`;
          result += `- **upgrade** (-u) <building_name>: Improve a **building**'s **production**.\n`;
          result += `- **defend** (-d): Protect against **Sky Pirate** raids.\n`;
          result += `- **shop** (-sh) [buy <item_key>]: Buy **buildings** and **workers** from the **Sky Market**.\n`;
          result += `- **srworker** (-w) <building_name> <assign|remove> <amount>: Manage **workers**.\n`;
          result += `- **tutorial** (-t): Start or continue the **tutorial**.\n`;
          result += `- **lobby** (-l): View **achievements** and **commands**.\n`;
          result += `\n📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            { aether, crystal, stone, money: userMoney },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Use ${prefix}skyrise <command> to play!`;
          return output.reply(result);
        },
      },
      {
        key: "lobby",
        description: "View all **achievements** and **commands**",
        aliases: ["-l"],
        async handler(_, { itemList }) {
          const buildingsData = new Inventory(rawBuildingsData);
          let newAether = aether;
          let newCrystal = crystal;
          let newStone = stone;
          let achievementMessages: string[] = [];

          for (const [achName, { condition, reward }] of Object.entries(
            achievements
          )) {
            if (
              !rawBuildingsData.some((b: SkyForgeBuilding) =>
                b.achievements?.includes(achName)
              ) &&
              condition(buildingsData.getAll() as SkyForgeBuilding[])
            ) {
              newAether += reward.aether || 0;
              newCrystal += reward.crystal || 0;
              newStone += reward.stone || 0;
              achievementMessages.push(
                `🏆 **Achievement Unlocked**: ${achName}!\n` +
                  `🎁 Rewards: ${reward.aether || 0} **Aether**, ${
                    reward.crystal || 0
                  } **Crystal**, ${reward.stone || 0} **Stone**`
              );
              (buildingsData.getAll() as SkyForgeBuilding[]).forEach((b) => {
                b.achievements = b.achievements || [];
                b.achievements.push(achName);
                buildingsData.deleteOne(b.key);
                buildingsData.addOne(updateBuildingData(b));
              });
            }
          }

          if (
            newAether !== aether ||
            newCrystal !== crystal ||
            newStone !== stone
          ) {
            await money.setItem(input.senderID, {
              aether: newAether,
              crystal: newCrystal,
              stone: newStone,
              srbuildings: Array.from(buildingsData),
            });
          }

          let result = `👤 **${name}** (SkyForge)\n\n${UNIRedux.arrow} ***SkyForge Lobby***\n\n`;
          result += `📜 Welcome to your empire's **lobby**! Check your **achievements** and plan your next move.\n\n${UNIRedux.arrow} ***Commands***\n\n${itemList}\n\n`;
          if (achievementMessages.length > 0) {
            result += `${
              UNIRedux.arrow
            } ***Achievements***\n\n${achievementMessages.join("\n")}\n\n`;
          } else {
            result += `🏆 **No new achievements**! Keep building to unlock rewards.\n\n`;
          }
          result += `📝 **Next Step**: ${suggestNextAction(
            buildingsData,
            {
              aether: newAether,
              crystal: newCrystal,
              stone: newStone,
              money: userMoney,
            },
            srworkers,
            prefix
          )}\n`;
          result += `🔔 **Reminder**: Use ${prefix}skyrise guide to see all commands!`;
          return output.reply(result);
        },
      },
    ]
  );

  return home.runInContext(ctx);
}

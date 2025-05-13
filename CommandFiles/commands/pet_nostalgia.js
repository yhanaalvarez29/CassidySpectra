// @ts-check
import { Inventory } from "@cassidy/ut-shop";
import { CassEXP } from "../modules/cassEXP.js";
import { clamp, UNIRedux } from "../modules/unisym.js";
import { SpectralCMDHome } from "@cassidy/spectral-home";

/**
 * @type {CassidySpectra.CommandMeta}
 */
export const meta = {
  name: "petnostalgia",
  description: "Manage your pets! (Reworked but same as old!)",
  otherNames: ["p", "pet", "petn"],
  version: "1.6.2",
  usage: "{prefix}{name}",
  category: "Idle Investment Games",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 1,
  shopPrice: 200,
  requirement: "3.0.0",
  icon: "🐕",
  cmdType: "cplx_g",
};
export const PET_LIMIT = 7;

/**
 *
 * @param {CommandContext & { repObj: { petsData: Inventory; newMoney: number; price: number; author: string; petToSell: UserData["petsData"][number]; code: string; petSells: number } }} param0
 * @returns
 */
async function confirmSell({ input, output, repObj, money }) {
  const { petsData, newMoney, price, author, petToSell, code, petSells } =
    repObj;

  if (author !== input.senderID) {
    return;
  }
  if (input.body.trim() !== code.trim()) {
    return output.reply(`❌ Wrong code.`);
  }

  petsData.deleteOne(petToSell.key);
  await money.setItem(input.senderID, {
    money: newMoney,
    // @ts-ignore
    petsData: Array.from(petsData),
    petSells,
  });

  return output.reply(
    `😥${petToSell.icon} You successfully sold **${petToSell.name}** for $${price}💵`
  );
}

/**
 *
 * @param {CommandContext & { repObj: { author: string; inventory: Inventory; petVentory: Inventory; type: string; detectID: string; item: import("@cass-modules/cassidyUser").InventoryItem } }} param0
 * @returns
 */
async function uncageReply({ input, output, Inventory, money, repObj }) {
  const { author, inventory, petVentory, type, detectID } = repObj;
  const { name = "Unregistered", petsData: rawPetsData = [] } =
    await money.getItem(input.senderID);
  const petsData = new Inventory(rawPetsData);

  if (input.senderID !== author) {
    return;
  }
  if (petsData.getAll().length >= PET_LIMIT) {
    return output.reply(`🐾 You can only have a maximum of ${PET_LIMIT} pets!`);
  }

  switch (type) {
    case "uncaging":
      await handleUncage();
      break;
    case "naming":
      await handleRename();
      break;
  }

  async function handleUncage() {
    const index = Number(input.body) - 1;
    const item = petVentory.getAll()[index];
    if (!item) {
      return output.reply(
        `🐾 Please go back and reply a correct number, thank you!`
      );
    }
    const i = await output.reply(
      `📄${item.icon} What would you like to name your **pet**? (no spaces pls)`
    );
    input.delReply(detectID);
    input.setReply(i.messageID, {
      author: input.senderID,
      // @ts-ignore
      callback: uncageReply,
      type: "naming",
      item,
      key: "pet",
      inventory,
      petVentory,
      detectID: i.messageID,
    });
  }

  async function handleRename() {
    const { item } = repObj;
    const s = input.body.trim().split(" ")[0];
    const newName = s.length > 20 ? s.slice(0, 20) : s;
    const existingPet = petsData.getAll().find((pet) => pet.name === newName);
    if (existingPet) {
      return output.reply(
        `🐾 Sorry, but that name was already **taken** for your existing ${existingPet.petType} ${existingPet.icon}, please go back and send a different one.`
      );
    }

    petsData.addOne({
      ...item,
      name: newName,
      petType: item.key,
      key: "pet:" + item.key + "_" + Date.now(),
      level: 1,
      lastFeed: Date.now(),
      lastExp: 0,
    });
    inventory.deleteOne(item.key);
    await money.set(input.senderID, {
      inventory: Array.from(inventory),
      // @ts-ignore
      petsData: Array.from(petsData),
    });

    input.delReply(detectID);
    return output.reply(
      `🐾 Thank you **${name}** for successfully adopting ${item.icon} a new ${item.key} **${newName}**!\n🐾 Goodluck with your new pet!`
    );
  }
}

/**
 *
 * @param {CommandContext & { repObj: { author: string; petVentory: Inventory; type: string; detectID: string; item: import("@cass-modules/cassidyUser").InventoryItem } }} param0
 * @returns
 */
async function renameReply({ input, output, Inventory, money, repObj }) {
  const { author, petVentory, type, detectID } = repObj;
  const {
    name = "Unregistered",
    petsData: rawPetsData = [],
    inventory: rawInventory = [],
  } = await money.get(input.senderID);
  const inventory = new Inventory(rawInventory);
  const petsData = new Inventory(rawPetsData);

  if (input.senderID !== author) {
    return;
  }

  switch (type) {
    case "choosing":
      await handleChoose();
      break;
    case "naming":
      await handleRename();
      break;
  }

  async function handleChoose() {
    const index = Number(input.body) - 1;
    const item = petsData.getAll()[index];
    if (!item) {
      return output.reply(
        `🐾 Please go back and reply a correct number, thank you!`
      );
    }
    const i = await output.reply(
      `📄${item.icon} What would you like to rename your **pet**? (no spaces pls)`
    );
    input.delReply(detectID);
    input.setReply(i.messageID, {
      author: input.senderID,
      // @ts-ignore
      callback: renameReply,
      type: "naming",
      item,
      key: "pet",
      inventory,
      petVentory,
      detectID: i.messageID,
    });
  }

  async function handleRename() {
    const { item } = repObj;
    const s = input.body.trim().split(" ")[0];
    const newName = s.length > 20 ? s.slice(0, 20) : s;
    const existingPet = petsData.getAll().find((pet) => pet.name === newName);
    if (existingPet) {
      return output.reply(
        `🐾 Sorry, but that name was already **taken** for your existing ${existingPet.petType} ${existingPet.icon}, please go back and send a different one.`
      );
    }
    if (!inventory.has("dogTag")) {
      return output.reply(
        `A 🏷️ **Dog Tag** is required to perform this action.`
      );
    }

    const pet = petsData.getOne(item.key);
    pet.name = newName;
    inventory.deleteOne("dogTag");
    await money.setItem(input.senderID, {
      inventory: Array.from(inventory),
      // @ts-ignore
      petsData: Array.from(petsData),
    });

    input.delReply(detectID);
    return output.reply(
      `🐾 Thank you **${name}** for successfully renaming ${item.icon} your pet ${item.petType} to **${newName}**!\n🐾 Goodluck with your new pet's name!`
    );
  }
}

/**
 * @type {CassidySpectra.CommandStyle}
 */
export const style = {
  title: {
    content: "Pet 🐕",
    text_font: "bold",
    line_bottom: "default",
  },
  contentFont: "fancy",
  footer: {
    content: "",
  },
};
const petFoodsII = [
  {
    icon: "🌈",
    name: "Rainbow Delight",
    flavorText: "Colorful treats filled with magic for unicorns.",
    key: "rainbowDelight",
    price: 400,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Rainbow Delight",
        key: "rainbowDelight",
        flavorText: "Colorful treats filled with magic.",
        icon: "🌈",
        type: "unicorn_food",
        sellPrice: 200,
        saturation: 40 * 60 * 1000,
      });
    },
  },
  {
    icon: "🌟",
    name: "Starlight Treats",
    key: "starlightTreats",
    flavorText: "Magical treats that shimmer like stars, a good unicorn treat!",
    price: 1200,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Starlight Treats",
        key: "starlightTreats",
        flavorText: "Magical treats that shimmer like stars.",
        icon: "🌟",
        type: "unicorn_food",
        sellPrice: 600,
        saturation: 120 * 60 * 1000,
      });
    },
  },

  {
    icon: "❄️",
    name: "Snowflake Surprise",
    key: "snowflakeSurprise",
    flavorText:
      "Icy treats from the highest peaks, made specifically for a Yeti.",
    price: 150,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Snowflake Surprise",
        key: "snowflakeSurprise",
        flavorText: "Icy treats from the highest peaks.",
        icon: "❄️",
        type: "yeti_food",
        sellPrice: 75,
        saturation: 15 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐋",
    name: "Ocean Bounty",
    key: "oceanBounty",
    flavorText: "Rich seafood delicacies for leviathan.",
    price: 300,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Ocean Bounty",
        key: "oceanBounty",
        flavorText: "Rich seafood delicacies.",
        icon: "🐋",
        type: "leviathan_food",
        sellPrice: 150,
        saturation: 30 * 60 * 1000,
      });
    },
  },
  {
    icon: "🔥🔥🔥",
    name: "Infernal Feast",
    key: "infernalFeast",
    flavorText:
      "Fiery meals fit for the underworld guardian, this is basically Phoenix Ember but there's 3 fires instead of 1. (for Cerberus)",
    price: 700,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Infernal Feast",
        key: "infernalFeast",
        flavorText: "Fiery meals fit for the underworld guardian.",
        icon: "🔥🔥🔥",
        type: "cerberus_food",
        sellPrice: 350,
        saturation: 70 * 60 * 1000,
      });
    },
  },

  {
    icon: "🦁🗿",
    name: "Mystical Medley",
    flavorText: "Ancient treats for a Sphinx, whatever that pet was.",
    key: "mysticalMedley",
    price: 800,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Mystical Medley",
        key: "mysticalMedley",
        flavorText: "Ancient treats with a touch of mystery...?",
        icon: "🦁🗿",
        type: "sphinx_food",
        sellPrice: 400,
        saturation: 80 * 60 * 1000,
      });
    },
  },
  {
    icon: "🦁🦅",
    name: "Celestial Feast",
    key: "celestialFeast",
    flavorText:
      "Heavenly meals for a majestic creature. (for griffin pet but not peter)",
    price: 900,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Celestial Feast",
        key: "celestialFeast",
        flavorText: "Heavenly meals for a majestic creature.",
        icon: "🦁🦅",
        type: "griffin_food",
        sellPrice: 450,
        saturation: 90 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐎✨",
    name: "Starlight Snacks",
    key: "starlightSnacks",
    flavorText: "Magical snacks that sparkle with starlight, FOR PEGASUS!!!!",
    price: 1000,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Starlight Snacks",
        key: "starlightSnacks",
        flavorText: "Magical snacks that sparkle with starlight.",
        icon: "🐎✨",
        type: "pegasus_food",
        sellPrice: 500,
        saturation: 100 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐙",
    name: "Deep Sea Delicacy",
    key: "deepSealDelicacy",
    flavorText:
      "Exquisite cuisine from the depths of the ocean, a perfect and only food for Krakens",
    price: 1100,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Deep Sea Delicacy",
        key: "deepSeaDelicacy",
        flavorText: "Exquisite cuisine from the depths of the ocean.",
        icon: "🐙",
        type: "kraken_food",
        sellPrice: 550,
        saturation: 110 * 60 * 1000,
      });
    },
  },
];
const petFoods = [
  {
    icon: "🍖",
    name: "Dog Treats",
    flavorText: "Delicious treats for your loyal companion.",
    key: "dogTreats",
    price: 10,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Dog Treats ✦",
        key: "dogTreats",
        flavorText: "Delicious treats for your loyal companion.",
        icon: "🍖",
        type: "dog_food",
        sellPrice: 5,
        saturation: 1 * 60 * 1000,
      });
    },
  },
  {
    icon: "🍗",
    key: "chickenChewies",
    name: "Chicken Chewies",
    flavorText: "Irresistible chicken-flavored snacks.",
    price: 70,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Chicken Chewies+",
        key: "chickenChewies",
        flavorText: "Irresistible chicken-flavored snacks.",
        icon: "🍗",
        type: "dog_food",
        sellPrice: 35,
        saturation: 7 * 60 * 1000,
      });
    },
  },
  {
    icon: "🦴",
    name: "Beefy Bones",
    key: "beefyBones",
    flavorText: "Hearty bones for a happy hound.",
    price: 200,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Beefy Bones ✦",
        key: "beefyBones",
        flavorText: "Hearty bones for a happy hound.",
        icon: "🦴",
        type: "dog_food",
        sellPrice: 100,
        saturation: 20 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐟",
    name: "Fishy Feline Feast",
    flavorText: "Tasty fish treats for your curious cat.",
    key: "fishyFelineFeast",
    price: 15,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Fishy Feline Feast ✦",
        key: "fishyFelineFeast",
        flavorText: "Tasty fish treats for your curious cat.",
        icon: "🐟",
        type: "cat_food",
        sellPrice: 7,
        saturation: 1.5 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐦",
    name: "Meow Munchies",
    flavorText: "Savory snacks to satisfy your cat's cravings.",
    key: "meowMunchies",
    price: 75,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Meow Munchies ✦",
        key: "meowMunchies",
        flavorText: "Savory snacks to satisfy your cat's cravings.",
        icon: "🐦",
        type: "cat_food",
        sellPrice: 35,
        saturation: 7.5 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐭",
    name: "Whisker Delights",
    flavorText: "Crunchy catnip-infused treats.",
    key: "whiskerDelights",
    price: 200,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Whisker Delights ✦",
        key: "whiskerDelights",
        flavorText: "Crunchy catnip-infused treats.",
        icon: "🐭",
        type: "cat_food",
        sellPrice: 100,
        saturation: 20 * 60 * 1000,
      });
    },
  },
  {
    icon: "🌿",
    name: "Herbivore Delight",
    flavorText: "Nutritious greens for your gentle deer.",
    price: 100,
    key: "herbivoreDelight",
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Herbivore Delight ✦",
        key: "herbivoreDelight",
        flavorText: "Nutritious greens for your gentle deer.",
        icon: "🌿",
        type: "deer_food",
        sellPrice: 4,
        saturation: 10 * 60 * 1000,
      });
    },
  },
  {
    icon: "🍃",
    name: "Gentle Grazers",
    key: "gentleGrazers",
    flavorText: "Acorn treats for your deer's delight.",
    price: 300,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Gentle Grazers ✦",
        key: "gentleGrazers",
        flavorText: "Acorn treats for your deer's delight.",
        icon: "🍃",
        type: "deer_food",
        sellPrice: 150,
        saturation: 30 * 60 * 1000,
      });
    },
  },
  {
    icon: "🌱",
    name: "Graceful Greens",
    key: "gracefulGreens",
    flavorText: "Herbal munchies for your deer's grace.",
    price: 600,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Graceful Greens ✦",
        key: "gracefulGreens",
        flavorText: "Herbal munchies for your deer's grace.",
        icon: "🌱",
        type: "deer_food",
        sellPrice: 300,
        saturation: 60 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐅",
    name: "Tiger Tenders",
    key: "tigerTenders",
    flavorText: "Premium meaty treats for your majestic tiger.",
    price: 130,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Tiger Tenders ✦",
        key: "tigerTenders",
        flavorText: "Premium meaty treats for your majestic tiger.",
        icon: "🐅",
        type: "tiger_food",
        sellPrice: 50,
        saturation: 13 * 60 * 1000,
      });
    },
  },
  {
    icon: "🍖",
    name: "Power Pounce",
    key: "powerPounce",
    flavorText: "Jerky strips for your powerful tiger.",
    price: 600,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Power Pounce ✦",
        key: "powerPounce",
        flavorText: "Jerky strips for your powerful tiger.",
        icon: "🍖",
        type: "tiger_food",
        sellPrice: 250,
        saturation: 60 * 60 * 1000,
      });
    },
  },
  {
    icon: "🦌",
    name: "Majestic Meals",
    key: "majesticMeals",
    flavorText: "A medley of wild game for your tiger.",
    price: 150,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Majestic Meals+",
        key: "majesticMeals",
        flavorText: "A medley of wild game for your tiger.",
        icon: "🦌",
        type: "tiger_food",
        sellPrice: 50,
        saturation: 15 * 60 * 1000,
      });
    },
  },

  /*{
    icon: "🦌",
    name: "Majestic Meals 𝔼𝕏",
    flavorText: "A medley of wild game for your tiger.",
    price: 1500,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Majestic Meals 𝔼𝕏 ✦",
        key: "majesticMealsEX",
        flavorText: "A medley of wild game for your tiger.",
        icon: "🦌",
        type: "tiger_food",
        sellPrice: 600,
        saturation: 120 * 60 * 1000,
      });
    },
  },*/
  {
    icon: "🐭",
    name: "Slither & Savor",
    flavorText: "Exotic snacks for your mysterious snake.",
    price: 25,
    key: "slitherSavor",
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Slither & Savor ✦",
        key: "slitherSavor",
        flavorText: "Exotic snacks for your mysterious snake.",
        icon: "🐭",
        type: "snake_food",
        sellPrice: 10,
        saturation: 2.5 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐁",
    name: "Serpent Supplies",
    flavorText: "Nutritious rations for your intriguing snake.",
    key: "serpentSupplies",
    price: 140,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Serpent Supplies ✦",
        key: "serpentSupplies",
        flavorText: "Nutritious rations for your intriguing snake.",
        icon: "🐁",
        type: "snake_food",
        sellPrice: 70,
        saturation: 14 * 60 * 1000,
      });
    },
  },
  {
    icon: "🐜",
    name: "Creepy Crawly Cuisine",
    key: "creepyCrawlyCuisine",
    flavorText: "A mix of insects for your snake's delight.",
    price: 500,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Creepy Crawly Cuisine ✦",
        key: "creepyCrawlyCuisine",
        flavorText: "A mix of insects for your snake's delight.",
        icon: "🐜",
        type: "snake_food",
        sellPrice: 300,
        saturation: 50 * 60 * 1000,
      });
    },
  },
  {
    icon: "🔥",
    key: "dragonDelights",
    name: "Dragon Delights",
    flavorText: "Fire-roasted meats fit for your legendary dragon.",
    price: 180,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Dragon Delights+",
        key: "dragonDelights",
        flavorText: "Fire-roasted meats fit for your legendary dragon.",
        icon: "🔥",
        type: "dragon_food",
        sellPrice: 90,
        saturation: 18 * 60 * 1000,
      });
    },
  },
  {
    icon: "💎",
    name: "Gemstone Gourmet",
    key: "gemstoneGourmet",
    flavorText: "Precious gemstone treats for your powerful dragon.",
    price: 240,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Gemstone Gourmet+",
        key: "gemstoneGourmet",
        flavorText: "Precious gemstone treats for your powerful dragon.",
        icon: "💎",
        type: "dragon_food",
        sellPrice: 110,
        saturation: 24 * 60 * 1000,
      });
    },
  },
  {
    icon: "☄️",
    name: "Cosmic Crunch",
    key: "cosmicCrunch",
    flavorText:
      "Tasty cosmic treats for your cosmic dragon.. or normal dragon.",
    price: 500,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Cosmic Crunch+",
        icon: "☄️",
        key: "cosmicCrunch",
        sellPrice: 124,
        type: "dragon_food",
        saturation: 50 * 60 * 1000,
        flavorText:
          "Tasty cosmic treats for your cosmic dragon.. or normal dragon.",
      });
    },
  },
  /*{
    icon: "☄️",
    name: "Cosmic Crunch 𝔼𝕏",
    flavorText:
      "Tasty cosmic treats for your cosmic dragon.. or normal dragon.",
    price: 3000,
    onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Cosmic Crunch 𝔼𝕏 ✦",
        icon: "☄️",
        key: "cosmicCrunchEX",
        sellPrice: 12400,
        type: "dragon_food",
        saturation: 250 * 60 * 1000,
        flavorText:
          "Tasty cosmic treats for your cosmic dragon.. or normal dragon.",
      });
    },
  },*/

  /*{
    icon: "🔥",
    name: "Phoenix Ember 𝔼𝕏",
    flavorText:
      "A radiant ember from the heart of a Phoenix's fire. Nourishes and invigorates your majestic pet, fueling its eternal flame and vibrant plumage.",
    price: 5000,
    async onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Phoenix Ember 𝔼𝕏 ✦",
        key: "phoenixEmberEX",
        flavorText:
          "A mystical ember known for its transformative properties. When consumed, it imbues the Phoenix with renewed vitality, enhancing its fiery aura and majestic presence.",
        icon: "🔥",
        type: "phoenix_food",
        saturation: 400 * 60 * 1000,
        sellPrice: 2500,
      });
    },
  },*/

  {
    icon: "🔥",
    name: "Phoenix Ember",
    key: "phoenixEmber",
    flavorText:
      "A radiant ember from the heart of a Phoenix's fire. Nourishes and invigorates your majestic pet, fueling its eternal flame and vibrant plumage.",
    price: 700,
    async onPurchase({ moneySet }) {
      moneySet.inventory.push({
        name: "Phoenix Ember+",
        key: "phoenixEmber",
        flavorText:
          "A mystical ember known for its transformative properties. When consumed, it imbues the Phoenix with renewed vitality, enhancing its fiery aura and majestic presence.",
        icon: "🔥",
        type: "phoenix_food",
        saturation: 70 * 60 * 1000,
        sellPrice: 2500,
      });
    },
  },
];
export function calculateWorth(pet) {
  pet = autoUpdatePetData(pet);
  const { sellPrice, level, lastExp = 0 } = pet;
  return Math.floor(sellPrice * 2 + lastExp * 9 * 2 ** (level - 1));
}

function isPetHungry(pet) {
  const { lastFeed = Date.now(), lastSaturation = 0 } = pet;

  const currentTime = Date.now();

  const timeSinceLastFeed = currentTime - lastFeed;

  return timeSinceLastFeed > lastSaturation;
}
function petHungryAfter(pet) {
  const { lastFeed = Date.now(), lastSaturation = 0 } = pet;

  const currentTime = Date.now();

  const timeSinceLastFeed = currentTime - lastFeed;
  return lastSaturation - timeSinceLastFeed;
}

/**
 *
 * @param {any} petData
 * @returns {UserData["petsData"][number]}
 */
export function autoUpdatePetData(petData) {
  const { lastExp = 0 } = petData;

  petData.level = lastExp < 10 ? 1 : Math.floor(Math.log2(lastExp / 10)) + 1;
  // @ts-ignore
  return petData;
}
function calculateNextExp(petData) {
  const { lastExp = 0 } = petData;

  const currentLevel =
    lastExp < 10 ? 1 : Math.floor(Math.log2(lastExp / 10)) + 1;
  const nextLevel = currentLevel + 1;

  const nextExp = nextLevel < 2 ? 10 : 10 * Math.pow(2, nextLevel - 1);

  return nextExp;
}
const petShop = {
  key: "petShop",
  /*itemData: [
    {
      icon: "🐕",
      name: "Dog (in Cage)",
      flavorText: "A loyal and friendly companion.",
      price: 1000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Dog",
          key: "dog",
          flavorText: "A loyal pet from the Pet Shop. Always there for you.",
          icon: "🐕",
          type: "pet",
          sellPrice: 250,
        });
      },
    },
    {
      icon: "🦌",
      name: "Deer (in Cage)",
      flavorText: "A gentle and graceful creature.",
      price: 1000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Deer",
          key: "deer",
          flavorText: "A gentle pet from the Pet Shop. Moves with grace.",
          icon: "🦌",
          type: "pet",
          sellPrice: 350,
        });
      },
    },
    {
      icon: "🐅",
      name: "Tiger (in Cage)",
      flavorText: "A majestic and powerful animal.",
      price: 2000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Tiger",
          key: "tiger",
          flavorText: "A majestic pet from the Pet Shop. Commands respect.",
          icon: "🐅",
          type: "pet",
          sellPrice: 750,
        });
      },
    },
    {
      icon: "🐍",
      name: "Snake (in Cage)",
      flavorText: "A mysterious and fascinating reptile.",
      price: 2500,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Snake",
          key: "snake",
          flavorText:
            "A mysterious pet from the Pet Shop. Intriguing to watch.",
          icon: "🐍",
          type: "pet",
          sellPrice: 500,
        });
      },
    },
    {
      icon: "🐉",
      name: "Dragon (in Cage)",
      flavorText: "A legendary and awe-inspiring beast.",
      price: 9000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Dragon",
          key: "dragon",
          flavorText: "A legendary pet from the Pet Shop. A symbol of power.",
          icon: "🐉",
          type: "pet",
          sellPrice: 2500,
        });
      },
    },
  ],*/
  sellTexts: [
    "🛑 Sorry, I can't buy that from you.",
    "🛑 We're not purchasing items at the moment.",
  ],
  tradeRefuses: [
    "🛑 Trade? I'm sorry, I don't think that's a thing here, you could by my pets instead.",
  ],
  talkTexts: [
    {
      name: "Introduce Yourself",
      responses: [
        "🐾 Hi, I'm Jade, and I'm deeply passionate about animals and their welfare.",
        "🐾 Beyond running this pet shop, my favorite hobby is photography, capturing moments of animals and nature.",
        "🐾 Starting this shop was driven by my love for animals and the need to create a safe haven for them in our community.",
        "🐾 I believe in providing not just products, but also knowledge and support to pet owners to ensure their pets thrive.",
        "🐾 Each day, I strive to make sure every pet that comes through our doors feels loved and cared for.",
        "🐾 Being able to connect with fellow animal lovers and help them find the perfect companion brings me immense joy.",
        "🐾 My goal is to create a welcoming environment where both pets and their owners feel like part of a larger family.",
        "🐾 I'm committed to promoting responsible pet ownership through education and community outreach.",
        "🐾 Ensuring every pet leaves here healthy, happy, and well-cared for is my top priority.",
        "🐾 Ultimately, I'm here to foster a community where pets receive the love, care, and respect they deserve, and where every pet owner feels supported and informed.\n🐾 What about you? What brings you to our pet shop today?",
      ],
      icon: "🛡️",
    },
    {
      name: "Pet Care Tips",
      responses: [
        "🐾 Regular vet visits are crucial for your pet's health.\n🐾 Make sure to provide a balanced diet for your pets.",
        "🐾 Regular exercise keeps pets happy and healthy.",
      ],
      icon: "🩺",
    },
    {
      name: "Training Advice",
      responses: [
        "🐾 Consistency is key in pet training.\n🐾 Positive reinforcement works best for training.",
        "🐾 Start training as early as possible for best results.",
      ],
      icon: "🎓",
    },
    {
      name: "Fun Facts",
      responses: [
        "🐾 Did you know? Dogs have been our companions for over 15,000 years.\n🐾 Cats can rotate their ears 180 degrees.\n🐾 Deer can run up to 30 miles per hour.",
      ],
      icon: "🧠",
    },
    {
      name: "Common Issues",
      responses: [
        "🐾 Some pets might face anxiety. Try to provide a calm environment.\n🐾 Make sure your pet gets enough social interaction.",
        "🐾 Regular grooming can help avoid many health issues.",
      ],
      icon: "❓",
    },
    {
      name: "Pet Adoption Stories",
      responses: [
        "🐾 One of our adopted dogs saved its family from a fire.\n🐾 A cat from our shop won a local pet talent show.",
        "🐾 We had a dragon that became the star of a local festival.",
      ],
      icon: "📖",
    },
    {
      name: "Healthy Diets",
      responses: [
        "🐾 Fresh water is as important as a good diet for your pets.\n🐾 Avoid giving your pets human food. Some can be toxic.",
        "🐾 Consult with a vet to create the best diet plan for your pet.",
      ],
      icon: "🍎",
    },
    {
      name: "Pet Safety",
      responses: [
        "🐾 Keep your pets safe from harmful chemicals.",
        "🐾 Ensure your home is pet-proofed to avoid accidents.",
        "🐾 Use proper leashes and harnesses for outdoor safety.",
      ],
      icon: "🛡️",
    },
    {
      name: "Exercise Routines",
      responses: [
        "🐾 Regular walks are great for dogs' physical and mental health.\n🐾 Interactive toys can keep cats active and entertained.",
        "🐾 Even reptiles like snakes need some form of enrichment.",
      ],
      icon: "🏃",
    },
  ],
  notScaredGeno: true,
  buyTexts: [
    "🐾 Which pet would you like to adopt?",
    "🐾 Take your time, which pet catches your eye?",
    "🐾 Let me know if you need any help choosing.",
    "🐾 All pets are well cared for, take your pick!",
    "🐾 You have great taste, which pet will it be?",
  ],
  welcomeTexts: [
    "🐾 Welcome to the pet shop!",
    "🐾 Hello! Feel free to browse our pets.",
    "🐾 Hi there! How can I assist you today?",
    "🐾 Welcome! We have the best pets in town.",
    "🐾 Greetings! What kind of pet are you looking for today?",
  ],
  goBackTexts: [
    "🐾 It's okay, take your time.",
    "🐾 No worries, let me know if you need anything.",
    "🐾 It's alright, I'm here to help.",
    "🐾 Don't stress, feel free to browse.",
    "🐾 All good, what else can I do for you?",
  ],
  askTalkTexts: [
    "🐾 What do you want to talk about?",
    "🐾 I'm all ears, what do you want to discuss?",
    "🐾 Let's chat! What's on your mind?",
    "🐾 Feel free to ask me anything.",
    "🐾 What would you like to know?",
  ],
  thankTexts: [
    "🐾 Thanks for adopting!",
    "🐾 Thank you for your purchase!",
    "🐾 We appreciate your business!",
    "🐾 Thanks! Come again soon!",
    "🐾 Enjoy your new pet!",
  ],
};

/**
 *
 * @param {CommandContext & { repObj: { petsData: Inventory; newMoney: number; price: number; author: string; petToSell: import("@cass-modules/cassidyUser").InventoryItem; code: string; petSells: number; } }} param0
 * @returns
 */
async function confirmSell({ input, output, repObj, money }) {
  const { petsData, newMoney, price, author, petToSell, code, petSells } =
    repObj;
  if (author !== input.senderID) {
    return;
  }
  if (input.body.trim() !== code.trim()) {
    return output.reply(`❌ Wrong code.`);
  }
  petsData.deleteOne(petToSell.key);

  await money.setItem(input.senderID, {
    money: newMoney,
    // @ts-ignore
    petsData: Array.from(petsData),
    petSells,
  });
  return output.reply(
    `😥${petToSell.icon} You successfully sold **${petToSell.name}** for $${price}💵`
  );
}

/**
 *
 * @param {CommandContext} ctx
 * @returns
 */
export async function entry(ctx) {
  const {
    input,
    output,
    money,
    Inventory,
    GearsManage,
    PetPlayer,
    UTShop,
    generateGift,
    prefix,
    args,
  } = ctx;
  const {
    name = "Chara",
    petsData: rawPetsData = [],
    inventory: rawInventory = [],
    gearsData: rawGearsData = [],
    carsData: rawCarsData = [],
    money: playerMoney = 0,
    petSells = 0,
    cassEXP: cxp,
  } = await money.getCache(input.senderID);

  const home = new SpectralCMDHome(
    {
      isHypen: true,
    },
    [
      {
        key: "gear",
        description: "View pet gear and stats",
        aliases: ["-g"],
        args: ["[pet_name]"],
        async handler(_) {
          const petsData = new Inventory(rawPetsData);
          const gearsData = new GearsManage(rawGearsData);
          petsData
            .getAll()
            .sort(
              (a, b) => (Number(b.lastExp) || 0) - (Number(a.lastExp) || 0)
            );
          const spellMap = PetPlayer.petSpellMap;

          if (args[0]) {
            const pet = petsData
              .getAll()
              .find(
                (pet) =>
                  String(pet.name).toLowerCase().trim() ===
                  String(args[0]).toLowerCase().trim()
              );
            if (!pet) {
              return output.reply(`🐾 You don't have a pet named "${args[0]}"`);
            }
            const gearData = gearsData.getGearData(pet.key);
            const targetMap = spellMap[pet.petType] ?? [];
            const petPlayer = new PetPlayer(pet, gearData.toJSON());
            const elementals = petPlayer.getElementals();

            let result =
              `${petPlayer.getPlayerUI()}\n\n` +
              `${UNIRedux.charm} ***Total Stats***\n\n` +
              `**ATK**: **${petPlayer.ATK}** (+${petPlayer.gearATK})\n` +
              `**DEF**: **${petPlayer.DF}** (+${petPlayer.gearDF})\n` +
              `**Magic**: **${petPlayer.MAGIC}**\n\n` +
              `${UNIRedux.charm} ***Gears***\n\n` +
              `⚔️ ${gearData.getWeaponUI()}\n` +
              `🔰 ${gearData.getArmorUI(0)}\n` +
              `🔰 ${gearData.getArmorUI(1)}\n\n` +
              `${UNIRedux.charm} ***Elemental Info***\n\n` +
              `${petPlayer.petIcon} **${petPlayer.petName}** (${
                petPlayer.petType
              }) belongs to **${elementals.elements
                .map((i) => `${i.name} (${i.class})`)
                .join(", ")}**\n\n`;
            result += `***Weak Against***: ${elementals
              .getAllWeaks()
              .join(", ")}\n`;
            result += `***Strong Against***: ${elementals
              .getAllStrongs()
              .join(", ")}\n\n`;
            const gaps = elementals
              .getGapPets()
              .map(({ ...i }) => {
                if (i.status === "stronger") i.acc = -i.acc;
                return i;
              })
              .sort((a, b) => b.acc - a.acc);
            for (const gap of gaps) {
              result += `${
                gap.status === "stronger" ? "⚠️" : "⚡"
              } ${Math.round(Math.abs(gap.acc * 100))}% **${
                gap.status === "weaker" ? "stronger" : "weaker"
              }** vs ${gap.type}\n`;
            }
            result += `\n${UNIRedux.charm} ***Spells (Coming Soon)***\n\n`;
            for (const spell of targetMap) {
              const spellData = PetPlayer.spells[spell] ?? {};
              result += `${spellData.icon ?? "⚡"} **${
                spellData.name ?? "Unknown"
              }** [ ${spellData.tp ?? 0}% ***TP*** ]\n${UNIRedux.charm} ${
                spellData.flavorText ?? "We don't know what this does..?"
              }\n\n`;
            }
            return output.reply(result);
          }

          let result = ``;
          for (const pet of petsData.getAll()) {
            const gearData = gearsData.getGearData(pet.key);
            const petPlayer = new PetPlayer(pet, gearData.toJSON());
            result += `${petPlayer.getPlayerUI()}\n`;
            result += `**ATK**: **${petPlayer.ATK}** (+${petPlayer.gearATK})\n`;
            result += `**DEF**: **${petPlayer.DF}** (+${petPlayer.gearDF})\n`;
            result += `**Magic**: **${petPlayer.MAGIC}**\n\n`;
          }
          result += `Type **${prefix}pet-gear <pet name>** to view the stats, gears, and spells of a specific pet.`;
          return output.reply(result);
        },
      },
      {
        key: "sell",
        description: "Sell a pet",
        aliases: ["-s"],
        args: ["<pet_name>"],
        async handler(_) {
          const petsData = new Inventory(rawPetsData);
          const gearsData = new GearsManage(rawGearsData);
          const nameToSell = String(args[0]);
          if (!nameToSell) {
            return output.reply(`🐾 Please specify a name of pet to sell.`);
          }

          const petToSell =
            petsData
              .getAll()
              .find(
                (pet) =>
                  pet?.name?.toLowerCase?.().trim() ===
                  nameToSell.toLowerCase().trim()
              ) || petsData.getOne(nameToSell);
          if (!petToSell) {
            return output.reply(
              `🐾 You don't have a pet named "${nameToSell}"`
            );
          }
          const updatedPet = autoUpdatePetData(petToSell);
          const gearData = gearsData.getGearData(updatedPet.key);
          if (gearData.hasGear()) {
            return output.reply(
              `🐾 You cannot sell this pet, it has armors and weapons equipped.`
            );
          }
          if (updatedPet.level < 5) {
            return output.reply(
              `🐾 Your pet is currently at level ${petToSell.level}, it must be at least level 5 to be sold.`
            );
          }

          const price = calculateWorth(updatedPet);
          const newMoney = playerMoney + price;
          const code = global.utils.generateCaptchaCode(12);
          const newPetSells = petSells + price;
          const i = await output.reply(
            `🛡️ Please reply this 12-digit **code** to confirm the sale, make sure to type it **without fonts**.

[font=typewriter]${code}[:font=typewriter]

You are going to sell ${petToSell.icon} **${petToSell.name}** for $${price}💵`
          );
          input.setReply(i.messageID, {
            petsData,
            newMoney,
            code,
            price,
            petSells: newPetSells,
            author: input.senderID,
            petToSell: updatedPet,
            key: "pet",
            // @ts-ignore
            callback: confirmSell,
          });
        },
      },
      {
        key: "shop",
        description: "Visit the basic pet shop",
        aliases: ["-sh"],
        async handler(_) {
          const bundle = {
            icon: "🐾",
            name: "Pet Bundle ☆ (Basic)",
            key: "petBundle",
            flavorText: "A bundle of pets for sale!",
            price: 3000,
            onPurchase({ moneySet }) {
              const gift = generateGift();
              Object.assign(gift, {
                name: "Basic Pet Bundle ☆",
                icon: "🐾",
                flavorText: "A bundle of pets for sale! Use inv use to open.",
                sellPrice: 3100,
                treasureKey: "randomGrouped_petsI",
                key: "petBundle",
              });
              moneySet.inventory.push(gift);
            },
          };
          const shop = new UTShop({
            ...petShop,
            itemData: [bundle, ...petFoods],
          });
          await shop.onPlay();
        },
      },
      {
        key: "shopx",
        description: "Visit the advanced pet shop",
        aliases: ["-sx"],
        // @ts-ignore
        async handler(_) {
          const bundle = {
            icon: "⭐",
            name: "Pet Bundle ☆ (Tier 2)",
            key: "petBundleII",
            flavorText: "A bundle of pets for sale!",
            price: 6000,
            onPurchase({ moneySet }) {
              const gift = generateGift();
              Object.assign(gift, {
                name: "Tier 2 Pet Bundle ☆",
                icon: "🐾",
                flavorText: "A bundle of pets for sale! Use inv use to open.",
                sellPrice: 6100,
                treasureKey: "randomGrouped_petsII",
                key: "petBundleII",
              });
              moneySet.inventory.push(gift);
            },
          };
          const bundle2 = {
            icon: "🌟",
            name: "Pet Bundle ☆ (Tier 3)",
            key: "petBundleIII",
            flavorText: "A bundle of pets for sale!",
            price: 12000,
            onPurchase({ moneySet }) {
              const gift = generateGift();
              Object.assign(gift, {
                name: "Tier 3 Pet Bundle ☆",
                icon: "🐾",
                flavorText: "A bundle of pets for sale! Use inv use to open.",
                sellPrice: 12100,
                treasureKey: "randomGrouped_petsIII",
                key: "petBundleIII",
              });
              moneySet.inventory.push(gift);
            },
          };
          const shop = new UTShop({
            ...petShop,
            itemData: [bundle, bundle2, ...petFoodsII],
          });
          await shop.onPlay();
        },
      },
      {
        key: "debugexp",
        description: "Debug pet EXP (admin only)",
        aliases: ["-dx"],
        args: ["<exp_value>"],
        async handler() {
          if (!input.isAdmin) {
            return output.reply(`🐾 Gotcha you werent even an admin!`);
          }
          const expValue = parseInt(args[0]);
          if (isNaN(expValue)) {
            return output.reply(`🐾 Please provide a valid exp.`);
          }
          return output.reply(`${PetPlayer.debugForEXP(expValue)}`);
        },
      },
      {
        key: "feed",
        description: "Feed a pet",
        aliases: ["-f"],
        args: ["<pet_name>", "<food_key | --auto>"],
        // @ts-ignore
        async handler(_) {
          const petsData = new Inventory(rawPetsData);
          const inventory = new Inventory(rawInventory);
          const cassEXP = new CassEXP(cxp);
          const [targetPet, foodKey] = args;
          if (!targetPet || !foodKey) {
            return output.reply(
              `🐾 Here's a **guide**!
${input.splitBody(" ")[0]} <pet name> <food key | --auto>

The pet name must be the **exact name** of the pet you want to feed, while the food key is the **item key** of the pet food that was in your **inventory**.`
            );
          }

          const targetPetData = petsData
            .getAll()
            .find(
              (pet) =>
                pet.name === targetPet ||
                pet.name?.toLowerCase() === targetPet?.toLowerCase()
            );
          if (!targetPetData) {
            return output.reply(
              `❌ You don't have a pet named "${targetPet}"!`
            );
          }
          const originalPet = autoUpdatePetData(
            JSON.parse(JSON.stringify(targetPetData))
          );
          if (!isPetHungry(targetPetData)) {
            return output.reply(`❌ **${targetPetData.name}** is not hungry!`);
          }

          let targetFood =
            foodKey === "--auto"
              ? inventory
                  .getAll()
                  .find((item) => item.type === `${targetPetData.petType}_food`)
              : inventory.getOne(foodKey) ||
                inventory.getOne(foodKey.toLowerCase()) ||
                inventory
                  .getAll()
                  .find((item) => item.name === args.slice(1).join(" "));
          if (!targetFood) {
            return output.reply(
              `❌ You don't have an inventory item that has key "${foodKey}"`
            );
          }
          if (
            targetFood.type !== `${targetPetData.petType}_food` &&
            targetFood.type !== "anypet_food" &&
            targetFood.type !== "food"
          ) {
            return output.reply(
              `❌ You can only feed a ${targetPetData.petType} with a food that has type: "${targetPetData.petType}_food", **${targetPetData.name}** will obviously not eat "${targetFood.type}" typed food.`
            );
          }
          if (
            (targetPetData.lastFoodEaten === targetFood.key &&
              (targetFood.picky ||
                targetFood.key === "badApple" ||
                targetFood.type === "food")) ||
            (Number(targetFood.saturation) < 0 &&
              Number(targetPetData.lastExp) < 0)
          ) {
            return output.reply(
              `${UNIRedux.charm} ${targetPetData.icon} **${targetPetData.name}** no longer likes ${targetFood.icon} **${targetFood.name}**!\nPlease feed them **something else** before feeding it this **same food** again.\n\n(Did I bold too many words?)`
            );
          }

          if (targetFood.type === "food") {
            const sat1 = (Number(targetFood.heal) || 0) * 1.2 * 60 * 1000;
            targetFood.saturation = Math.floor(
              sat1 * 0.25 + Math.floor(Math.random() * (sat1 * 0.75)) + 1
            );
          }
          if (isNaN(Number(targetFood.saturation))) {
            return output.wentWrong();
          }

          targetPetData.lastSaturation = targetFood.saturation;
          if (targetFood.type === "food")
            // @ts-ignore
            targetPetData.lastSaturation += targetFood.saturation;
          targetPetData.lastFeed = Math.min(
            // @ts-ignore
            (targetPetData.lastFeed ?? Date.now()) +
              // @ts-ignore
              targetFood.saturation * 360,
            Date.now()
          );
          targetPetData.lastFoodEaten = targetFood.key;
          targetPetData.lastExp =
            // @ts-ignore
            (targetPetData.lastExp ?? 0) +
            // @ts-ignore
            Math.floor(targetFood.saturation / 60 / 1000);
          const userAddedExp = clamp(
            3,
            // @ts-ignore
            Math.floor(targetPetData.lastExp / 1000),
            50
          );
          cassEXP.expControls.raise(userAddedExp);
          const updatedPet = autoUpdatePetData(targetPetData);

          inventory.deleteOne(targetFood.key);
          petsData.deleteOne(updatedPet.key);
          petsData.addOne(updatedPet);
          const gearsData = new GearsManage(rawGearsData);
          const gearData = gearsData.getGearData(updatedPet.key);
          const player = new PetPlayer(updatedPet, gearData.toJSON());

          /**
           *
           * @param {string} key
           * @returns
           */
          function getDiff(key) {
            const diff = Number(updatedPet[key]) - Number(originalPet[key]);
            return diff === 0 ? "" : diff > 0 ? ` (+${diff})` : ` (${diff})`;
          }

          await money.setItem(input.senderID, {
            // @ts-ignore
            petsData: Array.from(petsData),
            inventory: Array.from(inventory),
            cassEXP: cassEXP.raw(),
          });

          const hungryAfter = petHungryAfter(updatedPet);
          let petText = `✦ ${player.getPlayerUI({
            upperPop: isPetHungry(updatedPet) ? "Hungry" : null,
          })}
🗃️ ***Type***: ${updatedPet.petType}
🧭 ***Level***: ${updatedPet.level} ${getDiff("level")}
✨ ***Exp***: ${updatedPet.lastExp ?? 0}/${calculateNextExp(
            updatedPet
          )} ${getDiff("lastExp")}
💵 **Worth**: ${calculateWorth(updatedPet)}$ ${getDiff("worth")}
🍽️ ***Hungry ${
            hungryAfter >= 0 ? `After` : `Since`
          }***: ${global.utils.convertTimeSentence(
            global.utils.formatTimeDiff(Math.abs(hungryAfter))
          )}${
            isPetHungry(updatedPet)
              ? `\n⚠️ **WARN**: Please feed ${updatedPet.name} immediately.`
              : ""
          }
🔎 ***ID***: ${updatedPet.key}`;
          return output.reply(
            `✅ **${targetPetData.name}** has been fed with ${
              targetFood.icon === updatedPet.icon ? "" : `${targetFood.icon} `
            }**${
              targetFood.name
            }**!\n\nThis food effect will last for approximately ${Math.floor(
              targetFood.type === "food"
                ? (Number(targetFood.saturation) / 60 / 1000) * 2
                : Number(targetFood.saturation) / 60 / 1000
            )} minutes.\n\n${petText}\n\nThank you **${name}** for taking care of this pet!`
          );
        },
      },
      {
        key: "top",
        description: "View top pets leaderboard",
        aliases: ["-t"],
        args: ["[page]"],
        // @ts-ignore
        async handler(_, __) {
          let page = parseInt(args[0]) ?? 1;
          if (isNaN(page)) page = 1;
          const sliceA = (page - 1) * 10;
          const sliceB = page * 10;
          const allData = await money.getAll();

          const sortedKeys = Object.keys(allData)
            .filter(
              (i) => allData[i].petsData && allData[i].petsData.every(Boolean)
            )
            .sort((a, b) => {
              const { petsData: dataB = [], gearsData: gearsB } = allData[b];
              const { petsData: dataA = [], gearsData: gearsA } = allData[a];
              const sortedB = dataB
                .map(autoUpdatePetData)
                .sort(
                  (a, b) =>
                    calculateWorth(b) +
                    (b.lastExp ?? 0) -
                    (calculateWorth(a) + (a.lastExp ?? 0))
                );
              const sortedA = dataA
                .map(autoUpdatePetData)
                .sort(
                  (a, b) =>
                    calculateWorth(b) +
                    (b.lastExp ?? 0) -
                    (calculateWorth(a) + (a.lastExp ?? 0))
                );
              const highestA = sortedA[0] || {};
              const highestB = sortedB[0] || {};
              const gearsManageA = new GearsManage(gearsA);
              const gearsManageB = new GearsManage(gearsB);
              // @ts-ignore
              const petGearA = gearsManageA.getGearData(highestA.key);
              // @ts-ignore
              const petGearB = gearsManageB.getGearData(highestB.key);
              const statA =
                new PetPlayer(highestA, petGearA).HP / 4 +
                calculateWorth(highestA) / 1000;
              const statB =
                new PetPlayer(highestB, petGearB).HP / 4 +
                calculateWorth(highestB) / 1000;
              return statB - statA;
            })
            .slice(sliceA, sliceB);

          let result = `💪 Top 20 **strongest** pets:\n\n`;
          let num = sliceA + 1;
          for (const userID of sortedKeys) {
            const {
              gearsData = [],
              petsData = [],
              name = "Chara",
            } = allData[userID];
            const pet = autoUpdatePetData(
              petsData.sort(
                (a, b) =>
                  calculateWorth(b) +
                  (Number(b.lastExp) || 0) -
                  (Number(calculateWorth(a)) + (Number(a.lastExp) ?? 0))
              )[0] || {}
            );
            const gearsManage = new GearsManage(gearsData);
            const gearData = gearsManage.getGearData(pet.key);
            const player = new PetPlayer(pet, gearData.toJSON());
            result += `${num === 1 ? `👑` : num > 10 ? num : `0${num}`} ${
              num === 1
                ? `[font=double_struck]${name
                    .toUpperCase()
                    .split("")
                    .join(" ")}[:font=double_struck]`
                : `- ***${name}***`
            }\n✦ ${player.getPlayerUI(
              isPetHungry(pet) ? { upperPop: "Hungry" } : {}
            )}
⚔️ ***ATK***: ${player.ATK} (+${player.gearATK})
🔰 ***DEF***: ${player.DF} (+${player.gearDF})
🔥 ***MAGIC***: ${player.MAGIC}
🗃️ ***Type***: ${pet.petType ?? "Unknown"}
🧭 ***Level***: ${pet.level ?? 1}
✨ ***Exp***: ${pet.lastExp ?? 0}/${calculateNextExp(pet)}
💵 **Worth**: ${calculateWorth(pet)}$\n\n`;
            num++;
          }
          result += `Type **${prefix}pet-top ${
            page + 1
          }** to view the next page.`;
          return output.reply(result);
        },
      },
      {
        key: "list",
        description: "List your pets",
        aliases: ["-l"],
        async handler(_) {
          const petsData = new Inventory(rawPetsData);
          const pets = petsData.getAll();
          let result = `**${name}'s** Pets:\n\n`;
          for (let pet of pets) {
            pet = autoUpdatePetData(pet);
            const hungryAfter = petHungryAfter(pet);
            result += `${UNIRedux.charm} ${pet.icon} **${pet.name}**${
              isPetHungry(pet) ? " (Hungry)" : ""
            }
🗃️ ***Type***: ${pet.petType}
🧭 ***Level***: ${pet.level}
✨ ***Exp***: ${pet.lastExp ?? 0}/${calculateNextExp(pet)}
💵 **Worth**: ${calculateWorth(pet)}$
🍽️ ***Hungry ${
              hungryAfter >= 0 ? `After` : `Since`
            }***: ${global.utils.convertTimeSentence(
              global.utils.formatTimeDiff(Math.abs(hungryAfter))
            )}${
              isPetHungry(pet)
                ? `\n⚠️ **WARN**: Please feed ${pet.name} immediately.`
                : ""
            }
🔎 ***ID***: ${pet.key}\n\n`;
          }
          if (pets.length === 0) {
            result += `🐾 You don't have any pets, try **uncaging** a pet if you have opened a bundle.`;
          }
          return output.reply(result);
        },
      },
      {
        key: "uncage",
        description: "Uncage a pet from your inventory",
        aliases: ["-u"],
        async handler(_, __) {
          const inventory = new Inventory(rawInventory);
          const petVentory = new Inventory(
            rawInventory.filter((item) => item.type === "pet")
          );
          const pets = petVentory.getAll();
          if (pets.length === 0) {
            return output.reply(
              `🐾 You don't have any pets to uncage, try using a bundle if you have purchased one.`
            );
          }

          let petList = `${UNIRedux.arrow} ***Caged Pets***\n\n`;
          pets.forEach((pet, index) => {
            petList += `${index + 1}. ${pet.icon} **${pet.name}** [${
              pet.key
            }]\n${UNIRedux.charm} ${pet.flavorText}\n`;
          });
          const i = await output.reply(
            `🐾 Here are your caged pets:\n\n${petList}\n\n🐾 Which pet would you like to uncage? Reply with a number!`
          );
          input.setReply(i.messageID, {
            author: input.senderID,
            // @ts-ignore
            callback: uncageReply,
            key: "pet",
            inventory,
            petVentory,
            type: "uncaging",
            detectID: i.messageID,
          });
        },
      },
      {
        key: "rename",
        description: "Rename a pet using a Dog Tag",
        aliases: ["-r"],
        async handler(_) {
          const inventory = new Inventory(rawInventory);
          const petsData = new Inventory(rawPetsData);
          if (!inventory.has("dogTag")) {
            return output.reply(
              `A 🏷️ **Dog Tag** is required to perform this action.`
            );
          }
          const pets = petsData.getAll();
          if (pets.length === 0) {
            return output.reply(`🐾 You don't have any pets to rename`);
          }

          let petList = "";
          pets.forEach((pet, index) => {
            petList += `${index + 1}. ${pet.icon} **${pet.name}** [${
              pet.key
            }]\n${UNIRedux.charm} ${pet.flavorText}\n`;
          });
          const i = await output.reply(
            `🐾 Here are your pets:\n\n${petList}\n\n🐾 Which pet would you like to rename? Reply with a number!`
          );
          input.setReply(i.messageID, {
            author: input.senderID,
            // @ts-ignore
            callback: renameReply,
            key: "pet",
            inventory,
            petVentory: petsData,
            type: "choosing",
            detectID: i.messageID,
          });
        },
      },

      {
        key: "addcar",
        description: "Assign pets to a car (max 5)",
        aliases: ["-ac"],
        args: ["<car_name>", "<...pet_names>"],
        // @ts-ignore
        async handler(_) {
          const petsData = new Inventory(rawPetsData || []);
          const carsData = new Inventory(rawCarsData || []);
          const [carName, ...petNames] = args;

          if (!carName || petNames.length === 0) {
            return output.reply(
              `🐾 Please specify arguments with a **car name** and some **pet names** separated all by **spaces.**`
            );
          }

          const targetCar = carsData
            .getAll()
            .find(
              (car) =>
                car &&
                car.name &&
                car.name.toLowerCase().trim() === carName.toLowerCase().trim()
            );
          if (!targetCar) {
            return output.reply(`❌ You don't have a car named "${carName}"!`);
          }

          if (!Array.isArray(targetCar.pets)) {
            targetCar.pets = [];
          }

          const petsToAssign = [];
          for (const petName of petNames) {
            const pet = petsData
              .getAll()
              .find(
                (p) =>
                  p &&
                  p.name &&
                  p.name.toLowerCase().trim() === petName.toLowerCase().trim()
              );
            if (!pet) {
              return output.reply(
                `❌ You don't have a pet named "${petName}"!`
              );
            }

            if (
              typeof pet.carAssigned === "string" &&
              pet.carAssigned !== targetCar.key &&
              // @ts-ignore
              !targetCar.pets.includes(pet.key)
            ) {
              const oldCar = carsData.getOne(pet.carAssigned);
              if (oldCar && Array.isArray(oldCar.pets)) {
                oldCar.pets = oldCar.pets.filter((pId) => pId !== pet.key);
                carsData.deleteOne(oldCar.key);
                carsData.addOne(oldCar);
              }
            }
            petsToAssign.push(pet);
          }

          // @ts-ignore
          const currentPetCount = targetCar.pets.length || 0;
          if (currentPetCount + petsToAssign.length > 5) {
            return output.reply(
              `🐾 You can only have a maximum of 5 pets in **${targetCar.name}**! (Current: ${currentPetCount})`
            );
          }

          for (const pet of petsToAssign) {
            // @ts-ignore
            if (!targetCar.pets.includes(pet.key)) {
              // @ts-ignore
              targetCar.pets.push(pet.key);
            }
            pet.carAssigned = targetCar.key;
            petsData.deleteOne(pet.key);
            petsData.addOne(autoUpdatePetData(pet));
          }

          carsData.deleteOne(targetCar.key);
          carsData.addOne(targetCar);

          await money.set(input.senderID, {
            //
            // @ts-ignore
            petsData: Array.from(petsData),
            carsData: Array.from(carsData),
          });

          return output.reply(
            `✅ Pets have been assigned to ${targetCar.icon || "🚗"} **${
              targetCar.name
            }**! Happy roadtrip!\n\n` +
              `**🔎 Pets Assigned**: ${petsToAssign
                .map((p) => `${p.icon || "🐾"} ${p.name}`)
                .join(", ")}`
          );
        },
      },
      {
        key: "car",
        description: "View pets assigned to cars",
        aliases: ["-pc"],
        args: ["[car_name]"],
        async handler(_) {
          const petsData = new Inventory(rawPetsData || []);
          const carsData = new Inventory(rawCarsData || []);
          const gearsData = new GearsManage(rawGearsData || []);
          const carName = args[0];

          if (!carName) {
            const cars = carsData
              .getAll()
              .map((car) => {
                if (!car || typeof car !== "object") return null;
                if (!Array.isArray(car.pets)) car.pets = [];
                return car;
              })
              .filter(Boolean);
            if (cars.length === 0) {
              return output.reply(`🐾 You don't have any cars`);
            }

            cars.sort((a, b) => {
              // @ts-ignore
              const petCountDiff = (b.pets.length || 0) - (a.pets.length || 0);
              return petCountDiff !== 0
                ? petCountDiff
                : (a.name || "").localeCompare(b.name || "");
            });

            let result = `${UNIRedux.charm} Cars with Pets of **${name}**\n\n`;
            for (const car of cars) {
              const petIcons = (car.pets || [])
                .map((petId) => {
                  const pet = petsData.getOne(petId);
                  return pet && pet.icon ? pet.icon : "🐾";
                })
                // @ts-ignore
                .join(" ");
              result +=
                `${car.icon || "🚗"} ${car.name || "Unnamed"}\n` +
                // @ts-ignore
                `${UNIRedux.arrow} ${car.pets.length}/5\n` +
                `${petIcons || "None"}\n\n`;
            }
            result +=
              `Type ${prefix}pet-pc <car name> to see **all your pets** in a specific **car**. (full info)\n` +
              `You also can **organize** your pets with "${prefix}pet-addcar <car name> <...pet names>" (but **max 5 pets only** per car).`;
            return output.reply(result);
          }

          const targetCar = carsData
            .getAll()
            .find(
              (car) =>
                car &&
                car.name &&
                car.name.toLowerCase().trim() === carName.toLowerCase().trim()
            );
          if (!targetCar) {
            return output.reply(`🐾 You don't have a car named "${carName}"`);
          }

          if (!Array.isArray(targetCar.pets) || targetCar.pets.length === 0) {
            return output.reply(
              `🐾 No pets here, Type "${prefix}pet-addcar <car name> <...pet names>" to **assign now**.`
            );
          }

          const assignedPets = targetCar.pets
            .map((petId) => petsData.getOne(petId))
            .filter((pet) => pet && typeof pet === "object")
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

          let result = `${UNIRedux.charm} Pets in **${targetCar.icon || "🚗"} ${
            targetCar.name
          }** of **${name}**\n\n`;
          for (const pet of assignedPets) {
            const updatedPet = autoUpdatePetData(pet);
            const hungryAfter = petHungryAfter(updatedPet);
            const gearData = gearsData.getGearData(updatedPet.key);
            const player = new PetPlayer(updatedPet, gearData.toJSON());
            result += `${player.getPlayerUI({
              upperPop: isPetHungry(updatedPet) ? "(Hungry)" : null,
            })}\n
🗃️ ***Type***: ${updatedPet.petType}
🧭 ***Level***: ${updatedPet.level}
✨ ***Exp***: ${updatedPet.lastExp ?? 0}/${calculateNextExp(updatedPet)}
💵 **Worth**: ${calculateWorth(updatedPet)}$
🍽️ ***Hungry ${
              hungryAfter >= 0 ? `After` : `Since`
            }***: ${global.utils.convertTimeSentence(
              global.utils.formatTimeDiff(Math.abs(hungryAfter))
            )}${
              isPetHungry(updatedPet)
                ? `\n⚠️ **WARN**: Please feed ${updatedPet.name} immediately.`
                : ""
            }
🔎 ***ID***: ${updatedPet.key}\n\n`;
          }
          return output.reply(result);
        },
      },
    ]
  );

  return home.runInContext(ctx);
}

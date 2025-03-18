import { CassEXP } from "../modules/cassEXP.js";
import { clamp } from "../modules/unisym.js";

export const meta = {
  name: "pet",
  description: "Manage your pets!",
  otherNames: ["p"],
  version: "1.5.2",
  usage: "{prefix}{name}",
  category: "Idle Investment Games",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 1,
  shopPrice: 200,
  requirement: "2.5.0",
  icon: "🐕",
};
const { invLimit } = global.Cassidy;

const { parseCurrency: pCy } = global.utils;

export const style = {
  title: "Pet 🐕",
  titleFont: "bold",
  contentFont: "fancy",
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
function calculateWorth(pet) {
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
function autoUpdatePetData(petData) {
  const { lastExp = 0 } = petData;

  petData.level = lastExp < 10 ? 1 : Math.floor(Math.log2(lastExp / 10)) + 1;
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
  const newData = {
    money: newMoney,
    petsData: Array.from(petsData),
    petSells,
  };
  await money.set(input.senderID, newData);
  return output.reply(
    `😥${petToSell.icon} You successfully sold **${petToSell.name}** for $${price}💵`
  );
}

/**
 * @type {Record<string, CommandEntry>}
 */
export const entry = {
  async gear({
    PetPlayer,
    input,
    output,
    money,
    Inventory,
    GearsManage,
    args,
    ElementalChilds,
    elementalPets,
  }) {
    let {
      name = "Unregistered",
      petsData = [],
      gearsData,
    } = await money.get(input.senderID);
    gearsData = new GearsManage(gearsData);
    petsData.sort((a, b) => (b.lastExp ?? 0) - (a.lastExp ?? 0));
    const spellMap = PetPlayer.petSpellMap;
    const petsVentory = new Inventory(petsData);
    let result = "";
    if (args[0]) {
      const pet = petsVentory
        .getAll()
        .find(
          (pet) =>
            String(pet.name).toLowerCase().trim() ===
            String(args[0]).toLowerCase().trim()
        );
      if (!pet) {
        return output.reply(`🐾 You don't have a pet named "${args[0]}"`);
      }
      let result = "";
      const gearData = gearsData.getGearData(pet.key);
      const targetMap = spellMap[pet.petType] ?? [];
      const petPlayer = new PetPlayer(pet, gearData.toJSON());
      result += `${petPlayer.getPlayerUI()}\n\n`;
      result += `✦ ***Total Stats***\n\n`;
      result += `**ATK**: **${petPlayer.ATK}** (+${petPlayer.gearATK})\n**DEF**: **${petPlayer.DF}** (+${petPlayer.gearDF})\n**Magic**: **${petPlayer.MAGIC}**\n\n`;
      result += `✦ ***Gears***\n\n`;
      result += `⚔️ ${gearData.getWeaponUI()}\n🔰 ${gearData.getArmorUI(
        0
      )}\n🔰 ${gearData.getArmorUI(1)}\n\n`;
      result += `✦ ***Elemental Info***\n\n`;
      const elementals = petPlayer.getElementals();
      result += `${petPlayer.petIcon} **${
        petPlayer.petName
      }** belongs to **${elementals.elements
        .map((i) => `${i.name} (${i.class})`)
        .join(", ")}**\n\n`;
      const gaps = elementals
        .getGapPets()
        .map(({ ...i }) => {
          if (i.status === "stronger") {
            i.acc = -i.acc;
          }
          return i;
        })
        .toSorted((a, b) => {
          return b.acc - a.acc;
        });
      result += `***Weak Against***: ${elementals
        .getAllWeaks()
        .join(", ")}\n\n`;
      result += `***Strong Against***: ${elementals
        .getAllStrongs()
        .join(", ")}\n\n`;
      for (const gap of gaps) {
        result += `${gap.status === "stronger" ? "⚠️" : "⚡"} ${Math.round(
          Math.abs(gap.acc * 100)
        )}% **${gap.status === "weaker" ? "stronger" : "weaker"}** against **${
          gap.type
        }** typed pets.\n`;
      }
      result += `\n`;
      result += `✦ ***Spells (Coming Soon)***\n\n`;
      for (const spell of targetMap) {
        const spellData = PetPlayer.spells[spell] ?? {};
        result += `${spellData.icon ?? "⚡"} **${
          spellData.name ?? "Unknown"
        }** [ ${spellData.tp ?? 0}% ***TP*** ]\n✦ ${
          spellData.flavorText ?? "We don't know what this does..?"
        }\n\n`;
      }
      return output.reply(result);
    }
    for (const pet of petsVentory) {
      const gearData = gearsData.getGearData(pet.key);
      const petPlayer = new PetPlayer(pet, gearData.toJSON());
      result += `${petPlayer.getPlayerUI()}\n\n`;
      result += `**ATK**: **${petPlayer.ATK}** (+${petPlayer.gearATK})\n**DEF**: **${petPlayer.DF}** (+${petPlayer.gearDF})\n**Magic**: **${petPlayer.MAGIC}**\n\n`;
    }
    result += `Type **pet.gear <pet name>** to view the stats, gears, and spells of a specific pet.`;
    return output.reply(result);
  },
  /*async buy({ UTShop }) {
    const shop = new UTShop(petShop);
    await shop.onPlay();
  },*/
  async sell({ input, output, money, Inventory, GearsManage }) {
    let nameToSell = String(input.arguments[0]);
    let {
      money: playerMoney = 0,
      petsData = [],
      petSells = 0,
      gearsData = [],
    } = await money.get(input.senderID);
    gearsData = new GearsManage(gearsData);
    petsData = new Inventory(petsData);
    const planA = petsData
      .getAll()
      .find(
        (pet) =>
          pet?.name?.toLowerCase?.()?.trim() === nameToSell.toLowerCase().trim()
      );
    const planB = petsData.getOne(nameToSell);
    let petToSell = planA || planB;
    if (!petToSell) {
      return output.reply(`🐾 You don't have a pet named "${nameToSell}"`);
    }
    petToSell = autoUpdatePetData(petToSell);
    const gearData = gearsData.getGearData(petToSell.key);
    if (gearData.hasGear()) {
      return output.reply(
        `🐾 You cannot sell this pet, it has armors and weapons equipped.`
      );
    }
    if (petToSell.level < 5) {
      return output.reply(
        `🐾 Your pet is currently at level ${petToSell.level}, it must be at least level 5 to be sold.`
      );
    }
    const price = calculateWorth(petToSell);
    const newMoney = playerMoney + price;
    const code = global.utils.generateCaptchaCode(12);
    petSells = petSells + price;
    const i =
      await output.reply(`🛡️ Please reply this 12-digit **code** to confirm the sale, make sure to type it **without fonts**.

[font=typewriter]${code}[:font=typewriter]

You are going to sell ${petToSell.icon} **${petToSell.name}** for $${price}💵`);
    input.setReply(i.messageID, {
      petsData,
      newMoney,
      code,
      price,
      petSells,
      author: input.senderID,
      petToSell,
      key: "pet",
      callback: confirmSell,
    });
  },
  async shop({ UTShop, generateGift }) {
    const bundle = {
      icon: "🐾",
      name: "Pet Bundle ☆ (Basic)",
      key: "petBundle",
      flavorText: "A bundle of pets for sale!",
      price: 3000,
      onPurchase({ moneySet }) {
        const gift = generateGift();
        (gift.name = "Basic Pet Bundle ☆"),
          (gift.icon = "🐾"),
          (gift.flavorText =
            "A bundle of pets for sale! You can get a random caged pet from this bundle. Use inv use to use this item.");
        gift.sellPrice = 3100;
        gift.treasureKey = "randomGrouped_petsI";
        gift.key = "petBundle";
        moneySet.inventory.push(gift);
      },
    };
    const shop = new UTShop({ ...petShop, itemData: [bundle, ...petFoods] });
    await shop.onPlay();
  },
  async shopX({ UTShop, generateGift }) {
    const bundle = {
      icon: "⭐",
      name: "Pet Bundle ☆ (Tier 2)",
      key: "petBundleII",
      flavorText: "A bundle of pets for sale!",
      price: 6000,
      onPurchase({ moneySet }) {
        const gift = generateGift();
        (gift.name = "Tier 2 Pet Bundle ☆"),
          (gift.icon = "🐾"),
          (gift.flavorText =
            "A bundle of pets for sale! You can get a random caged pet from this bundle. Use inv use to use this item.");
        gift.sellPrice = 6100;
        gift.treasureKey = "randomGrouped_petsII";
        gift.key = "petBundleII";
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
        (gift.name = "Tier 3 Pet Bundle ☆"),
          (gift.icon = "🐾"),
          (gift.flavorText =
            "A bundle of pets for sale! You can get a random caged pet from this bundle. Use inv use to use this item.");
        gift.sellPrice = 12100;
        gift.treasureKey = "randomGrouped_petsIII";
        gift.key = "petBundleIII";
        moneySet.inventory.push(gift);
      },
    };
    const shop = new UTShop({
      ...petShop,
      itemData: [bundle, bundle2, ...petFoodsII],
    });
    await shop.onPlay();
  },

  async debugEXP({ input, PetPlayer, output }) {
    output.reply(PetPlayer.debugForEXP(parseInt(input.arguments[0])));
  },
  async feed({ input, output, money, Inventory, GearsManage, PetPlayer }) {
    let {
      name = "Unregistered",
      petsData = [],
      inventory,
      gearsData,
      cassEXP: cxp,
    } = await money.get(input.senderID);
    const cassEXP = new CassEXP(cxp);
    const [targetPet, foodKey] = input.arguments;
    if (!targetPet || !foodKey) {
      return output.reply(`🐾 Here's a **guide**!
${input.splitBody(" ")[0]} <pet name> <food key>

The pet name must be the **exact name** of the pet you want to feed, while the food key is the **item key** of the pet food that was in your **inventory**.`);
    }
    petsData = new Inventory(petsData);
    inventory = new Inventory(inventory);
    let targetPetData = petsData
      .getAll()
      .find(
        (pet) =>
          pet.name === targetPet ||
          pet.name?.toLowerCase() === targetPet?.toLowerCase()
      );
    if (!targetPetData) {
      return output.reply(`❌ You don't have a pet named "${targetPet}"!`);
    }
    const originalPet = autoUpdatePetData(
      JSON.parse(JSON.stringify(targetPetData))
    );
    if (!isPetHungry(targetPetData)) {
      return output.reply(`❌ **${targetPetData.name}** is not hungry!`);
    }
    const altKey = input.arguments
      .slice(1)
      .map((key, index) => {
        if (index !== 0) {
          return `${key.charAt(0)?.toUpperCase()}${key.slice(1).toLowerCase()}`;
        } else {
          return key.toLowerCase();
        }
      })
      .join("");
    const lastKey = inventory
      .getAll()
      .find((item) => item.name === input.arguments.slice(1).join(" "));
    let targetFood =
      inventory.getOne(foodKey) ||
      inventory.getOne(altKey) ||
      inventory.getOne(lastKey);
    if (foodKey === "--auto") {
      targetFood = inventory
        .getAll()
        .find((item) => item.type === `${targetPetData.petType}_food`);
    }
    if (!targetFood) {
      return output.reply(
        `❌ You don't have an inventory item that has key "${foodKey}" or "${altKey}" or even "${lastKey}"!`
      );
    }
    if (targetFood.type !== `${targetPetData.petType}_food`) {
      targetFood =
        inventory
          .getAll()
          .find(
            (item) =>
              item.type === `${targetPetData.petType}_food` &&
              item.key === targetFood.key
          ) ?? targetFood;
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
        (targetFood.picky === true ||
          targetFood.key === "badApple" ||
          targetFood.type === "food")) ||
      (targetFood.saturation < 0 && targetPetData.lastExp < 0)
    ) {
      return output.reply(
        `✦ ${targetPetData.icon} **${targetPetData.name}** no longer likes ${targetFood.icon} **${targetFood.name}**!\nPlease feed them **something else** before feeding it this **same food** again.\n\n(Did I bold too many words?)`
      );
    }

    if (targetFood.type === "food") {
      const sat1 = (targetFood.heal ?? 0) * 1.2 * 60 * 1000;
      targetFood.saturation = Math.floor(
        sat1 * 0.25 + Math.floor(Math.random() * (sat1 * 0.75)) + 1
      );
    }
    if (isNaN(targetFood.saturation)) {
      return output.reply(`Something went wrong...`);
    }
    targetPetData.lastSaturation = targetFood.saturation;
    if (targetFood.type === "food") {
      targetPetData.lastSaturation += targetFood.saturation;
    }

    //targetPetData.lastFeed = Date.now();
    targetPetData.lastFeed = Math.min(
      (targetPetData.lastFeed ?? Date.now()) + targetFood.saturation * 360,
      Date.now()
    );
    targetPetData.lastFoodEaten = targetFood.key;
    targetPetData.lastExp ??= 0;
    const addedExp = Math.floor(targetFood.saturation / 60 / 1000);
    targetPetData.lastExp += addedExp;
    const userAddedExp = clamp(3, Math.floor(addedExp / 1000), 50);
    cassEXP.expControls.raise(userAddedExp);
    targetPetData = autoUpdatePetData(targetPetData);
    inventory.deleteOne(targetFood.key);
    petsData.deleteOne(targetPetData.key);
    petsData.addOne(targetPetData);
    gearsData = new GearsManage(gearsData);
    const gearData = gearsData.getGearData(targetPetData.key);
    const player = new PetPlayer(targetPetData, gearData.toJSON());
    const oldHP = player.HP;

    function getDiff(key) {
      const og = originalPet;
      const newPet = targetPetData;
      let diff = newPet[key] - og[key];
      if (key === "worth") {
        diff = calculateWorth(newPet) - calculateWorth(og);
      }
      if (diff === 0) {
        return ``;
      }
      return diff > 0 ? `(+${diff})` : `(${diff})`;
    }
    await money.set(input.senderID, {
      petsData: Array.from(petsData),
      inventory: Array.from(inventory),
      cassEXP: cassEXP.raw(),
    });
    let pet = targetPetData;
    pet = autoUpdatePetData(pet);
    const hungryAfter = petHungryAfter(pet);
    let petText = `✦ ${player.getPlayerUI({
      upperPop: isPetHungry(pet) ? "(Hungry)" : null,
    })}
🗃️ ***Type***: ${pet.petType}
🧭 ***Level***: ${pet.level} ${getDiff("level")}
✨ ***Exp***: ${pet.lastExp ?? 0}/${calculateNextExp(pet)} ${getDiff("lastExp")}
💵 **Worth**: ${calculateWorth(pet)}$ ${getDiff("worth")}
🍽️ ***Hungry ${
      hungryAfter >= 0 ? `After` : `Since`
    }***: ${global.utils.convertTimeSentence(
      global.utils.formatTimeDiff(Math.abs(hungryAfter))
    )}${
      isPetHungry(pet)
        ? `\n⚠️ **WARN**: Please feed ${pet.name} immediately.`
        : ""
    }
🔎 ***ID***: ${pet.key}`;
    return output.reply(`✅ **${targetPetData.name}** has been fed with ${
      targetFood.icon === pet.icon ? "" : `${targetFood.icon} `
    }**${targetFood.name}**!

This food effect will last for approximately ${Math.floor(
      targetFood.type === "food"
        ? (targetFood.saturation / 60 / 1000) * 2
        : targetFood.saturation / 60 / 1000
    )} minutes.

${petText}

Thank you **${name}** for taking care of this pet!`);
  },
  async top({
    input,
    output,
    money,
    Inventory,
    GearsManage,
    PetPlayer,
    prefix,
  }) {
    let page = parseInt(input.arguments[0]) ?? 1;
    if (isNaN(page)) {
      page = 1;
    }
    const sliceA = (page - 1) * 10;
    const sliceB = page * 10;
    const allData = await money.getAll();
    let final = ``;
    const highestPets = {};
    let sortedKeys = Object.keys(allData)
      .filter((i) => allData[i].petsData && allData[i].petsData.every(Boolean))
      .sort((a, b) => {
        let { petsData: dataB = [], gearsData: gearsB } = allData[b];
        let { petsData: dataA = [], gearsData: gearsA } = allData[a];
        dataB = dataB.map((i) =>
          autoUpdatePetData(typeof i === "object" && i ? i : {})
        );
        dataA = dataA.map((i) =>
          autoUpdatePetData(typeof i === "object" && i ? i : {})
        );
        dataB.sort((a, b) => {
          a ??= {};
          b ??= {};
          a.lastExp ??= 0;
          b.lastExp ??= 0;
          return (
            calculateWorth(b) + b.lastExp - (calculateWorth(a) + a.lastExp)
          );
        });
        dataA.sort((a, b) => {
          a ??= {};
          b ??= {};
          a.lastExp ??= 0;
          b.lastExp ??= 0;
          return (
            calculateWorth(b) + b.lastExp - (calculateWorth(a) + a.lastExp)
          );
        });
        const highestA = dataA[0] ?? {};
        highestPets[a] = highestA ?? {};
        const highestB = dataB[0] ?? {};
        highestPets[b] = highestB ?? {};
        let worthB = calculateWorth(highestB ?? {}) + highestB.lastExp;
        let worthA = calculateWorth(highestA ?? {}) + highestA.lastExp;
        if (isNaN(worthA)) {
          worthA = 0;
        }
        if (isNaN(worthB)) {
          worthB = 0;
        }
        const gearsManageA = new GearsManage(gearsA);
        const gearsManageB = new GearsManage(gearsB);
        const petGearA = gearsManageA.getGearData(highestA.key);
        const petGearB = gearsManageB.getGearData(highestB.key);
        function helper(pet, gear) {
          const player = new PetPlayer(pet, gear);
          return (
            player.HP / 4 +
            player.DF * 10 +
            player.ATK * 10 +
            player.MAGIC * 2 -
            (player.maxHP - player.HP) * 80
          );
        }
        const statA = helper(highestA, petGearA) + worthA / 1000;
        const statB = helper(highestB, petGearB) + worthB / 1000;
        if (isNaN(statA) || isNaN(statB)) {
          throw new Error("NaN");
        }
        return statB - statA;
      })
      .slice(sliceA, sliceB);
    let num = sliceA + 1;
    final += `💪 Top 20 **strongest** pets:\n\n`;
    for (const userID of sortedKeys) {
      let {
        name = "Unregistered",
        gearsData = [],
        petsData = [],
      } = allData[userID];
      let pet = highestPets[userID];
      pet = autoUpdatePetData(pet);
      const gearsManage = new GearsManage(gearsData);
      const gearData = gearsManage.getGearData(pet.key);
      const player = new PetPlayer(pet, gearData.toJSON());
      final += `${num === 1 ? `👑` : num > 10 ? num : `0${num}`} ${
        num === 1
          ? `[font=double_struck]${name
              .toUpperCase()
              .split("")
              .join(" ")}[:font=double_struck]`
          : `- ***${name}***`
      }\n✦ ${player.getPlayerUI(isPetHungry(pet) ? { upperPop: "Hungry" } : {})}
⚔️ ***ATK***: ${player.ATK} (+${player.gearATK})
🔰 ***DEF***: ${player.DF} (+${player.gearDF})
🔥 ***MAGIC***: ${player.MAGIC}
🗃️ ***Type***: ${pet.petType ?? "Unknown"}
🧭 ***Level***: ${pet.level ?? 1}
✨ ***Exp***: ${pet.lastExp ?? 0}/${calculateNextExp(pet)}
💵 **Worth**: ${calculateWorth(pet)}$\n\n`;
      num++;
    }
    final += `Type **${prefix}pet.top ${page + 1}** to view the next page.`;
    return output.reply(final);
  },
  async list({ input, output, money, Inventory }) {
    let { name = "Unregistered", petsData = [] } = await money.get(
      input.senderID
    );
    petsData = new Inventory(petsData);
    const pets = petsData.getAll();
    let result = `**${name}'s** Pets:\n\n`;
    for (let pet of pets) {
      pet = autoUpdatePetData(pet);
      const hungryAfter = petHungryAfter(pet);
      result += `✦ ${pet.icon} **${pet.name}**${
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
  async uncage({ input, output, Inventory, money }) {
    let { inventory = [] } = await money.get(input.senderID);
    inventory = new Inventory(inventory);
    const petVentory = new Inventory(
      Array.from(inventory).filter((item) => item.type === "pet")
    );
    let petList = "";
    for (const pet of petVentory) {
      petList += `${pet.index + 1}. ${pet.icon} **${pet.name}**\n✦ ${
        pet.flavorText
      }\n`;
    }
    if (!petList) {
      return output.reply(
        `🐾 You don't have any pets to uncage, try using a bundle if you have purchased one.`
      );
    }
    const i = await output.reply(
      `🐾 Here are your caged pets:\n\n${petList}\n\n🐾 Which pet would you like to uncage? Reply with a number!`
    );
    input.setReply(i.messageID, {
      author: input.senderID,
      callback: uncageReply,
      key: "pet",
      inventory,
      petVentory,
      type: "uncaging",
      detectID: i.messageID,
    });
  },
  async rename({ input, output, Inventory, money }) {
    let { inventory = [], petsData = [] } = await money.get(input.senderID);
    inventory = new Inventory(inventory);
    if (!inventory.has("dogTag")) {
      return output.reply(
        `A 🏷️ **Dog Tag** is required to perform this action.`
      );
    }
    const petVentory = new Inventory(Array.from(petsData));
    let petList = "";
    for (const pet of petVentory) {
      petList += `${pet.index + 1}. ${pet.icon} **${pet.name}**\n✦ ${
        pet.flavorText
      }\n`;
    }
    if (!petList) {
      return output.reply(`🐾 You don't have any pets to rename`);
    }
    const i = await output.reply(
      `🐾 Here are your pets:\n\n${petList}\n\n🐾 Which pet would you like to rename? Reply with a number!`
    );
    input.setReply(i.messageID, {
      author: input.senderID,
      callback: renameReply,
      key: "pet",
      inventory,
      petVentory,
      type: "choosing",
      detectID: i.messageID,
    });
  },
};
async function renameReply({ input, output, Inventory, money, repObj }) {
  try {
    const { author, petVentory, type, detectID } = repObj;
    if (input.senderID !== author) {
      return;
    }
    let {
      name,
      petsData = [],
      inventory = [],
    } = await money.get(input.senderID);
    inventory = new Inventory(inventory);
    petsData = new Inventory(petsData);
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
      const pet = petsData.getOne(item.key);
      if (!inventory.has("dogTag")) {
        return output.reply(
          `A 🏷️ **Dog Tag** is required to perform this action.`
        );
      }
      pet.name = newName;

      inventory.deleteOne("dogTag");
      await money.set(input.senderID, {
        inventory: Array.from(inventory),
        petsData: Array.from(petsData),
      });
      let txt = `🐾 Thank you **${name}** for successfully renaming ${item.icon} your pet ${item.petType} to **${newName}**!\n🐾 Goodluck with your new pet's name!`;
      input.delReply(detectID);
      await output.reply(txt);
    }
  } catch (error) {
    output.error(error);
    console.error(error);
  }
}
async function uncageReply({ input, output, Inventory, money, repObj }) {
  try {
    const { author, inventory, petVentory, type, detectID } = repObj;
    if (input.senderID !== author) {
      return;
    }
    let { name, petsData = [] } = await money.get(input.senderID);
    petsData = new Inventory(petsData);
    if (petsData.getAll().length >= invLimit) {
      return output.reply(
        `🐾 You can only have a maximum of ${invLimit} pets!`
      );
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
        petsData: Array.from(petsData),
      });
      let txt = `🐾 Thank you **${name}** for successfully adopting ${item.icon} a new ${item.key} **${newName}**!\n🐾 Goodluck with your new pet!`;
      input.delReply(detectID);
      await output.reply(txt);
    }
  } catch (error) {
    output.error(error);
    console.error(error);
  }
}

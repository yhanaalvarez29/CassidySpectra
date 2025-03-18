export const meta = {
  name: "astralshop",
  description:
    "A celestial shop overflowing with legendary treasures. Only the richest adventurers can hope to purchase from here.",
  version: "1.1.0",
  author: "MrkimstersDev",
  usage: "{prefix}astralshop",
  category: "Shopping",
  permissions: [0],
  noPrefix: false,
  requiredLevel: 12,
};

const astralShop = {
  key: "astralShop",
  itemData: [
    // Weapons
    {
      icon: "☄️",
      name: "Meteorite Blade",
      key: "meteoriteBlade",
      type: "weapon",
      flavorText:
        "Forged from a falling star, it burns with celestial fire. ATK +100.",
      price: 2000000,
      atk: 100,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Meteorite Blade",
          key: "meteoriteBlade",
          flavorText:
            "Forged from a falling star, it burns with celestial fire. ATK +100.",
          icon: "☄️",
          type: "weapon",
          atk: 100,
          sellPrice: 1500000,
        });
      },
    },
    {
      icon: "🌠",
      name: "Starforge",
      key: "starforge",
      type: "weapon",
      flavorText: "A weapon crafted in the heart of a supernova. ATK +150.",
      price: 5000000,
      atk: 150,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Starforge",
          key: "starforge",
          flavorText: "A weapon crafted in the heart of a supernova. ATK +150.",
          icon: "🌠",
          type: "weapon",
          atk: 150,
          sellPrice: 4000000,
        });
      },
    },
    {
      icon: "⚡",
      name: "Thunderstrike Spear",
      key: "thunderstrikeSpear",
      type: "weapon",
      flavorText: "A spear that crackles with the power of storms. ATK +80.",
      price: 1500000,
      atk: 80,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Thunderstrike Spear",
          key: "thunderstrikeSpear",
          flavorText:
            "A spear that crackles with the power of storms. ATK +80.",
          icon: "⚡",
          type: "weapon",
          atk: 80,
          sellPrice: 1200000,
        });
      },
    },
    {
      icon: "🔥",
      name: "Infernal Scythe",
      key: "infernalScythe",
      type: "weapon",
      flavorText:
        "Wielded by a demon lord, it radiates unquenchable heat. ATK +120.",
      price: 3000000,
      atk: 120,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Infernal Scythe",
          key: "infernalScythe",
          flavorText:
            "Wielded by a demon lord, it radiates unquenchable heat. ATK +120.",
          icon: "🔥",
          type: "weapon",
          atk: 120,
          sellPrice: 2500000,
        });
      },
    },
    {
      icon: "💎",
      name: "Crystal Edge",
      key: "crystalEdge",
      type: "weapon",
      flavorText: "A blade carved from pure diamond. ATK +90.",
      price: 1800000,
      atk: 90,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Crystal Edge",
          key: "crystalEdge",
          flavorText: "A blade carved from pure diamond. ATK +90.",
          icon: "💎",
          type: "weapon",
          atk: 90,
          sellPrice: 1400000,
        });
      },
    },
    {
      icon: "🌌",
      name: "Galaxy Bow",
      key: "galaxyBow",
      type: "weapon",
      flavorText: "An elegant bow that fires arrows of starlight. ATK +110.",
      price: 2500000,
      atk: 110,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Galaxy Bow",
          key: "galaxyBow",
          flavorText:
            "An elegant bow that fires arrows of starlight. ATK +110.",
          icon: "🌌",
          type: "weapon",
          atk: 110,
          sellPrice: 2000000,
        });
      },
    },
    {
      icon: "🌪️",
      name: "Tempest Blade",
      key: "tempestBlade",
      type: "weapon",
      flavorText: "A blade that carries the fury of hurricanes. ATK +130.",
      price: 4000000,
      atk: 130,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Tempest Blade",
          key: "tempestBlade",
          flavorText: "A blade that carries the fury of hurricanes. ATK +130.",
          icon: "🌪️",
          type: "weapon",
          atk: 130,
          sellPrice: 3500000,
        });
      },
    },
    {
      icon: "🗡️",
      name: "Eclipse Dagger",
      key: "eclipseDagger",
      type: "weapon",
      flavorText: "A dagger that dims the light wherever it strikes. ATK +60.",
      price: 1200000,
      atk: 60,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Eclipse Dagger",
          key: "eclipseDagger",
          flavorText:
            "A dagger that dims the light wherever it strikes. ATK +60.",
          icon: "🗡️",
          type: "weapon",
          atk: 60,
          sellPrice: 1000000,
        });
      },
    },
    {
      icon: "🌠",
      name: "Nebula Hammer",
      key: "nebulaHammer",
      type: "weapon",
      flavorText: "A colossal hammer imbued with cosmic energy. ATK +140.",
      price: 3500000,
      atk: 140,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Nebula Hammer",
          key: "nebulaHammer",
          flavorText: "A colossal hammer imbued with cosmic energy. ATK +140.",
          icon: "🌠",
          type: "weapon",
          atk: 140,
          sellPrice: 3000000,
        });
      },
    },

    // Armor
    {
      icon: "🌌",
      name: "Cosmic Relic",
      key: "cosmicRelic",
      type: "armor",
      flavorText:
        "A piece of the universe itself, pulsing with infinite energy. DEF +50.",
      price: 1000000,
      def: 50,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Cosmic Relic",
          key: "cosmicRelic",
          flavorText:
            "A piece of the universe itself, pulsing with infinite energy. DEF +50.",
          icon: "🌌",
          type: "armor",
          def: 50,
          sellPrice: 800000,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Voidshield",
      key: "voidshield",
      type: "armor",
      flavorText:
        "A shield crafted from the void itself, absorbing all that touches it. DEF +70.",
      price: 2500000,
      def: 70,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Voidshield",
          key: "voidshield",
          flavorText:
            "A shield crafted from the void itself, absorbing all that touches it. DEF +70.",
          icon: "🛡️",
          type: "armor",
          def: 70,
          sellPrice: 2000000,
        });
      },
    },
    {
      icon: "🔮",
      name: "Eternal Prism",
      key: "eternalPrism",
      type: "armor",
      flavorText:
        "A prism that refracts light into infinite dimensions. DEF +90.",
      price: 3000000,
      def: 90,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Eternal Prism",
          key: "eternalPrism",
          flavorText:
            "A prism that refracts light into infinite dimensions. DEF +90.",
          icon: "🔮",
          type: "armor",
          def: 90,
          sellPrice: 2500000,
        });
      },
    },
    {
      icon: "🌀",
      name: "Stellar Cloak",
      key: "stellarCloak",
      type: "armor",
      flavorText:
        "A cloak that shimmers like the Milky Way, offering protection from cosmic forces. DEF +60.",
      price: 2200000,
      def: 60,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Stellar Cloak",
          key: "stellarCloak",
          flavorText:
            "A cloak that shimmers like the Milky Way, offering protection from cosmic forces. DEF +60.",
          icon: "🌀",
          type: "armor",
          def: 60,
          sellPrice: 1800000,
        });
      },
    },
    {
      icon: "🌟",
      name: "Galactic Breastplate",
      key: "galacticBreastplate",
      type: "armor",
      flavorText:
        "A breastplate forged from the remnants of fallen stars. DEF +80.",
      price: 2800000,
      def: 80,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Galactic Breastplate",
          key: "galacticBreastplate",
          flavorText:
            "A breastplate forged from the remnants of fallen stars. DEF +80.",
          icon: "🌟",
          type: "armor",
          def: 80,
          sellPrice: 2400000,
        });
      },
    },
    {
      icon: "💫",
      name: "Astral Gauntlets",
      key: "astralGauntlets",
      type: "armor",
      flavorText: "Gauntlets forged from the energy of distant stars. DEF +50.",
      price: 1500000,
      def: 50,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Astral Gauntlets",
          key: "astralGauntlets",
          flavorText:
            "Gauntlets forged from the energy of distant stars. DEF +50.",
          icon: "💫",
          type: "armor",
          def: 50,
          sellPrice: 1300000,
        });
      },
    },
    {
      icon: "🌒",
      name: "Moonlit Helm",
      key: "moonlitHelm",
      type: "armor",
      flavorText:
        "A helm crafted from moonstone, reflecting the power of the moon. DEF +40.",
      price: 1000000,
      def: 40,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Moonlit Helm",
          key: "moonlitHelm",
          flavorText:
            "A helm crafted from moonstone, reflecting the power of the moon. DEF +40.",
          icon: "🌒",
          type: "armor",
          def: 40,
          sellPrice: 900000,
        });
      },
    },

    // Consumables (Food)
    {
      icon: "🍔",
      name: "Astral Burger",
      key: "astralBurger",
      type: "food",
      flavorText:
        "A burger made with ingredients from the far reaches of space. Restores 500 HP.",
      price: 1000000,
      heal: 500,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Astral Burger",
          key: "astralBurger",
          flavorText:
            "A burger made with ingredients from the far reaches of space. Restores 500 HP.",
          icon: "🍔",
          type: "food",
          heal: 500,
        });
      },
    },
    {
      icon: "🍩",
      name: "Galactic Donut",
      key: "galacticDonut",
      type: "food",
      flavorText: "A sweet donut infused with cosmic sugar. Restores 300 HP.",
      price: 500000,
      heal: 300,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Galactic Donut",
          key: "galacticDonut",
          flavorText:
            "A sweet donut infused with cosmic sugar. Restores 300 HP.",
          icon: "🍩",
          type: "food",
          heal: 300,
        });
      },
    },
    {
      icon: "🍇",
      name: "Cosmic Fruit",
      key: "cosmicFruit",
      type: "food",
      flavorText:
        "A fruit from a distant galaxy, said to have regenerative properties. Restores 150 HP.",
      price: 400000,
      heal: 150,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Cosmic Fruit",
          key: "cosmicFruit",
          flavorText:
            "A fruit from a distant galaxy, said to have regenerative properties. Restores 150 HP.",
          icon: "🍇",
          type: "food",
          heal: 150,
        });
      },
    },
    {
      icon: "🍣",
      name: "Stellar Sushi",
      key: "stellarSushi",
      type: "food",
      flavorText:
        "Sushi made from fish caught in the oceans of distant planets. Restores 200 HP.",
      price: 600000,
      heal: 200,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Stellar Sushi",
          key: "stellarSushi",
          flavorText:
            "Sushi made from fish caught in the oceans of distant planets. Restores 200 HP.",
          icon: "🍣",
          type: "food",
          heal: 200,
        });
      },
    },
    {
      icon: "🍇",
      name: "Nebula Juice",
      key: "nebulaJuice",
      type: "food",
      flavorText:
        "A refreshing drink made from the fruit of a nebula. Restores 400 HP.",
      price: 900000,
      heal: 400,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Nebula Juice",
          key: "nebulaJuice",
          flavorText:
            "A refreshing drink made from the fruit of a nebula. Restores 400 HP.",
          icon: "🍇",
          type: "food",
          heal: 400,
        });
      },
    },
  ],

  sellTexts: [
    "💫 I cannot buy from you, but feel free to browse the cosmic wonders I sell!",
    "🌌 My shop is more than just business—it's about unlocking the mysteries of the universe.",
  ],

  talkTexts: [
    {
      name: "Cosmic Wonders",
      responses: [
        "🌠 The universe is full of strange wonders, like the Astral Blade and the Blade of Whispers.",
        "✨ Some items in my shop have origins unknown to us all, perhaps even from alternate realities.",
        "🌌 Every item here has a story, and each one could change the course of destiny.",
      ],
      icon: "💫",
    },
    {
      name: "The Void",
      responses: [
        "🌑 The Void is a place of unimaginable power, and some of these artifacts are said to come from its depths.",
        "🌌 Those who venture too far into the Void often do not return, but those who do bring back unimaginable treasures.",
        "🌠 What we know about the Void is limited, but I believe these items hold a key to understanding it.",
      ],
      icon: "⚡",
    },
    {
      name: "Future Ventures",
      responses: [
        "🌟 More rare and powerful items will be available soon, with new dimensions to explore.",
        "✨ As the stars align, new artifacts will be revealed—items unlike anything you’ve ever seen.",
        "🌌 I'm planning to open new realms where even more powerful relics will be accessible to the bravest adventurers.",
      ],
      icon: "🛸",
    },
  ],

  buyTexts: [
    "🌠 What otherworldly treasure would you like to purchase, adventurer?",
    "✨ Step into the cosmos and choose an item to unlock unimaginable powers!",
    "🌌 The mysteries of the universe are in your hands. Choose wisely!",
  ],

  welcomeTexts: [
    "🌟 Welcome to the Astral Shop, where cosmic wonders await!",
    "✨ Ah, a new adventurer! Come, explore relics from beyond the stars.",
    "🌌 The universe beckons, and I have just the items you need.",
  ],

  goBackTexts: [
    "💫 Take your time, the cosmos is vast and full of mysteries.",
    "🌠 Return when you're ready to explore the unknown.",
    "✨ When you're ready to make a purchase, I'll be here waiting.",
  ],

  askTalkTexts: [
    "🌌 Care to hear a tale from the farthest reaches of the universe?",
    "🌟 Let me tell you the story of how these relics came into my possession.",
    "✨ Interested in learning more about the mysteries of the cosmos?",
  ],

  thankTexts: [
    "🌠 Thank you for visiting the Astral Shop. May your journey through the stars be filled with wonder!",
    "✨ Until we meet again, adventurer. The cosmos is always open to you.",
    "🌌 I hope you find what you seek, adventurer. The universe is vast and full of possibilities.",
  ],
};

export async function entry({ UTShop }) {
  const shop = new UTShop(astralShop);
  return shop.onPlay();
}

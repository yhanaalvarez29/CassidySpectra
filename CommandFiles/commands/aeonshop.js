export const meta = {
  name: "AeonShop",
  description:
    "A shop offering rare artifacts inspired by the Aeons of Honkai: Star Rail.",
  version: "1.0.0",
  author: "MrkimstersDev",
  usage: "{prefix}aeonshop",
  category: "Shop",
  permissions: [0],
  noPrefix: false,
  requiredLevel: 15,
};

const aeonShop = {
  key: "aeonShop",
  itemData: [
    {
      icon: "🌌",
      name: "Nanook's Wrath",
      key: "nanooksWrath",
      price: 50000000,
      flavorText:
        "Harness the destructive power of Nanook, the Aeon of Destruction.",
      type: "weapon",
      atk: 200,
      def: 50,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Nanook's Wrath",
          key: "nanooksWrath",
          flavorText:
            "Harness the destructive power of Nanook, the Aeon of Destruction.",
          icon: "🌌",
          type: "weapon",
          atk: 200,
          def: 50,
          sellPrice: 25000000,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Xipe's Embrace",
      key: "xipesEmbrace",
      price: 45000000,
      flavorText:
        "A shield blessed by Xipe, the Aeon of Harmony, offering unparalleled protection.",
      type: "armor",
      def: 250,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Xipe's Embrace",
          key: "xipesEmbrace",
          flavorText:
            "A shield blessed by Xipe, the Aeon of Harmony, offering unparalleled protection.",
          icon: "🛡️",
          type: "armor",
          def: 250,
          sellPrice: 22500000,
        });
      },
    },
    {
      icon: "🔮",
      name: "Nous' Insight",
      key: "nousInsight",
      price: 40000000,
      flavorText:
        "A mystical orb containing the wisdom of Nous, the Aeon of Erudition.",
      type: "miscellaneous",
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Nous' Insight",
          key: "nousInsight",
          flavorText:
            "A mystical orb containing the wisdom of Nous, the Aeon of Erudition.",
          icon: "🔮",
          type: "miscellaneous",
          sellPrice: 20000000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Tayzzyronth's Fang",
      key: "tayzzyronthsFang",
      price: 55000000,
      flavorText:
        "A dagger imbued with the cunning of Tayzzyronth, the Aeon of Propagation.",
      type: "weapon",
      atk: 180,
      def: 30,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Tayzzyronth's Fang",
          key: "tayzzyronthsFang",
          flavorText:
            "A dagger imbued with the cunning of Tayzzyronth, the Aeon of Propagation.",
          icon: "⚔️",
          type: "weapon",
          atk: 180,
          def: 30,
          sellPrice: 27500000,
        });
      },
    },
    {
      icon: "🌠",
      name: "Ix's Paradox",
      key: "ixParadox",
      price: 60000000,
      flavorText: "An enigmatic artifact representing Ix, the Aeon of Elation.",
      type: "miscellaneous",
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Ix's Paradox",
          key: "ixParadox",
          flavorText:
            "An enigmatic artifact representing Ix, the Aeon of Elation.",
          icon: "🌠",
          type: "miscellaneous",
          sellPrice: 30000000,
        });
      },
    },
    {
      icon: "🌀",
      name: "Aha's Enigma",
      key: "ahasEnigma",
      price: 70000000,
      flavorText: "A puzzling relic linked to Aha, the Aeon of The Hunt.",
      type: "miscellaneous",
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Aha's Enigma",
          key: "ahasEnigma",
          flavorText: "A puzzling relic linked to Aha, the Aeon of The Hunt.",
          icon: "🌀",
          type: "miscellaneous",
          sellPrice: 35000000,
        });
      },
    },
    {
      icon: "🌌",
      name: "Qlipoth's Bastion",
      key: "qlipothsBastion",
      price: 65000000,
      flavorText:
        "An indestructible armor piece forged in honor of Qlipoth, the Aeon of Preservation.",
      type: "armor",
      def: 300,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Qlipoth's Bastion",
          key: "qlipothsBastion",
          flavorText:
            "An indestructible armor piece forged in honor of Qlipoth, the Aeon of Preservation.",
          icon: "🌌",
          type: "armor",
          def: 300,
          sellPrice: 32500000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Yaoshi's Bloom",
      key: "yaoshiBloom",
      price: 48000000,
      flavorText:
        "A radiant staff blessed by Yaoshi, the Aeon of Abundance, promoting life and growth.",
      type: "weapon",
      atk: 160,
      def: 70,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Yaoshi's Bloom",
          key: "yaoshiBloom",
          flavorText:
            "A radiant staff blessed by Yaoshi, the Aeon of Abundance, promoting life and growth.",
          icon: "⚔️",
          type: "weapon",
          atk: 160,
          def: 70,
          sellPrice: 24000000,
        });
      },
    },
    {
      icon: "🔮",
      name: "Svarog's Directive",
      key: "svarogDirective",
      price: 52000000,
      flavorText:
        "A codex containing the commands of Svarog, the Aeon of Logic.",
      type: "miscellaneous",
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Svarog's Directive",
          key: "svarogDirective",
          flavorText:
            "A codex containing the commands of Svarog, the Aeon of Logic.",
          icon: "🔮",
          type: "miscellaneous",
          sellPrice: 26000000,
        });
      },
    },
    {
      icon: "🌌",
      name: "Lan's Radiance",
      key: "lansRadiance",
      price: 75000000,
      flavorText:
        "A luminous artifact channeling the grace of Lan, the Aeon of Permanence.",
      type: "miscellaneous",
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Lan's Radiance",
          key: "lansRadiance",
          flavorText:
            "A luminous artifact channeling the grace of Lan, the Aeon of Permanence.",
          icon: "🌌",
          type: "miscellaneous",
          sellPrice: 37500000,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Fuli's Shield",
      key: "fuliShield",
      price: 90000000,
      flavorText:
        "A celestial shield reflecting the resilience of Fuli, the Aeon of Vitality.",
      type: "armor",
      def: 400,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Fuli's Shield",
          key: "fuliShield",
          flavorText:
            "A celestial shield reflecting the resilience of Fuli, the Aeon of Vitality.",
          icon: "🛡️",
          type: "armor",
          def: 400,
          sellPrice: 45000000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Akivili's Charge",
      key: "akiviliCharge",
      price: 68000000,
      flavorText:
        "A sword blessed by Akivili, the Aeon of Trailblaze, energizing its wielder.",
      type: "weapon",
      atk: 220,
      def: 60,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Akivili's Charge",
          key: "akiviliCharge",
          flavorText:
            "A sword blessed by Akivili, the Aeon of Trailblaze, energizing its wielder.",
          icon: "⚔️",
          type: "weapon",
          atk: 220,
          def: 60,
          sellPrice: 34000000,
        });
      },
    },
    {
      icon: "🌟",
      name: "The Origin's Key",
      key: "originKey",
      price: 100000000,
      flavorText: "A relic believed to unlock the secrets of existence itself.",
      type: "miscellaneous",
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "The Origin's Key",
          key: "originKey",
          flavorText:
            "A relic believed to unlock the secrets of existence itself.",
          icon: "🌟",
          type: "miscellaneous",
          sellPrice: 50000000,
        });
      },
    },
    // Additional items can be added here for more variety.
  ],
  sellTexts: [
    "🌌 I'm afraid I don't buy artifacts from mortals.",
    "🌠 My purpose is to bestow these treasures upon the worthy.",
    "🌀 Only the bravest and wealthiest adventurers may acquire these relics.",
  ],
  talkTexts: [
    {
      name: "Tales of Aeons",
      responses: [
        "🌌 The Aeons shape the cosmos, each with their unique purpose and power.",
        "🌠 Mortals who dare to commune with Aeons often find their destinies forever altered.",
        "🌀 Seek knowledge of the Aeons, and perhaps you'll glimpse their mysteries.",
      ],
      icon: "🌠",
    },
    {
      name: "The Shop's Origin",
      responses: [
        "🌌 This shop exists beyond the boundaries of time and space.",
        "🌠 I serve as a conduit for the Aeons' blessings, connecting them to your world.",
        "🌀 Each artifact carries a fragment of an Aeon's essence. Treat them with care.",
      ],
      icon: "🌌",
    },
    {
      name: "Advice for Seekers",
      responses: [
        "🌠 Prepare your spirit before wielding an Aeon's artifact.",
        "🌌 Accumulate wealth, for these treasures demand immense sacrifice.",
        "🌀 Remember: power comes at a cost, but glory is eternal.",
      ],
      icon: "⚔️",
    },
  ],
  buyTexts: [
    "🌌 Which artifact calls to your soul?",
    "🌠 Choose wisely, for these treasures are eternal.",
    "🌀 What power do you wish to wield, seeker?",
  ],
  welcomeTexts: [
    "🌠 Welcome, chosen one, to the AeonShop.",
    "🌌 Step forward and claim your destiny.",
    "🌀 Enter, and embrace the cosmos' gifts.",
  ],
  goBackTexts: [
    "🌌 No rush, the Aeons are eternal.",
    "🌠 Reflect, and return when you're ready.",
    "🌀 The cosmos awaits your decision.",
  ],
  thankTexts: [
    "🌌 Thank you for your patronage, seeker.",
    "🌠 Wield your artifact with pride and wisdom.",
    "🌀 May the Aeons guide your journey.",
  ],
};

export async function entry({ UTShop }) {
  const shop = new UTShop(aeonShop);
  return shop.onPlay();
}

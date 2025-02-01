export const example = {
  title: "Fish Cooker",
  initSlots: 5,
  initProc: 1,
  upgrades: {
    slot: 1000000,
    proc: 5000000,
  },
  recipes: [
    {
      name: "Fried Stew",
      icon: "🍲",
      waitingTime: 5 * 60 * 1000,
      ingr: ["fish|fishSalmon|fishBass*5", "catCan"],
      result: {
        name: "Fried Stew",
        icon: "🍲",
        flavorText: "A stew crafted in Fish Cooker",
        sellPrice: 10000,
        key: "fishStew",
        type: "anypet_food",
        saturation: 30 * 60 * 1000,
      },
    },
  ],
};

export class CassFactory {}

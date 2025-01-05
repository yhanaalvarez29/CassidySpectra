import { Collectibles } from "../../plugins/ut-shop";

/**
 *
 * @param {{ input: import("input-cassidy").default, output: import("output-cassidy").default, Collectibles: typeof Collectibles }} param0
 */
export async function entry({ input, output, money, Collectibles }) {
  // YOU dont need a try catch, the system will handle it on its own.

  // Make sure 'Collectibles' is part of argument of entry

  // Get all the user data
  const userData = await money.get(input.sid);

  // create a collectible instance using the key 'collectibles'
  const collectibles = new Collectibles(userData.collectibles);

  // register the ribbon or currency to the system
  collectibles.register("ribbons", {
    key: "ribbons",
    name: "Ribbons",
    flavorText: "Idk wtf is this",
    icon: "🎀",
    type: "currency",
  });

  // check how many ribbons
  if (collectibles.getAmount("ribbons") > 8) {
    // code will work here if user has more than 8 ribbons

    // subtract 1 from ribbon count, now it has 7
    collectibles.raise("ribbons", -1);
  } else {
    collectibles.raise("ribbons", 1);
  }

  await money.set(input.sid, {
    // convert the collectibles into an array and save it to the database with key 'collectibles'
    // make sure not to mess up, or the data will be corrupted, no way of undoing
    // only do this for saving changes
    collectibles: Array.from(collectibles),
  });

  // send how many ribbons
  return output.reply(`You have ${collectibles.getAmount("ribbons")} Ribbons`);
}

export const meta = {
  name: "dice",
  otherNames: ["roll"],
  description: "Roll the dice and test your luck!",
  author: "Replit AI",
  version: "1.0.0",
  usage: "{prefix}{name} [number of dice] [sides per die]",
  category: "Fun",
  permissions: [0],
  cooldown: 5,
};

export async function entry({ input, output }) {
  const { arguments: args } = input;
  const numDice = parseInt(args[0]) || 1;
  const numSides = parseInt(args[1]) || 6;

  if (numDice <= 0 || numDice > 100) {
    return output.reply(
      "Invalid number of dice! Please choose between 1 and 100 dice."
    );
  }

  if (numSides <= 0 || numSides > 100) {
    return output.reply(
      "Invalid number of sides! Please choose between 1 and 100 sides per die."
    );
  }

  const rolls = [];

  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * numSides) + 1);
  }

  const total = rolls.reduce((acc, curr) => acc + curr, 0);

  let message = `You rolled **${numDice}** ${numSides}-sided dice:\n`;
  message += `>>> **${rolls.join(", ")}**\n`;
  message += `Total: **${total}**`;

  output.reply(message);

  if (numDice === 1 && numSides === 6) {
    // Easter egg for rolling a single 6-sided die
    const emoji =
      rolls[0] === 1
        ? "one"
        : rolls[0] === 2
        ? "two"
        : rolls[0] === 3
        ? "three"
        : rolls[0] === 4
        ? "four"
        : rolls[0] === 5
        ? "five"
        : "six";

    const imageUrl = `https://www.clker.com/cliparts/M/k/N/Z/2/p/rolling-dice-${emoji}-md.png`;

    await output.reply({
      body: message,
      attachment: [
        {
          type: "image",
          payload: { url: imageUrl },
        },
      ],
    });
  }

}
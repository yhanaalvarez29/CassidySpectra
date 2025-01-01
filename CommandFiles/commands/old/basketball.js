export const meta = {
  name: "basketball",
  description: "Take your chances with a game of basketball.",
  version: "1.0.4",
  author: "Liane Cagara",
  otherNames: ["bb"],
  usage: "{prefix}{name}",
  category: "Parang Xavia",
  permissions: [0],
  noPrefix: false,
  waitingTime: 25,
};

const outcomes = [
  "You made a three-pointer! You win $<amount>💵.",
  "Slam dunk! You win $<amount>💵.",
  "You missed the shot. You lose $<amount>💵.",
  "You scored a layup! You win $<amount>💵.",
  "Airball! You lose $<amount>💵.",
  "You hit a free throw! You win $<amount>💵.",
  "You missed the shot. You lose $<amount>💵.",
  "You missed the shot. You lose $<amount>💵.",
];

export class style {
  preset = ["cash_games.json"];
}

export async function entry({ output, money, input, styler, cancelCooldown }) {
  // get money of user so you'll know how much the user has
  const { money: userMoney } = await money.get(input.senderID);

  // make random index of outcome, check outcomes above :)
  const outcomeIndex = Math.floor(Math.random() * outcomes.length);

  // random lmao
  const bet = Math.floor(Math.random() * 100) + 1;

  // get the outcome text using the random index we made earlier
  const outcome = outcomes[outcomeIndex];
  // parse it to number because its a string
  let amount = parseInt(bet);

  // check if bet is not a number, also check if its a negative, i dont wanna see weird bugs, also check if the amount is more than the user has, just avoiding some exploits
  if (isNaN(amount) || amount <= 0 || amount > userMoney || amount < 1) {
    cancelCooldown();
    return output.reply(
      `⚠️ Invalid money amount, you should have at least $100💵 to play this game.`,
    );
  }
  // get the cashField and resultText (see CommandFiles/stylePresets/cash_games.json for details)
  const cashField = styler.getField("cashField");
  const resultText = styler.getField("resultText");

  if (outcome.includes("lose")) {
    amount = Math.min(amount, userMoney);
    // modify the field
    cashField.applyTemplate({
      cash: +amount,
    });

    resultText.changeContent("You lost:");

    await money.set(input.senderID, { money: userMoney - amount });
  } else {
    // do i even need to explain this
    cashField.applyTemplate({
      cash: +amount,
    });

    resultText.changeContent("You Won:");
    // finally, ofc set the money to the user, dont bluff em
    await money.set(input.senderID, { money: userMoney + amount });
  }

  // wtf concatenation?
  output.reply(
    `🏀 ` +
      outcome.replace("<amount>", amount) +
      ` Your new balance is $${(await money.get(input.senderID)).money}💵`,
  );
}

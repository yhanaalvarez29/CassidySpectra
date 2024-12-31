export const meta = {
  name: "russianroulette",
  description: "Take your chances with a game of Russian Roulette.",
  version: "1.1.5",
  author: "Liane Cagara",
  otherNames: ["rr"],
  usage: "{prefix}{name}",
  category: "Parang Xavia",
  permissions: [0],
  noPrefix: false,
  waitingTime: 40,
};

const outcomes = [
  "You pulled the trigger and survived! You get $<amount>💵 as a reward for your bravery.",
  "Click... You're lucky this time! You win $<amount>💵.",
  "BANG! You lose $<amount>💵 in medical bills.",
  "You survived this round. Here's $<amount>💵 as a consolation prize.",
  "Phew! The gun didn't fire. You earn $<amount>💵 for your nerves of steel.",
  "BOOM! You lose $<amount>💵 in medical bills.",
  "KABOOM! You lose $<amount>💵 in medical bills.",
];

export class style {
  preset = ["cash_games.json"];
}

export async function entry({
  output,
  money,
  input,
  styler,
  cancelCooldown,
  Inventory,
}) {
  // get money of user so you'll know how much the user has
  let {
    money: userMoney,
    inventory,
    rrWins = 0,
    rrLooses = 0,
  } = await money.get(input.senderID);
  inventory = new Inventory(inventory);
  let hasPass = inventory.has("highRollPass");

  // make random index of outcome, check outcomes above :)
  const outcomeIndex = Math.floor(Math.random() * outcomes.length);

  // get the first argument as a bet
  const [bet] = input.arguments;

  // get the outcome text using the random index we made earlier
  const outcome = outcomes[outcomeIndex];
  // parse it to number because its a string
  let amount = parseInt(bet);
  if (!hasPass && amount > 100000) {
    return output.reply(
      `You need a **HighRoll Pass** 🃏 to place bets over 100000$`,
    );
  }

  // check if bet is not a number, also check if its a negative, i dont wanna see weird bugs, also check if the amount is more than the user has, just avoiding some exploits
  if (isNaN(amount) || amount <= 0 || amount > userMoney) {
    cancelCooldown();
    return output.reply(`⚠️ Invalid bet amount.`);
  }
  // get the cashField and resultText (see CommandFiles/stylePresets/cash_games.json for details)
  const cashField = styler.getField("cashField");
  const resultText = styler.getField("resultText");
  let xText = "";

  if (outcome.includes("lose")) {
    // lol its impossible to get -1
    amount = Math.min(amount, userMoney);
    //.modify the field
    cashField.applyTemplate({
      cash: +amount,
    });
    rrLooses += amount;

    resultText.changeContent("You lost:");

    await money.set(input.senderID, {
      money: userMoney - amount,
      rrLooses,
      rrWins,
    });
  } else {
    // do i even need to explain this
    if (rrWins >= 10000000) {
      amount = 0;
      xText = `\n❌ You won nothing because the RR Guy ran out of money for reward, try playing other games like **doublerisk** and **slot**.\n`;
    }

    rrWins += amount;
    cashField.applyTemplate({
      cash: +amount,
    });

    resultText.changeContent("You Won:");
    // finally, ofc set the money to the user, dont bluff em
    await money.set(input.senderID, {
      money: userMoney + amount,
      rrWins,
      rrLooses,
    });
  }

  // wtf concatenation?
  output.reply(
    `💥 ` +
      outcome.replace("<amount>", amount) +
      xText +
      ` Your new balance is $${(await money.get(input.senderID)).money}💵`,
  );
}

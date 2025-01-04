export const meta = {
  name: "lotto",
  description: "Test your luck with the lotto game!",
  version: "1.0.0",
  author: "Liane Cagara",
  usage: "{prefix}lotto <...numbers>",
  category: "Fun",
  permissions: [0],
  noPrefix: false,
  waitingTime: 15,
  shopPrice: 50,
  requirement: "2.5.0",
  icon: "",
};
export const style = {
  title: "Lotto 🎟️",
  contentFont: "fancy",
  titleFont: "bold",
};
const fee = 100;
function hasDuplicate(args) {
  for (let i = 0; i < args.length; i++) {
    for (let j = i + 1; j < args.length; j++) {
      if (args[i] === args[j]) {
        return true;
      }
    }
  }
  return false;
}

export async function entry({ input, output, money, icon, cancelCooldown }) {
  const lottoLen = 6;
  const rangeB = 120;
  const {
    money: userMoney,
    lastLottoWin,
    lottoLooses = 0,
  } = await money.get(input.senderID);
  checkLottoWin: {
    if (isNaN(lastLottoWin)) {
      break checkLottoWin;
    }
    const interval = Date.now() - lastLottoWin;
    const timeElapsed = interval / 1000;
    if (timeElapsed < 60) {
      cancelCooldown();
      return output.reply(
        `⏳ You have already won the lottery in the last hour. Please wait for ${Math.ceil(
          60 - timeElapsed
        )} seconds before trying again.`
      );
    }
  }

  const args = input.arguments
    .map(Number)
    .filter((num) => !isNaN(num) && num > 0 && num < rangeB + 1);

  if (args.length !== lottoLen) {
    output.reply(
      `Please provide exactly ${lottoLen} valid numbers between 1 and ${rangeB}.`
    );
    cancelCooldown();
    return;
  }
  if (hasDuplicate(args)) {
    output.reply(`❌ Duplicate numbers are not allowed.`);
    cancelCooldown();
    return;
  }
  if (userMoney < fee) {
    return output.reply(`You don't have ${fee}$ to pay the lottery.`);
  }

  const lottoNumbers = Array.from(
    { length: lottoLen },
    () => Math.floor(Math.random() * rangeB) + 1
  );
  const matchedNumbers = args.filter((num) => lottoNumbers.includes(num));
  let winnings;

  let resultText;
  if (matchedNumbers.length === 0) {
    resultText = `🥲 Sorry, no matched numbers. Better luck next time! (You lost your ${fee}$ as fee)`;
  } else {
    winnings = 12500 * 2 ** matchedNumbers.length;

    // each prize
    // = winnings >> matchedNumbers.length;
    resultText = `🎉 Congratulations! You won ${winnings}$.`;
  }

  const text = `**Lotto numbers**:
${lottoNumbers.join(", ")}\n**Your numbers**:
${args.join(", ")}\n\n${resultText}`;
  output.reply(`${text}`);

  if (matchedNumbers.length > 0 && winnings) {
    await money.set(input.senderID, {
      money: userMoney + winnings,
      lastLottoWin: Date.now(),
    });
  } else {
    await money.set(input.senderID, {
      money: userMoney - fee,
      lottoLooses: lottoLooses + fee,
    });
  }
}

export const meta = {
  name: "daily",
  description: "Claim your daily reward!",
  version: "1.0.0",
  author: "Liane Cagara",
  category: "Utility",
  permissions: [0],
  noPrefix: false,
};
export const style = {
  title: "💗 Daily Reward",
  titleFont: "bold",
  contentFont: "fancy",
};
export async function entry({
  input,
  output,
  money,
  Collectibles,
  CassExpress,
}) {
  let {
    money: userMoney,
    lastDailyClaim,
    collectibles,
    cassExpress = {},
    name = "Unregistered",
  } = await money.get(input.senderID);
  cassExpress = new CassExpress(cassExpress);
  collectibles = new Collectibles(collectibles);
  collectibles.register("gems", {
    key: "gems",
    name: "Daily Gems",
    flavorText: "Gems, what do you even expect?",
    icon: "💎",
    type: "currency",
  });
  const currentTime = Date.now();
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  let canClaim = false;

  if (!lastDailyClaim) {
    canClaim = true;
  } else {
    const timeElapsed = currentTime - lastDailyClaim;
    if (timeElapsed >= oneDayInMilliseconds) {
      canClaim = true;
    } else {
      const timeRemaining = oneDayInMilliseconds - timeElapsed;
      const hoursRemaining = Math.floor(
        (timeRemaining / (1000 * 60 * 60)) % 24,
      );
      const minutesRemaining = Math.floor((timeRemaining / 1000 / 60) % 60);
      const secondsRemaining = Math.floor((timeRemaining / 1000) % 60);

      output.reply(
        `⏳ You've already claimed your daily reward. Please wait for ${hoursRemaining} hours, ${minutesRemaining} minutes, and ${secondsRemaining} seconds before claiming again.`,
      );
      return;
    }
  }
  const elapsedTime = currentTime - (lastDailyClaim || Date.now());
  const claimTimes = Math.max(
    1,
    Math.floor(elapsedTime / oneDayInMilliseconds),
  );
  const dailyReward = 100 * claimTimes;
  collectibles.raise("gems", claimTimes);

  if (canClaim) {
    cassExpress.createMail({
      title: `Daily Reward Claimed`,
      author: input.senderID,
      body: `Congratulations **${name}** for claiming your daily reward of $${dailyReward} and ${claimTimes} 💎 Gems!`,
      timeStamp: Date.now(),
    });
    await money.set(input.senderID, {
      money: userMoney + dailyReward,
      lastDailyClaim: currentTime,
      collectibles: Array.from(collectibles),
      cassExpress: cassExpress.raw(),
    });

    output.reply(
      `💰 You've claimed your daily reward of $${dailyReward} and ${claimTimes} 💎 Gems! Come back tomorrow for more.`,
    );
  }
}

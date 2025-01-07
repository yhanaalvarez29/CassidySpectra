const _6HOURS = 6 * 60 * 60 * 1000;
const _2HOURS = 2 * 60 * 60 * 1000;
const _3HOURS = 3 * 60 * 60 * 1000;
const _1HOURS = 1 * 60 * 60 * 1000;
const _30MINUTES = 30 * 60 * 1000;

const extra = {
  min: 20,
  max: 100,
  delay: [_30MINUTES, _1HOURS, _3HOURS, _2HOURS, _6HOURS],
};
export const meta = {
  name: "work",
  aliases: ["wk"],
  version: "1.0.0",
  description: "Work to earn money",
  author: "XaviaTeam | Liane (Adapted to Cassidy)",
  waitingTime: 10,
  category: "Chance Games",
};

export const style = {
  title: "Xavia Work 💼",
  titleFont: "bold",
  contentFont: "fancy",
};

const langData = {
  en_US: {
    "work.selfNoData": "Your data is not ready",
    "work.alreadyWorked":
      "You have already worked, you can work again in {time}",
    "work.successfullyWorked": "You have worked and earned {amount}XC",
    "work.failed": "Failed",
  },
  vi_VN: {
    "work.selfNoData": "Dữ liệu của bạn chưa sẵn sàng",
    "work.alreadyWorked": "Bạn đã làm việc, bạn có thể làm việc lại sau {time}",
    "work.successfullyWorked": "Bạn đã làm việc và kiếm được {amount}XC",
    "work.failed": "Thất bại",
  },
  ar_SY: {
    "work.selfNoData": "البيانات الخاصة بك ليست جاهزة",
    "work.alreadyWorked": "لقد عملت ، يمكنك العمل مرة أخرى لاحقًا {time}",
    "work.successfullyWorked": "لقد عملت وكسبت {amount}XC",
    "work.failed": "باءت بالفشل",
  },
};

/** @type {CommandEntry} */
export async function entry({ output, input, money }) {
  const { min, max, delay } = extra;
  try {
    const userData = await money.get(input.senderID);
    if (!userData) return output.reply("Your data is not ready");

    if (!userData.hasOwnProperty("work") || typeof userData.work !== "object")
      userData.work = { lastWorked: 0, delay: 0 };
    if (!userData.work.hasOwnProperty("lastWorked"))
      userData.work.lastWorked = 0;
    if (!userData.work.hasOwnProperty("delay")) userData.work.delay = 0;

    if (Date.now() - userData.work.lastWorked < userData.work.delay) {
      const remainingTimeMs =
        userData.work.delay - (Date.now() - userData.work.lastWorked);
      const remainingTimeMinutes = Math.floor(remainingTimeMs / 60000);

      return output.reply(
        `You have already worked, you can work again in ${remainingTimeMinutes} minute(s).`
      );
    }

    userData.work.lastWorked = Date.now();
    userData.work.delay = delay[Math.floor(Math.random() * delay.length)];
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;
    await money.set(input.senderID, {
      work: userData.work,
      money: userData.money + amount,
    });

    output.reply(`You have worked and earned ${amount.toLocaleString()}XC`);
  } catch (error) {
    console.error(error);
    output.error(error);
  }
}

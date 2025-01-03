export const meta = {
  name: "mtls",
  description: "Money transferring and lending service",
  version: "1.0.4",
  usage: "{prefix}{name}",
  category: "Finance",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 6,
};

export class style {
  preset = ["aesthetic.json"];
  title = {
    content_template: ["MTLS V3"],
  };
  love = {
    content_template: ["Liane"],
  };
}

export async function entry({
  money,
  input,
  output,
  icon,
  prefix,
  clearCurrStack,
  Inventory,
  getInflationRate,
}) {
  let [command, amountStr, userID] = input.arguments;
  const amount = Number(amountStr);
  const senderID = input.senderID;
  switch (command) {
    case "send":
      return handleSend({
        money,
        senderID,
        amount,
        recipientID: userID,
        output,
        Inventory,
      });

    case "lend":
      return handleLend({ money, senderID, amount, output });

    case "balance":
      return handleBalance({ money, userID: userID ?? senderID, output });

    case "retrieve":
      return handleRetrieve({ money, senderID, output, getInflationRate });

    default:
      const x = input.words[0];
      const { lendAmount = 0 } = await money.get(senderID);
      return output.reply(`${x} send <amount> <userID>
${x} lend <amount>
${x} balance <userID>
${x} retrieve

${lendAmount}$ lent.`);
  }
}

async function handleSend({
  money,
  senderID,
  amount,
  recipientID,
  output,
  Inventory,
  getInflationRate,
}) {
  const senderMoney = await money.get(senderID);
  const inventory = new Inventory(senderMoney.inventory);
  if (!inventory.has("shadowCoin")) {
    return output.reply(
      "❕ A **Shadow Coin** 🌑 is required to perform this task.",
    );
  }
  if (isNaN(amount) || amount <= 0) {
    return output.reply("❕ Invalid amount specified.");
  }
  if (senderID === recipientID) {
    return output.reply("❕ You cannot send money to yourself.");
  }
  const allData = await money.getAll();
  if (!recipientID || !allData[recipientID]) {
    return output.reply("❕ Invalid recipient specified.");
  }
  if (senderMoney.money < amount) {
    return output.reply("❕ Insufficient balance to send.");
  }
  inventory.deleteOne("shadowCoin");
  await money.set(senderID, {
    money: senderMoney.money - amount,
    inventory: Array.from(inventory),
  });
  const recipientMoney = allData[recipientID] || { money: 0, exp: 0 };
  await money.set(recipientID, { money: recipientMoney.money + amount });
  return output.reply(
    `💥 Successfully used 1 🌑 to send ${amount}$ to ${recipientMoney.name ?? "Unregistered"}.

Remaining **Shadow Coins**: ${inventory.getAmount("shadowCoin")} 🌑`,
  );
}

async function handleLend({ money, senderID, amount, output }) {
  if (isNaN(amount) || amount <= 0) {
    return output.reply("❕ Invalid amount specified.");
  }

  const lenderMoney = await money.get(senderID);
  if (lenderMoney.money < amount) {
    return output.reply("❕ Insufficient balance to lend.");
  }
  /*if (lenderMoney.lendTimestamp) {
    return output.reply(
      "💌 You already have an active lend. Retrieve it before lending again.",
    );
  }*/
  let lendAmount = amount;
  if (lenderMoney.lendAmount) {
    lendAmount = lenderMoney.lendAmount + amount;
  }
  await money.set(senderID, {
    money: lenderMoney.money - amount,
    lendTimestamp: lenderMoney.lendTimeStamp ?? Date.now(),
    lendAmount,
  });
  if (lenderMoney.lendAmount) {
    return output.reply(`💌 Successfully added ${amount} to your lend, making a total of ${lendAmount}

Your new balance is:
${lenderMoney.money - amount}
`);
  }
  return output.reply(`💌 Successfully lent ${amount}$.

Your new balance is: ${lenderMoney.money - amount}`);
}

async function handleBalance({ money, userID, output }) {
  const allData = await money.getAll();
  if (!recipientID || !allData[recipientID]) {
    return output.reply("❕ Invalid recipient specified.");
  }

  const userMoney = allData[userID];
  if (!userMoney) {
    return output.reply("❕ User not found.");
  }
  return output.reply(`💌 ${userID} has ${userMoney.money}$.`);
}

async function handleRetrieve({ money, senderID, output, getInflationRate }) {
  const lenderMoney = await money.get(senderID);
  if (!lenderMoney.lendTimestamp) {
    return output.reply("❕ No active lend to retrieve.");
  }
  const now = Date.now();
  const duration = (now - lenderMoney.lendTimestamp) / (1000 * 60 * 60 * 24);
  const durationInSeconds = (now - lenderMoney.lendTimestamp) / 1000;
  const inflationRate = await getInflationRate();

  // same logic na to as cbank HAHAHA gago
  const interestNoInflation =
    lenderMoney.lendAmount * (0.001 / 365) * durationInSeconds;
  const interest = Math.floor(
    Math.max(
      0,
      interestNoInflation - interestNoInflation * (inflationRate / 1000),
    ),
  );
  const totalAmount = lenderMoney.lendAmount + interest;

  await money.set(senderID, {
    money: lenderMoney.money + totalAmount,
    lendTimestamp: null,
    lendAmount: null,
  });
  return output.reply(`🎉 Successfully retrieved ${totalAmount.toFixed(2)}$. (+${interest}$)

Your new balance is: ${lenderMoney.money + totalAmount}`);
}

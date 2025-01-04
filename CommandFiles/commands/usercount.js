export const meta = {
  name: "usercount",
  description: "Lists the total number of users and visualizes user statistics.",
  author: "Liane Cagara",
  version: "1.0.0",
  noPrefix: "both",
  permissions: [0, 1, 2],
  waitingTime: 3,
  requirement: "2.5.0",
  icon: "",
};

export class style {
  title = "User Statistics 👥";
  titleFont = "bold";
  contentFont = "fancy";
}

const { parseCurrency: pCy } = global.utils;

export async function entry({ output, input, money }) {
  const allUsers = await money.getAll();
  const userCount = Object.keys(allUsers).length;
  const formattedUserCount = pCy(userCount);

  let maxStats = {};
  let maxUsers = {};

  for (const userID in allUsers) {
    const userData = allUsers[userID];
    for (const [key, value] of Object.entries(userData)) {
      if (typeof value === 'number') {
        if (!(key in maxStats) || value > maxStats[key]) {
          maxStats[key] = value;
          maxUsers[key] = userData.name || "Unregistered";
        }
      }
    }
  }

  let statsResult = "User with the highest stats in each category:\n\n";
  for (const [key, value] of Object.entries(maxStats)) {
    const formattedValue = pCy(value);
    statsResult += `✓ **${maxUsers[key]}** has the highest **${key}** with a value of **${formattedValue}**.\n\n`;
  }

  const result = `There are **${formattedUserCount}** users in the **Cassidy Chatbot System.**\n\n${statsResult}`;

  output.reply(result);
}
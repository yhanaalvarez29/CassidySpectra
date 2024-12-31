export const meta = {
  name: "inactive",
  description: "Lists the top 10 most inactive users.",
  author: "Liane Cagara",
  version: "1.0.0",
  noPrefix: "both",
  permissions: [0, 1, 2],
  waitingTime: 3,
};

export class style {
  title = "😴 | Most Inactive Users";
  titleFont = "bold";
  contentFont = "none";
}
const { parseCurrency: pCy } = global.utils;

export async function entry({ output, input, money, Slicer, args }) {
  const time = Date.now();
  const allUsers = await money.getAll();

  const sortedUsers = Object.keys(allUsers).sort((a, b) => {
    allUsers[a] ??= {};
    allUsers[b] ??= {};

    const {
      lastModified: lastModifiedA = Infinity,
    } = allUsers[a];

    const {
      lastModified: lastModifiedB = Infinity,
    } = allUsers[b];

    return lastModifiedA - lastModifiedB;
  });

  let i = ((isNaN(parseInt(args[0])) ? 1 : parseInt(args[0])) - 1) * 10;
  const slicer = new Slicer(sortedUsers, 10);

  let result = `Top 10 Most Inactive Users: (${Date.now() - time}ms)\n\n`;

  for (const userID of slicer.getPage(args[0])) {
    i++;

    const data = allUsers[userID];
    const {
      lastModified = 0,
    } = data;
    const lastActiveDate = new Date(lastModified).toLocaleDateString();
    result += `${i}. **${data.name}**\n🕒 Last Active: **${lastActiveDate}**\n\n`;
  }

  output.reply(result + `\n\n${input.words[0]} <page> - View a specific page.`);
}
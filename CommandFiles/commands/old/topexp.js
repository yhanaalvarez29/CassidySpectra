export const meta = {
  name: "topexp",
  description: "Check underfight top exp.",
  author: "Liane",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "Fun",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
};

export const style = {
  title: "⚔️ Underfight",
  titleFont: "bold",
  contentFont: "fancy",
};

const { CassFile, UTYBattle, randArrValue, delay, UTYPlayer, getUTY } =
  global.utils;

export async function entry({
  input,
  output,
  icon,
  commandName,
  prefix,
  money,
}) {
  let [ choice, uid, exp ] = input.arguments;
  exp = parseInt(exp);
  if (choice === "set" && uid && !isNaN(exp) && input.isAdmin) {
    await money.set(uid, { exp });
    return;
  }
  const allUsers = await money.getAll();
  const sortedUsers = Object.keys(allUsers).sort((a, b) => allUsers[b].exp - allUsers[a].exp);
  const topUsers = sortedUsers.slice(0, 10);
  const topUsersData = topUsers.map(userID => {
    const data = new UTYPlayer({ ...allUsers[userID] });
    return `* **${data.name || "Frisk"}** (${userID})
    𝗟𝗩 **${data.lv}**
    𝗘𝗫𝗣 **${data.exp}**/**${data.getRemainExp() + data.exp}**
    𝗛𝗣 **${data.hp}**/**${data.hp}**`;
  }).join("\n\n");
  output.reply(topUsersData);
}

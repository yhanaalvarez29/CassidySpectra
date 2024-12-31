export const meta = {
  name: "finduser",
  description: "Search for users by name",
  version: "1.0.3",
  usage: "{prefix}finduser <query>",
  category: "Utility",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: false,
  waitingTime: 0,
  shopPrice: null,
};

export async function entry({ input, output, money, icon }) {
  const query = input.arguments.join(" ").trim().toLowerCase();
  output.prepend = icon + "\n";

  if (!query) {
    output.reply(`Please provide a query to search for users.`);
    return;
  }

  try {
    const allUsers = await money.getAll();

    let matchedUsers = [];

    for (const userId in allUsers) {
      const userData = allUsers[userId];
      userData.name ??= "Chara";
      userData.userID = userId;

      if (userData.name.toLowerCase().includes(query)) {
        matchedUsers.push(userData);
      }
    }

    let response = `🔍 Search results for "${query}":\n\n`;

    if (matchedUsers.length > 0) {
      matchedUsers.forEach((userData, index) => {
        response += `${index < 10 ? `0` + (index + 1) : index + 1}. **${userData.name}**\n💌 UID: ${userData.userID}\n`;
        response += `💰 Balance: $${userData.money}💵\n\n`;
      });
    } else {
      response += `No users found matching "${query}".`;
    }

    output.reply(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    output.error(error);
  }
}

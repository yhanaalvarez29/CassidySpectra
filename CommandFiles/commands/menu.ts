// @ts-check
import {
  extractCommandRole,
  toTitleCase,
  UNISpectra,
} from "@cassidy/unispectra";
import { ShopClass } from "@cass-plugins/shopV2";

export const meta: CassidySpectra.CommandMeta = {
  name: "menu",
  author: "Liane Cagara",
  description:
    "Acts as a central hub, like a Start Menu, providing users with an overview of available commands, their functionalities, and access to specific command details. Helps users quickly navigate the bot's features.",
  version: "3.0.0",
  usage: "{prefix}{name} [commandName]",
  category: "System",
  permissions: [0],
  requirement: "3.0.0",
  icon: "🧰",
  otherNames: ["start", "help"],
};

export const style = {
  title: Cassidy.logo,
  titleFont: "none",
  contentFont: "fancy",
};

export async function entry({
  input,
  output,
  prefix,
  commandName,
  commandName: cmdn,
  money,
  multiCommands,
  InputRoles,
}: CommandContext) {
  // const commands = removeCommandAliases(ogc);
  const commands = multiCommands.toUnique((i) => i.meta?.name);

  const args = input.arguments;
  const { logo: icon } = global.Cassidy;
  const { shopInv, money: userMoney } = await money.queryItem(
    input.senderID,
    "shopInv",
    "money"
  );
  const shop = new ShopClass(shopInv);

  if (args.length > 0 && isNaN(parseInt(args[0]))) {
    const commandName = args[0];
    const commandsFound = multiCommands
      .getMap(commandName)
      .toUnique((i) => i.meta.name)
      .values();
    let str = [];

    if (commandsFound.length > 0) {
      for (const command of commandsFound) {
        const {
          name,
          description,
          otherNames = [],
          usage,
          category = "None",
          waitingTime = 5,
          author = "Unknown",
          shopPrice = 0,
          icon: cmdIcon = "📄",
          version = "N/A",
          requirement = "N/A",
        } = command.meta;
        const status = shop.isUnlocked(name)
          ? "✅ Unlocked"
          : shop.canPurchase(name, userMoney)
          ? "💰 Buyable"
          : "🔒 Locked";
        let role = await extractCommandRole(command, true, input.tid);

        if (commandsFound.length !== 1) {
          str.push(`
╭─── ${cmdIcon} **${toTitleCase(name)}** ───
│   📜 **Name**:
│   ${UNISpectra.charm} ${name}
│ 
│   💬 **Description**: 
│   ${UNISpectra.charm} ${description}
│ 
│   📝 **Aliases**: 
│   ${UNISpectra.charm} ${otherNames.length ? otherNames.join(", ") : "None"}
│   
│   🔎 See **${prefix}${cmdn} ${name}** for more info.
╰────────────────`);
        } else {
          str.push(`
╭─── ${cmdIcon} **${toTitleCase(name)}** ───
│   📜 **Name**:
│   ${UNISpectra.charm} ${name}
│ 
│   💬 **Description**: 
│   ${UNISpectra.charm} ${description}
│ 
│   📝 **Aliases**: 
│   ${UNISpectra.charm} ${otherNames.length ? otherNames.join(", ") : "None"}
│ 
│   🛠️ **Usage**:
│   ${UNISpectra.charm} ${usage
            .replace(/{prefix}/g, prefix)
            .replace(/{name}/g, name)}
│ 
│   📁 **Category**:
│   ${UNISpectra.charm} ${category}
│ 
│   🔐 **Permissions**:
│   ${UNISpectra.charm} ${typeof role === "number" ? role : "None required"}
│ 
│   ⏳ **Cooldown**:
│   ${UNISpectra.charm} ${waitingTime} 
│ 
│   ✍️ **Author**: 
│   ${UNISpectra.charm} ${author}
│ 
│   💸 **Price**:
│   ${UNISpectra.charm} ${shopPrice ? `$${shopPrice} ${status}` : "⚡ Free"}
│ 
│   🖼️ **Icon**:
│   ${UNISpectra.charm} ${cmdIcon}
│ 
│   📌 **Version**:
│   ${UNISpectra.charm} ${version}
│ 
│   🛡️ **Requirement**:
│   ${UNISpectra.charm} ${requirement}
╰────────────────`);
        }
      }
      return output.replyStyled(str.join("\n\n"), {
        title: Cassidy.logo,
        contentFont: "fancy",
      });
    } else {
      output.reply(
        `${icon}\n\n❌ Oops! **${commandName}** isn't a valid command. Try another!`
      );
    }
    return;
  }

  const categorizedCommands: Record<string, CassidySpectra.CassidyCommand[]> =
    commands.values().reduce((categories, command) => {
      const category = command.meta.category || "Miscellaneous";
      if (!categories[category]) categories[category] = [];
      categories[category].push(command);
      return categories;
    }, {});
  const dontPrio: CassidySpectra.CommandTypes[] = ["arl_g", "cplx_g"];

  // const sortedCategories = Object.keys(categorizedCommands).sort((a, b) => {
  //   const aContainsGame = a.toLowerCase().includes("game");
  //   const bContainsGame = b.toLowerCase().includes("game");

  //   const aCommands = categorizedCommands[a];
  //   const bCommands = categorizedCommands[b];

  //   if (aContainsGame && bContainsGame) {
  //     return a.localeCompare(b);
  //   }

  //   if (aContainsGame) {
  //     return -1;
  //   }
  //   if (bContainsGame) {
  //     return 1;
  //   }

  //   return a.localeCompare(b);
  // });

  const getSumPrioIndex = (commands: CassidySpectra.CassidyCommand[]) => {
    if (!commands.length) return 0;

    return commands.reduce((sum, cmd) => {
      const idx = dontPrio.indexOf(cmd.meta.cmdType) * 5;
      return sum + (idx === -1 ? 0 : idx);
    }, 0);
  };

  const sortedCategories = Object.keys(categorizedCommands).sort((a, b) => {
    const aCommands = categorizedCommands[a];
    const bCommands = categorizedCommands[b];

    const aPrio = getSumPrioIndex(aCommands);
    const bPrio = getSumPrioIndex(bCommands);

    if (aPrio !== bPrio) {
      return aPrio - bPrio;
    }

    return a.localeCompare(b);
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  let currentPage = parseInt(args[0]) || 1;

  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  const pageCategories = sortedCategories.slice(startIndex, endIndex);

  let result = `**Page ${currentPage} of ${totalPages}** 📄\n`;
  let preff = "│ ";

  for (const category of pageCategories) {
    result += `\n╭─────────────❍\n${preff} ${UNISpectra.arrow} ***${category}*** 📁\n${preff}\n`;
    for (const command of categorizedCommands[category]) {
      const { name, icon, shopPrice = 0 } = command.meta;
      const role = await extractCommandRole(command);
      const statusIcon =
        role === InputRoles.ADMINBOX && !input.hasRole(role)
          ? "📦"
          : InputRoles.MODERATORBOT && !input.hasRole(role)
          ? "🛡️"
          : role === InputRoles.ADMINBOT && !input.hasRole(role)
          ? "👑"
          : shop.isUnlocked(name)
          ? icon || "📄"
          : shop.canPurchase(name, userMoney)
          ? "🔐"
          : "🔒";

      let isAllowed =
        (!shopPrice || shop.isUnlocked(name)) && input.hasRole(role);
      result += `${preff}  ${statusIcon} ${prefix}${
        isAllowed ? `**${toTitleCase(name)}**` : `${toTitleCase(name)}`
      }${
        shopPrice
          ? ` - $${shopPrice} ${
              shop.isUnlocked(name)
                ? "✅"
                : shop.canPurchase(name, userMoney)
                ? "💰"
                : "❌"
            }`
          : ""
      }\n`;
    }
    result += `╰─────────────❍\n`;
  }
  result = result.trim();

  result += `\n\n${UNISpectra.arrow} ***Explore*** more commands!\n`;
  result += `${UNISpectra.arrow} View another page: **${prefix}${commandName} <page>**\n`;
  result += `${UNISpectra.arrow} Next page: **${prefix}${commandName} ${
    currentPage + 1
  }**\n`;
  result += `${UNISpectra.arrow} Command details: **${prefix}${commandName} <command>**\n`;

  return output.reply(
    `🔍 | **Available Commands** 🧰\n\n${result}${UNISpectra.charm} Developed by @**Liane Cagara** 🎀`
  );
}

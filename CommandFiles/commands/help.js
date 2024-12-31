export const meta = {
  name: "help",
  author: "Liane Cagara",
  description: "Display information about available commands",
  version: "1.2.7",
  usage: "{prefix}{name} [commandName]",
  category: "System",
  permissions: [0],
  noPrefix: "both",
};

export async function entry({ input, output, commands, prefix, threadConfig, Slicer }) {
  const args = input.arguments;
  const { logo: icon } = global.Cassidy;
  if (args.length > 0 && isNaN(parseInt(args[0]))) {
    const commandName = args[0];
    const command = commands[commandName];

    if (command) {
      let {
        name,
        author,
        description,
        otherNames,
        usage,
        category,
        permissions,
        waitingTime,
      } = command.meta;
      output.reply(
        `╭─────────────❍
│  𝗖𝗼𝗺𝗺𝗮𝗻𝗱: ${name}
│  𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${description}
│  𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${otherNames?.join ? otherNames.join(", ") : "None"}
│  𝗨𝘀𝗮𝗴𝗲: ${usage?.replace(/{prefix}/g, prefix)?.replace(/{name}/g, name)}
│  𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${category || "No category"}
│  𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻𝘀: ${permissions.join ? permissions.join(", ") : "No permissions required"}
│  𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${waitingTime || 5} seconds
│  𝗔𝘂𝘁𝗵𝗼𝗿: ${author || "No author"}
├────────⬤
│  𝗖𝗮𝘀𝘀𝗶𝗱𝘆 𝖠𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝖼𝖾  v${global.package.version}
╰─────────────❍`,
      );
    } else {
      output.reply(
        `${icon}\n\n❌ The command "${commandName}" does not exist in the help list.`,
      );
    }
  } else {
    const { sortHelp } = await threadConfig.getInfo(input.threadID);
    if (sortHelp === "category") {
      let num = 0;
      let categories = {};
      let names = [];
      for (const commandName in commands) {
        const { meta } = commands[commandName];
        /*if (
          !meta.permissions?.includes(0) &&
          !meta.permissions?.includes(1) &&
          !input._isAdmin(input.senderID)
        ) {
          continue;
        }*/
        if (names.includes(meta.name)) {
          continue;
        }
        meta.category ??= "No Category";
        if (!categories[meta.category]) {
          categories[meta.category] = [];
        }
        categories[meta.category].push(meta);
        names.push(meta.name);
      }
      const s = Object.keys(categories).sort();
      const sorted = {};
      for (const category of s) {
        sorted[category] = categories[category];
      }
      const helpList = Object.keys(sorted).map((category) => {
        const commands = sorted[category].map((command) => {
          const { name, description } = command;
          num++;
          return `│〖 **${name}** 〗: ${description || ""}`;
        });
        return `╭──❍ 「 **${category}** 」\n${commands.join("\n")}\n╰─────────────❍`;
      });
      output.reply(`${helpList.join("\n\n")}

╭─────────────❍
│  𝗖𝗮𝘀𝘀𝗶𝗱𝘆 𝖠𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝖼𝖾  v${global.package.version}
╰─────────────❍
「 Page 1/1 」
 » Cassidy currently have ${num} commands.
 » Developed by @𝗟𝗶𝗮𝗻𝗲 𝗖𝗮𝗴𝗮𝗿𝗮 🎀`);
    } else {
      const pageNum = parseInt(args[0]);
      let names = [];
      const allKeys = Object.keys(commands).filter(i => {
        const command = commands[i];
        if (names.includes(command.meta.name)) {
          return false;
        }
        names.push(command.meta.name);
        return true;
      }).sort();
      const slicer = new Slicer(allKeys, 10);
      let commandList = "";
      const current = slicer.getPage(pageNum);
      current.forEach((commandName) => {
        const num = allKeys.findIndex(i => i === commandName) + 1;
        const command = commands[commandName];
        /*if (
          !command.meta.permissions?.includes(0) &&
          !command.meta.permissions?.includes(1) &&
          !input._isAdmin(input.senderID)
        ) {
          return;
        }*/
        
        commandList += `│〘 ${num < 10 ? `0${num}` : num} 〙**${prefix}${command.meta.name}** 》 ${command.meta.description || ""}\n`;
      });
      output.reply(`${icon}
╭─────────────❍
${commandList.trim()}
├────────⬤
│  𝗖𝗮𝘀𝘀𝗶𝗱𝘆 𝖠𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝖼𝖾  v${global.package.version}
╰─────────────❍
「 Page ${Slicer.parseNum(pageNum)}/${slicer.pagesLength + 1} 」
 » Cassidy currently have ${allKeys.length} commands.
 » Developed by @𝗟𝗶𝗮𝗻𝗲 𝗖𝗮𝗴𝗮𝗿𝗮 🎀`);
    }
  }
}
/*
╭─────────────☆
${commandList}
╰─────────────☆

*/
/*

╭─────────────⭓
│〘 01 〙.slot 》 Betting
│〘 02 〙.daily 》 Reward
│〘 03 〙.rps 》 Game
│〘 04 〙.quiz 》 Question
│〘 05 〙.wordgame 》 Unscramble
│〘 06 〙.bal 》Money
│〘 07 〙.bringme 》 Emojifind
│〘 08 〙.shop 》 Shop
│〘 09 〙.underchat 》 RPG
│〘 10 〙.potatofarm 》 Farm
│〘 11 〙.casstale 》 RPG
│
├────────⭔
│  𝗖𝗮𝘀𝘀𝗶𝗱𝘆 𝖠𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝖼𝖾  v1.2.2
╰─────────────⭓
[Page 1/1]
 » Cassidy currently have 11 money-related commands.
Estimated waiting time for every commands: 30s
 » This is not an automated service, everything was done manually.

- 同仝

🔬 𝗖𝗮𝘀𝘀𝗶𝗱𝘆 𝖠𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝖼𝖾 

𝖲𝗅𝗈𝗍 𝖱𝖾𝗌𝗎𝗅𝗍 | •~•

{ 🍊 , 🍓 , 🍇 }

𝗬𝗼𝘂 𝘄𝗼𝗻: 0$
𝗬𝗼𝘂 𝗹𝗼𝘀𝘁: 5000$
*/

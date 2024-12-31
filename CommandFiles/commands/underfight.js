export const meta = {
  name: "underfight",
  description: "Simple Undertale-based rpg",
  author: "Liane",
  version: "1.0.1",
  usage: "{prefix}{name}",
  category: "Fun",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
};

const choices = `⚔️ 𝗙𝗶𝗴𝗵𝘁\n🔊 𝗔𝗰𝘁\n🔥 𝗠𝗮𝗴𝗶𝗰\n❌ 𝗠𝗲𝗿𝗰𝘆\n🛡️ 𝗗𝗲𝗳𝗲𝗻𝗱`;

export const style = {
  title: "⚔️ Underfight",
  titleFont: "bold",
  contentFont: "fancy",
};

const { CassFile, UTYBattle, randArrValue, delay, UTYPlayer, getUTY } =
  global.utils;

export async function entry({
  input,
  output: { ...output },
  icon,
  commandName,
  prefix,
  money,
  recall,
}) {
  output.reply = (...args) =>
    output.replyStyled(args[0], style, ...args.slice(1));

  //const file = CassFile.quickRead("handlers/database/uty.json");
  //const allData = JSON.parse(file);
  const { ADMINBOT } = global.Cassidy.config;
  const {
    exp = 0,
    money: gold = 0,
    kills = 0,
    spares = 0,
    progress = {},
    name = null,
  } = await money.get(input.senderID);
  if (!name) {
    const i = await output.reply(
      `❌ | Your name does not exist!\nPlease reply the name you want to use, this name cannot be changed forever.`,
    );
    input.setReply(i.messageID, {
      key: commandName,
      nameConfig: true,
      author: input.senderID,
    });
    return;
  }
  const player = new UTYPlayer({ exp, gold, kills, spares, progress, name });
  const allData = getUTY(player);
  const defaultHP = player.hp;
  if (!input.arguments[0]) {
    return output.reply(`* Welcome to underfight! You can use the following choices of enemy:

${Object.keys(allData)
  .map(
    (enemy) => `* ${enemy}:
  Name: ${allData[enemy].NAME}
  Gold: ${allData[enemy].GOLD * 100}
  Exp: ${allData[enemy].EXP}
  `,
  )
  .join("\n")}

Guide: ${input.text.split(" ")[0]} < ID >

𝙔𝙤𝙪𝙧 𝙎𝙩𝙖𝙩𝙨:

𝗚𝗢𝗟𝗗: ${player.gold}
𝗘𝗫𝗣: ${player.exp}
𝗡𝗘𝗫𝗧: ${player.getRemainExp()}
𝗟𝗩: ${player.lv}
${player.kills ? `𝗞𝗜𝗟𝗟𝗦: ${player.kills}\n` : ""}𝗔𝗧: ${player.dmg}
𝗗𝗙: ${player.getDF()}
𝗛𝗣: ${player.hp}`);
  }
  const currentData =
    allData[
      input.arguments[0] == "random"
        ? randArrValue(Object.keys(allData))
        : input.arguments[0]
    ];
  let dmg = player.dmg;
  if (
    !isNaN(parseInt(input.arguments[1])) &&
    ADMINBOT.includes(input.senderID)
  ) {
    dmg = parseInt(input.arguments[1]);
  }
  const { senderID } = input;
  const battle = new UTYBattle(currentData, player);
  let myHP = defaultHP;
  const text = player.yellowing(`* ${battle.getEncounter()}

**${player.name?.toUpperCase()}** 𝗟𝗩 ${player.lv}
𝗛𝗣 ${myHP}/${defaultHP}
𝙏𝙋 [ ${player.TP >= 100 ? "MAX" : player.TP}% ]

${choices}

Reply with the choice.`);
  const info = await output.reply(text);
  input.setReply(info.messageID, {
    key: commandName,
    senderID,
    battle,
    myHP,
    money,
    dmg,
    player,
    recall,
  });
}

export async function reply(context) {
  try {
    const {
      input,
      output,
      repObj,
      detectID,
      commandName,
      prefix,
      commands,
      ...runObj
    } = context;
    function retry() {
      repObj.recall();
    }
    await delay(500);
    const { ADMINBOT } = global.Cassidy.config;
    if (repObj.nameConfig) {
      const [choice] = input.text?.toLowerCase().split();
      if (input.senderID !== repObj.author) {
        return output.reply("❌ | You cannot change your name!");
      }
      if (repObj.confirm && repObj.nameOk && choice === "proceed") {
        await runObj.money.set(input.senderID, {
          name: repObj.name,
        });
        output.reply(`✅ | Success! You may now go back to playing.`);
        input.delReply(detectID);

        return;
      }
      if (repObj.confirm && choice === "back") {
        const i = await output.reply(
          `✅ | Choose your name again, please reply your name!`,
        );
        input.delReply(detectID);

        input.setReply(i.messageID, {
          key: commandName,
          author: repObj.author,
          nameConfig: true,
        });
        return;
      }
      if (repObj.confirm && choice !== "back") {
        return;
      }
      try {
        const names = {
          chara: "The true name.",
          frisk: "This name will trigger hardmode, proceed anyway?",
          sans: "You cannot use this name.",
          papyrus: "Are you kidding me? You cannot use this name.",
          alphys: "Can you atleast find your original name",
          undyne: "Very original.",
          toriel: "You are not goat mom!",
          asgore: "You are not goat dad!",
          martlet: "You are not a royal guard.",
          clover: "AMERICA! AMERICA!",
          ceroba: "You are not a fox.",
          liane: "Nice try.",
          nea: "Queen Nean is tired of licensing her name.",
          nean: "It's nea, but worse",
          kaye: "Just.. don't use this name",
          asriel: "You are nor goat prince.",
          starlo: "No america for you.",
          flowey: "Stfu.",
          sand: "I will let this one slide",
          papyru: "It doesn't have s, so proceed anyway.",
          muffet: "No no no spiders for now",
          mettaton: "I'm not a robot.",
          mtt: "No way, he used MTT, mettaton will gonna be mad.",
          axis: "Sorry human but you don't [freaking] deserve this name.",
          chujin: "Steamworks..",
          kanako: "Okay nevermind.",
          get gaster() {
            const err = {};
            err.stack = "system:sound_test";
            err.name = "Uknown";
            err.message =
              "Unknown issue. Beware of the man who speaks in hands.";
            throw err;
          },
        };
        const [name = "Frisk"] = input.text?.split();
        const allowed = ["chara", "frisk", "clover", "sand", "papyru"];
        if (!names[name.toLowerCase()]) {
          allowed.push(name.toLowerCase());
        }
        const nameOk = allowed.includes(name.toLowerCase());
        const i =
          await output.reply(`* ${names[name] || names[name.toLowerCase()] || "Is the name correct?"}

**${name.split("").join(" ")}**

* Back
${nameOk ? "* Proceed" : ""}`);
        input.setReply(i.messageID, {
          author: repObj.author,
          key: commandName,
          nameConfig: true,
          nameOk,
          confirm: true,
          name,
        });
        input.delReply(detectID);

        return;
      } catch (error) {
        return output.error(error);
      }
    }
    let {
      senderID,
      battle,
      myHP,
      money,
      lastOpt = "",
      lastAt = null,
      dmg = 9,
      player,
    } = repObj;
    const defaultHP = player.hp;
    async function winGold(a) {
      const {
        money: m,
        exp,
        kills = 0,
        spares = 0,
      } = await money.get(input.senderID);
      const { GOLD, EXP } = battle.monster;
      await money.set(input.senderID, {
        money: m + GOLD,
        exp: exp + (a ? EXP : 0),
        kills: kills + (a ? 1 : 0),
        spares: spares + (a ? 0 : 1),
      });
    }
    let [choice, arg2] = input.body?.split(" ");
    if (battle.isOver) {
      input.delReply(detectID);
      return;
    }
    if (input.senderID !== senderID) {
      return;
    }
    if (lastAt && lastOpt === "done") {
      return await handleDone();
    }
    if (
      (lastOpt === "act" || lastOpt === "mercy" || lastOpt === "magic") &&
      choice?.toLowerCase() == "back"
    ) {
      return await handleBack();
    }
    if (lastOpt === "mercy") {
      return await handleSpare();
    }
    if (lastOpt === "magic") {
      return await handleMagicOpt();
    }
    if (lastOpt === "act" || (choice?.toLowerCase() == "act" && arg2)) {
      choice = arg2 || choice;
      return await handleActChoice();
    }
    switch (choice?.toLowerCase()) {
      case "fight":
        await handleFight();
        break;
      case "act":
        await handleAct();
        break;
      case "mercy":
        await handleMercy();
        break;
      case "pacify":
        if (ADMINBOT.includes(input.senderID)) {
          battle.isWinningActSatisfied = true;
        }
        break;
      case "defend":
        await handleDefend();
        break;
      case "magic":
        await handleMagic();
        break;
    }
    async function handleMagic(nTp) {
      const i = await output.reply(`${nTp ? "* Invalid Choice.\n\n" : ""}𝙏𝙋 [ ${
        player.TP >= 100 ? "MAX" : player.TP
      }% ]

${player.getMagicList()}

* Back`);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "magic",
        dmg,
        player,
      });
    }
    async function handleMagicOpt() {
      const magic = player.getMagic(choice);
      if (!magic || !player.isMagicTP(choice)) {
        input.delReply(detectID);

        return await handleMagic(true);
      }
      player.TP -= magic.tp;
      const { tp, flavor, name, index, heal = 0 } = magic;
      myHP += heal;
      myHP = myHP > defaultHP ? defaultHP : myHP;
      let text = `* ${flavor}`;
      if (typeof index === "function" && !flavor) {
        text = await index(player, battle);
      }
      if (name == "Pacify" && battle.isPacify) {
        battle.isOver = true;
        winGold();
        return output.reply(text);
      }
      const d = getAttackData();
      const lastAt = d;

      text += `

🗨️ ${battle.getName()}: 
${battle.getQuote()}

${attackStr(d)}`;
      input.delReply(detectID);
      const i = await output.reply(text);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "done",
        lastAt,
        dmg,
        player,
      });
    }
    async function handleFight() {
      const damage = battle.attackThis(dmg);
      player.TP += 8;
      if (battle.isDead()) {
        input.delReply(detectID);
        winGold(true);
        const { lv: newLV } = new UTYPlayer({
          exp: player.exp + battle.monster.EXP,
        });
        const { lv: oldLV } = player;
        return output.reply(`* You attacked ${battle.getName()}, ${
          damage > battle.getMaxHP() ? "fatally " : ""
        }causing ${damage} damage. ${battle.getName()} died and turned into dust.
${damage > battle.getMaxHP() ? "YOU ARE A BRUTAL MURDERER! : )" : ""}

${battle.isDead()}

${newLV > oldLV ? `Your 𝗟𝗢𝗩𝗘 increased!\n\nLV ${newLV}` : ""}`);
      }
      const d = getAttackData();
      const lastAt = d;
      input.delReply(detectID);
      const i = await output.reply(`${
        damage > 0
          ? `* You attacked ${battle.getName()}, causing ${damage} damage. her Hp is now ${battle.getHP()}/${battle.getMaxHP()}`
          : `* 𝗠 𝗜 𝗦 𝗦\n* ${battle.getName()} dodged your attack.`
      }

🗨️ ${battle.getName()}: 
${battle.getFightQuote()}

${attackStr(d)}`);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "done",
        lastAt,
        dmg,
        player,
      });
    }
    async function handleSpare() {
      if (
        (choice?.toLowerCase() !== "spare" &&
          choice?.toLowerCase() !== "flee") ||
        (choice?.toLowerCase() == "flee" && !battle.hasFlee())
      ) {
        const i = await output.reply(`Invalid Choice!

${battle.getMercyList().trim()}
* Back`);
        input.setReply(i.messageID, {
          key: commandName,
          senderID,
          battle,
          myHP,
          money,
          lastOpt: "mercy",
          dmg,
          player,
        });
        return;
      }
      if (choice?.toLowerCase() == "flee") {
        input.delReply(detectID);
        battle.isOver = true;
        return output.reply(`* You fled from ${battle.getName()}.

* You won nothing.`);
      }
      const result = battle.spare(dmg);
      if (result) {
        input.delReply(detectID);
        winGold();
        return output.reply(`* You spared ${battle.getName()}

${result}`);
      }
      const d = getAttackData();
      const lastAt = d;
      input.delReply(detectID);
      const i =
        await output.reply(`* You spared ${battle.getName()}, but their name isn't 𝗬𝗘𝗟𝗟𝗢𝗪!

🗨️ ${battle.getName()}: 
${battle.getQuote()}

${attackStr(d)}`);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "done",
        lastAt,
        dmg,
        player,
      });
    }
    async function handleDefend() {
      const d = getAttackData();
      const lastAt = d;
      input.delReply(detectID);
      /*myHP += parseInt(defaultHP * 0.25);
    if (myHP > defaultHP) {
      myHP = defaultHP;
    }
    */
      player.TP += 16;

      const i =
        await output.reply(`* You defended yourself, gained DEFENSE temporarily!

🗨️ ${battle.getName()}: 
${battle.getQuote()}

${attackStr(d)}`);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "done",
        lastAt,
        dmg,
        isDefended: true,
        player,
      });
    }
    async function handleMercy() {
      const text = battle.getMercyList();
      const i = await output.reply(text + `\n\n* Back`);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "mercy",
        dmg,
        player,
      });
    }
    async function handleAct() {
      const i = await output.reply(battle.getActList().trim() + `\n* Back`);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "act",
        dmg,
        player,
      });
    }
    async function handleActChoice() {
      if (!battle.getActs().includes(choice)) {
        const i = await output.reply(`* "${choice}" is not a valid choice.

${battle.getActList()}
* Back`);
        input.setReply(i.messageID, {
          key: commandName,
          senderID,
          battle,
          myHP,
          money,
          lastOpt: "act",
          dmg,
          player,
        });
        return;
      }
      const { flavorText, quote, afterAct, effect, isWin } = battle.act(choice);
      input.delReply(detectID);
      const d = getAttackData(battle.isWinningActSatisfied);
      const lastAt = d;
      if (effect.playerAtk) {
        dmg = dmg + effect.playerAtk;
      }
      const i = await output.reply(`* ${flavorText}

🗨️ ${battle.getName()}:
${quote}

${attackStr(d)}`);
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        lastOpt: "done",
        lastAt,
        afterAct,
        dmg,
        player,
      });
    }
    function getAttackData(isWin) {
      const { attack, direction, attacks } = battle.getRandomAttack(isWin);
      return { attack, direction, attacks, isWin };
    }
    function yourHP() {
      return `**${player.name?.toUpperCase()}** 𝗟𝗩 ${player.lv}
𝗛𝗣 ${myHP}/${defaultHP}
𝙏𝙋 [ ${player.TP >= 100 ? "MAX" : player.TP}% ]`;
    }
    function attackStr(data) {
      if (!data.attack || !data.attacks || !data.direction) {
        return `* ${battle.getName()} is not attacking.

${yourHP()}

Reply anything to proceed.`;
      }
      return `* ${battle.getName()} is charging "${data.attack?.trim()}" attack!

${yourHP()}

Choose:

${[...new Set(data.attacks)].join("\n")}

Reply with the choice.`;
    }
    async function handleBack() {
      input.delReply(detectID);
      let resultText = "";
      resultText += `* ${battle.getFlavor()}

${yourHP()}

${
  battle.isYellow()
    ? choices.replace("❌", "💗")
    : battle.isPacify
      ? choices.replace("🔥", "💤")
      : choices
}

Reply with the choice.`;
      const i = await output.reply(player.yellowing(resultText));
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        dmg,
        player,
      });
    }
    async function handleDone() {
      let resultText = "";
      const { attack, direction, attacks } = lastAt;
      const { afterAct = null, isDefended = false } = repObj;
      input.delReply(detectID);
      //const damage = isDefended? parseInt(battle.getAT() / 2): battle.getAT();
      const defend = player.defend(battle.getAT());
      let damage = isDefended ? defend.damage : player.calcDmg(battle.getAT());
      if (damage < 1) {
        damage++;
      }
      player.TP += 4;
      if (!attack || !attacks || !direction) {
        resultText = `* Nothing happened as ${battle.getName()} is not attacking.`;
      } else if (choice?.toLowerCase() !== direction?.toLowerCase()) {
        resultText = `* You chose "${choice}" and ${battle.getName()}'s attack ended up hitting you, causing ${damage} damage. ${
          isDefended
            ? `Successfully blocked ${Math.floor(
                (defend.diff / defend.calc) * 100,
              )}% of the attack!`
            : ""
        }`;
        myHP -= damage;
        if (myHP <= 0) {
          //resultText += `\n\n* You died!`;
          resultText = `𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥

${player.isClover ? `* Clover! Don't let that stupid monster kill you! hee.. hee..` : `* Stay determined ${player.name}!`}

${player.heart} Retry`;
          input.delReply(detectID);
          battle.isOver = true;
          return output.waitForReply(
            player.yellowing(resultText),
            async ({ input2 }) => {
              if (input2.body?.toLowerCase() === "retry") {
                resolve(retry());
              }
            },
          );
        }
      } else {
        resultText = `* You chose "${choice}" and you successfully dodged ${battle.getName()}'s attack!`;
      }
      resultText += `

* ${afterAct || battle.getFlavor()}

${yourHP()}

${
  battle.isYellow()
    ? choices.replace("❌", "💗")
    : battle.isPacify
      ? choices.replace("🔥", "💤")
      : choices
}

Reply with the choice.`;
      const i = await output.reply(player.yellowing(resultText));
      input.setReply(i.messageID, {
        key: commandName,
        senderID,
        battle,
        myHP,
        money,
        dmg,
        player,
      });
    }
  } catch (err) {
    console.log(err);
    output.reply(err.toString());
  }
}

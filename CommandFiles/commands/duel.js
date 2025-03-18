export const meta = {
  name: "duel",
  description: "Challenge another player to a pet duel!",
  author: "Liane Cagara",
  version: "1.0.0",
  usage: "{prefix}duel <pet name>",
  category: "Spinoff Games",
  permissions: [0],
  noPrefix: false,
  waitingTime: 1,
  otherNames: [],
  requirement: "2.5.0",
  icon: "⚔️",
};

export const style = {
  title: "Pet Duel ⚔️",
  titleFont: "bold",
  contentFont: "fancy",
};

const activeChallenges = new Map();

export async function entry(ctx) {
  const { args, input, output, money, Inventory } = ctx;
  const challengePetName = args[0];
  let bet = parseInt(args[1]);

  if (!challengePetName || isNaN(bet) || bet <= 0) {
    return output.reply(
      `⚠️ | Please specify a pet name and bet to challenge.\n**Example**: ${ctx.prefix}duel <pet-name> <bet>\n\n**Other Modifiers:**\n--fair\n--self-only`,
    );
  }

  const price = 1000;

  if (bet > 1000000) {
    return output.reply("⚠️ | Max bet is 1000000.");
  }

  const challengerData = await money.get(input.senderID);
  if (challengerData.money < bet) {
    return output.reply(`⚠️ | You don't have enough money to place this bet.`);
  }
  const challengerPets = new Inventory(challengerData.petsData);
  const challengePet = challengerPets
    .getAll()
    .find((pet) => pet.name.toLowerCase() === challengePetName.toLowerCase());

  if (!challengePet) {
    return output.reply("⚠️ | Pet not found in your pet list.");
  }

  activeChallenges.set(input.senderID, {
    petName: challengePetName,
    status: "awaiting",
  });

  const responseMessage = await output.reply(
    `📝 | You've challenged another player with your pet **${challengePetName}**. Awaiting response...\n\nType **accept <pet-name>** to accept the challenge.\n\nThe winner will receive $**${bet}**💵 while the loser will loose the same amount of cash.`,
  );

  input.setReply(responseMessage.messageID, {
    key: "duel",
    callback: handleChallengeResponse,
    challengeDetails: {
      challengerID: input.senderID,
      petName: challengePetName,
      bet,
      isOver: false,
      selfOnly: args.includes("--self-only"),
      fairMode: args.includes("--fair"),
    },
  });
}
async function handleChallengeResponse(ctx) {
  const {
    args,
    input,
    output,
    money,
    Inventory,
    GearsManage,
    PetPlayer,
    detectID,
  } = ctx;
  function getInfos(data) {
    const gearsManage = new GearsManage(data.gearsData);
    const petsData = new Inventory(data.petsData);
    const playersMap = new Map();
    for (const pet of petsData) {
      const gear = gearsManage.getGearData(pet.key);
      const player = new PetPlayer(pet, gear);
      playersMap.set(pet.key, player);
    }
    return {
      gearsManage,
      petsData,
      playersMap,
    };
  }

  if (String(input.words[0]).toLowerCase() !== "accept") {
    return;
  }
  const opponentPetName = input.words[1];

  const challengeDetails = ctx.repObj.challengeDetails;
  if (!challengeDetails || !challengeDetails.challengerID) {
    return output.replyStyled(
      "⚠️ | Challenge details are missing or invalid.",
      style,
    );
  }
  if (challengeDetails.isOver) {
    return output.replyStyled("⚠️ | The challenge is already over.", style);
  }
  if (
    challengeDetails.selfOnly &&
    challengeDetails.challengerID !== input.senderID
  ) {
    return output.replyStyled(
      "⚠️ | The challenger only challenges themselves.",
      style,
    );
  }
  const { fairMode } = challengeDetails;
  const allUsers = await money.getAll();

  const challengerData = await allUsers[challengeDetails.challengerID];
  if (!challengerData) {
    return output.replyStyled("⚠️ | Something went wrong.", style);
  }

  if (challengerData.money < challengeDetails.bet) {
    return output.replyStyled(
      "⚠️ | This duel cannot continue because the challenger weirdly doesn't have enough money.",
      style,
    );
  }
  const challengerPets = new Inventory(challengerData.petsData);
  const challengerPet = challengerPets
    .getAll()
    .find(
      (pet) =>
        pet.name.toLowerCase() === challengeDetails.petName.toLowerCase(),
    );

  const opponentData = allUsers[input.senderID];
  if (!opponentData) {
    return output.replyStyled("⚠️ | Something went wrong.", style);
  }
  if (opponentData.money < challengeDetails.bet) {
    return output.replyStyled(
      "⚠️ | You do not have enough money to accept the challenge.",
      style,
    );
  }
  const opponentPets = new Inventory(opponentData.petsData);
  const opponentPet = opponentPets
    .getAll()
    .find((pet) => pet.name.toLowerCase() === opponentPetName.toLowerCase());

  if (!opponentPet) {
    return output.replyStyled("⚠️ | Pet not found in your pet list.", style);
  }
  const { playersMap: challengerPlayersMap } = getInfos(challengerData);
  const { playersMap: opponentPlayersMap } = getInfos(opponentData);
  const chalPet = challengerPlayersMap.get(challengerPet.key);
  chalPet.ownerID = challengeDetails.challengerID;
  const oppPet = opponentPlayersMap.get(opponentPet.key);
  oppPet.ownerID = input.senderID;
  const oppElemental = oppPet.getElementals();
  oppPet.cacheElemental = oppElemental;
  const chalElemental = chalPet.getElementals();
  chalPet.cacheElemental = chalElemental;
  const oppModifier =
    oppElemental.getModifierAgainst(chalElemental) -
    chalElemental.getModifierAgainst(oppElemental);
  const chalModifier =
    chalElemental.getModifierAgainst(oppElemental) -
    oppElemental.getModifierAgainst(chalElemental);
  oppPet.m = oppModifier;
  chalPet.m = chalModifier;

  activeChallenges.delete(challengeDetails.challengerID);
  let round = 0;
  function attack(attacker, defender) {
    let damage = Math.round(attacker.calculateAttack(defender.DF));
    const originalDamage = damage;
    if (fairMode) {
      damage = Math.floor(
        damage * (round < 3 && damage > defender.HP ? 0.55 : 0.65),
      );
      /*if (damage > defender.HP && round < 3) {
        damage = Math.floor(defender.HP * 0.9);
      }*/
    }
    const damageWithoutElemental = damage;
    damage = damage + damage * attacker.m;
    const fail = damage < damageWithoutElemental;

    const diff = Math.round(Math.abs(damage - damageWithoutElemental));
    damage = Math.round(damage);
    defender.HP -= damage;
    const defenderElemental = defender.cacheElemental;
    const attackerElemental = attacker.cacheElemental;
    const defenderKeys = defenderElemental.elements.map((i) => i.name);
    const attackerKeys = attackerElemental.elements.map((i) => i.name);
    const randomDef = defenderElemental.elements.toSorted(
      () => Math.random() - 0.5,
    )[0];

    const randomAtt = attackerElemental.elements.toSorted(
      () => Math.random() - 0.5,
    )[0];

    return {
      originalDamage,
      damage,
      text: `* ${attacker.weapon[0].icon ?? "👊"} ${attacker.petIcon} **${attacker.petName}** dealth **${Math.round(damageWithoutElemental)}** damage to ${defender.petIcon} **${defender.petName}**!${damageWithoutElemental !== damage ? `\n${fail ? `* 🔰 **${defender.petName}** used ${randomDef.class} ${randomDef.name}Shield! blocked **${diff}** damage.` : `* ⚡ **${attacker.petName}** used ${randomAtt.class} ${randomAtt.name}Slash! Inflicted **${diff}** elemental damage!`}` : ""}\n\n${defender.getPlayerUI(
        {
          upperPop: `-${damage} HP`,
        },
      )}`,
    };
  }
  let result = "";
  result += `🏆 | ${chalPet.petIcon} **${chalPet.petName}** vs ${oppPet.petIcon} **${oppPet.petName}** (${Math.floor(oppModifier * 100)}% Gap)\n${fairMode ? "⚡ ***Fair Mode***\n" : ""}\n`;
  if (fairMode) {
    const lowestLevel = Math.min(chalPet.level, oppPet.level);
    const origChal = chalPet.level;
    const origOpp = oppPet.level;
    chalPet.changeLevel(lowestLevel);
    oppPet.changeLevel(lowestLevel);

    for (let i = 0; i < 2; i++) {
      const orig = i === 0 ? origChal : origOpp;
      const pet = i === 0 ? chalPet : oppPet;
      if (orig !== pet.level) {
        result += `⚠️ ${pet.petIcon} **${pet.petName}'s** level has been capped from **LV${orig}** to **LV${pet.level}** to make the duel fairer.\n\n`;
      }
    }
  }
  result += `${chalPet.getPlayerUI()}\n\n${oppPet.getPlayerUI()}\n\n`;

  while (!chalPet.isDown() && !oppPet.isDown()) {
    round++;
    result += `☆ ***Round #${round}*** ☆\n\n`;
    result += `${attack(chalPet, oppPet).text}\n\n`;

    result += `${attack(oppPet, chalPet).text}\n\n`;
  }
  let winner = chalPet.isDown() ? oppPet : chalPet;
  let loser = oppPet.isDown() ? oppPet : chalPet;
  if (winner.isDown() && loser.isDown() && !fairMode) {
    result += `🏆 It's a tie! Both pets are knocked down.\n\n${chalPet.getPlayerUI({ upperPop: "Tie" })}\n\n${oppPet.getPlayerUI({ upperPop: "Tie" })}\n\n`;
  } else if (winner.isDown() && loser.isDown() && fairMode) {
    const sorted = [chalPet, oppPet].toSorted((a, b) => b.HP - a.HP);
    const trueWinner = sorted[0];
    const trueLoser = sorted[1];
    result += `⚡ Both **pets** are impressively **knocked down**! Yet the true winner is ${trueWinner.petIcon} **${trueWinner.petName}**!\n\n${trueWinner.getPlayerUI({ upperPop: "Winner" })}\n\n${trueLoser.getPlayerUI({ upperPop: "Loser" })}\n\n`;
    winner = trueWinner;
    loser = trueLoser;
  } else {
    result += `🏆 ${winner.petIcon} **${winner.petName}** won the duel!\n\n${loser.getPlayerUI({ upperPop: "Loser" })}\n\n`;
  }

  challengeDetails.isOver = true;
  const winnerData = allUsers[winner.ownerID];
  const loserData = allUsers[loser.ownerID];
  if (!winnerData || !loserData) {
    return output.replyStyled(
      "⚠️ | Weird, loser and winner data doesn't exist, why....?",
      style,
    );
  }
  const { bet } = challengeDetails;

  if (winner.ownerID !== loser.ownerID) {
    await money.set(winner.ownerID, {
      money: (winnerData.money ?? 0) + bet,
    });
    await money.set(loser.ownerID, {
      money: (loserData.money ?? 0) - bet,
    });
    result += `🎉 **${winnerData.name ?? "Unregistered"}** has received $**${bet}**💵!\n`;
    result += `💔 **${loserData.name ?? "Unregistered"}** lost $**${bet}**💵!\n`;
  } else {
    result += `**${winnerData.name}** has won nothing, has lost nothing, the bet $**${bet}**💵 does not make sense here.`;
  }

  return output.replyStyled(result, style);
}

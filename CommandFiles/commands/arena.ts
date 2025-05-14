import { GearsManage, PetPlayer } from "@cass-plugins/pet-fight";
import { Inventory } from "@cassidy/ut-shop";
import { FontSystem } from "cassidy-styler";
import { OutputResult } from "@cass-plugins/output";
import { PersistentStats, PetSchema } from "@cass-modules/Encounter";

export const meta: CassidySpectra.CommandMeta = {
  name: "arena",
  description: "1v1 PvP pet battle system",
  otherNames: ["pvp", "battle"],
  version: "1.1.4",
  usage: "{prefix}{name} [pet]",
  category: "Spinoff Games",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: false,
  waitingTime: 1,
  requirement: "3.7.0",
  icon: "⚔️",
  cmdType: "cplx_g",
};

export const style: CassidySpectra.CommandStyle = {
  title: `⚔️ Arena ${FontSystem.applyFonts("EX", "double_struck")}`,
  titleFont: "bold_italic",
  contentFont: "fancy",
};

const petSchema: PetSchema = {
  fight: false,
  item: false,
  magic: false,
  mercy: false,
  // defend: true,
  defend: false,
  extra: {
    Bash: "🥊",
    // LifeUp: "✨",
    HexSmash: "💥",
    FluxStrike: "🌩️",
    GuardPulse: "🛡️",
    ChaosBolt: "⚡",
    VitalSurge: "💖",
    StatSync: "🔄",
    Equilibrium: "⚖️",
  },
};

const MAX_TURNS = 20;

interface ArenaGameState {
  player1Pet: PetPlayer | null;
  player2Pet: PetPlayer | null;
  player1Author: string;
  player2Author: string | null;
  activePlayer: 1 | 2;
  flavorCache: string;
  prevMove1: string | null;
  prevMove2: string | null;
  turnCount: number;
}

const statMap = new Map<string, PersistentStats>();

function getInfos(data: UserData) {
  const gearsManage = new GearsManage(data.gearsData);
  const petsData = new Inventory(data.petsData);
  const playersMap = new Map<string, PetPlayer>();
  for (const pet of petsData) {
    const petPlayer = new PetPlayer(pet, gearsManage.getGearData(pet.key));
    playersMap.set(pet.key, petPlayer);
  }

  return { petsData, playersMap };
}

function calculatePetStrength(pet: PetPlayer): number {
  return (
    (pet.ATK +
      Math.round(pet.DF / 10) +
      pet.MAGIC +
      pet.maxHP +
      Math.round(pet.ATK * 2.1)) *
    3.5
  );
}

export async function entry({
  input,
  output,
  money,
}: CommandContext): Promise<any> {
  let gameState: ArenaGameState | null = {
    player1Pet: null,
    player2Pet: null,
    player1Author: input.senderID,
    player2Author: null,
    activePlayer: 1,
    flavorCache: "",
    prevMove1: null,
    prevMove2: null,
    turnCount: 0,
  };
  let isDefeat = false;

  const player1Data = await money.getItem(input.senderID);
  const { petsData, playersMap } = getInfos(player1Data);
  if (petsData.getAll().length < 1)
    return output.replyStyled(`You need at least one pet.`, style);

  const player1PetName = input.arguments.at(0);
  if (!player1PetName)
    return output.replyStyled(`Specify one pet name.`, style);

  const player1PetData = petsData
    .getAll()
    .find(
      (i) =>
        String(i?.name).toLowerCase().trim() ===
        player1PetName.toLowerCase().trim()
    );
  if (!player1PetData)
    return output.replyStyled(`Pet "${player1PetName}" not found.`, style);

  const player1Pet = playersMap.get(player1PetData.key);
  if (!player1Pet)
    return output.replyStyled(`Error loading pet "${player1PetName}".`, style);
  gameState.player1Pet = player1Pet;

  const infoBegin = await output.replyStyled(
    `⚔️ **Arena Challenge**:\n${
      player1Data.name
    } selected:\n\n${player1Pet.getPlayerUI({
      showStats: true,
      hideHP: true,
    })}\n\nReply with one pet name to join.`,
    style
  );

  const startHandler = async (ctx: CommandContext) => {
    if (isDefeat || ctx.input.senderID === input.senderID) {
      await ctx.output.replyStyled(`❌ | A different player must join.`, style);
      return;
    }

    const player2Data = await ctx.money.getItem(ctx.input.senderID);
    const { petsData: player2PetsData, playersMap: player2PlayersMap } =
      getInfos(player2Data);
    if (player2PetsData.getAll().length < 1) {
      await ctx.output.replyStyled(`❌ | You need one pet to join.`, style);
      return;
    }

    const player2PetName = String(ctx.input.words[0]).trim();
    const player2PetData = player2PetsData
      .getAll()
      .find(
        (i) =>
          String(i?.name).toLowerCase().trim() ===
          player2PetName.toLowerCase().trim()
      );
    if (!player2PetData) {
      await ctx.output.replyStyled(
        `❌ | Pet "${player2PetName}" not found.`,
        style
      );
      return;
    }

    const player2Pet = player2PlayersMap.get(player2PetData.key);
    if (!player2Pet) {
      await ctx.output.replyStyled(
        `❌ | Error loading pet "${player2PetName}".`,
        style
      );
      return;
    }

    gameState!.player2Pet = player2Pet;
    gameState!.player2Author = ctx.input.senderID;
    gameState!.activePlayer =
      calculatePetStrength(player1Pet) < calculatePetStrength(player2Pet)
        ? 1
        : Math.random() < 0.5
        ? 1
        : 2;

    const player1StatSum = calculatePetStrength(player1Pet);
    const player2StatSum = calculatePetStrength(player2Pet);
    const boost = Math.max(player1StatSum, player2StatSum) / 2;

    const player1HpBoost = Math.round(boost);
    player1Pet.hpModifier += player1HpBoost;
    player1Pet.maxHPModifier += player1HpBoost;
    player1Pet.HP = player1Pet.maxHP;

    const player2HpBoost = Math.round(boost);
    player2Pet.hpModifier += player2HpBoost;
    player2Pet.maxHPModifier += player2HpBoost;
    player2Pet.HP = player2Pet.maxHP;

    gameState!.flavorCache = `Arena battle begins! ${
      gameState!.activePlayer === 1 ? player1Data.name : player2Data.name
    } goes first.`;

    statMap.set(`${gameState!.player1Author}_${player1Pet.OgpetData.key}`, {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      mercyContributed: 0,
      defenseBoosts: 0,
      attackBoosts: 0,
      healsPerformed: 0,
      lastMove: null,
    });
    statMap.set(`${gameState!.player2Author}_${player2Pet.OgpetData.key}`, {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      mercyContributed: 0,
      defenseBoosts: 0,
      attackBoosts: 0,
      healsPerformed: 0,
      lastMove: null,
    });

    infoBegin.removeAtReply();
    await displayPetSelection(ctx);
  };

  infoBegin.atReply(startHandler);

  async function displayPetSelection(ctx: CommandContext): Promise<void> {
    if (!gameState || !gameState.player1Pet || !gameState.player2Pet) return;
    const activePet =
      gameState.activePlayer === 1
        ? gameState.player1Pet
        : gameState.player2Pet;
    const opponentPet =
      gameState.activePlayer === 1
        ? gameState.player2Pet
        : gameState.player1Pet;
    // const player1Data = await ctx.money.getItem(gameState.player1Author);
    // const player2Data = await ctx.money.getItem(gameState.player2Author);

    const result = `* ${gameState.flavorCache}\n\n${activePet.getPlayerUI({
      selectionOptions: petSchema,
      turn: true,
      showStats: true,
    })}\n\n**Opponent**\n${opponentPet.getPlayerUI({
      showStats: true,
    })}\n\n⚠️ **Remaining turns before draw:  ${
      MAX_TURNS - (gameState.turnCount + 1)
    }**\n\n***Reply with one option (word only)***`;

    const newInfo = await ctx.output.replyStyled(result, style);
    newInfo.atReply(
      async (turnCtx) => await handlePlayerTurn(turnCtx, newInfo)
    );
  }

  async function handlePlayerTurn(
    ctx: CommandContext,
    info: OutputResult
  ): Promise<void> {
    if (
      isDefeat ||
      !gameState ||
      !gameState.player1Pet ||
      !gameState.player2Pet ||
      ctx.input.senderID !==
        (gameState.activePlayer === 1
          ? gameState.player1Author
          : gameState.player2Author)
    ) {
      const player1Data = await ctx.money.getItem(gameState?.player1Author);
      const player2Data = await ctx.money.getItem(gameState?.player2Author);
      await ctx.output.replyStyled(
        `❌ | It's ${
          gameState?.activePlayer === 1 ? player1Data.name : player2Data.name
        }'s turn.`,
        style
      );
      return;
    }

    const turn = ctx.input.body.toLowerCase().trim();
    await handleArenaTurn(ctx, info, turn);
  }

  async function handleArenaTurn(
    ctx: CommandContext,
    info: OutputResult,
    turn: string
  ): Promise<void> {
    if (!gameState || !gameState.player1Pet || !gameState.player2Pet) return;
    gameState!.turnCount += 1;

    if (gameState!.turnCount >= MAX_TURNS) {
      info.removeAtReply();
      await handleDraw(ctx, info);
      return;
    }
    const activePet =
      gameState.activePlayer === 1
        ? gameState.player1Pet
        : gameState.player2Pet;
    const targetPet =
      gameState.activePlayer === 1
        ? gameState.player2Pet
        : gameState.player1Pet;
    const petStats = statMap.get(
      `${
        gameState.activePlayer === 1
          ? gameState.player1Author
          : gameState.player2Author
      }_${activePet.OgpetData.key}`
    )!;
    const opponentStats = statMap.get(
      `${
        gameState.activePlayer === 1
          ? gameState.player2Author
          : gameState.player1Author
      }_${targetPet.OgpetData.key}`
    )!;
    const prevMove =
      gameState.activePlayer === 1 ? gameState.prevMove1 : gameState.prevMove2;
    let flavorText = "";
    let dodgeChance = Math.random();

    if (activePet.isDown()) {
      await handleDefeat(ctx, info, gameState.activePlayer === 1 ? 2 : 1);
      return;
    }

    switch (turn) {
      case "cheat":
        if (ctx.input.isAdmin) {
          const damage =
            targetPet.maxHP - activePet.calculateAttack(targetPet.DF);
          targetPet.HP -= damage;
          petStats.totalDamageDealt += damage;
          opponentStats.totalDamageTaken += damage;
          flavorText = `* ${activePet.petIcon} **${
            activePet.petName
          }** cheated! Dealt **${damage}** damage.\n${targetPet.getPlayerUI(
            {}
          )}`;
        } else {
          flavorText = `* ${activePet.petIcon} **${activePet.petName}** tried to cheat but failed.`;
        }
        break;
      case "bash":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used 🥊 **Bash**!\n`;
        if ((prevMove === "bash" && dodgeChance < 0.7) || dodgeChance < 0.1) {
          flavorText += `* **${targetPet.petName}** dodged!`;
        } else {
          const damage = Math.round(activePet.calculateAttack(targetPet.DF));
          targetPet.HP -= damage;
          petStats.totalDamageDealt += damage;
          opponentStats.totalDamageTaken += damage;
          flavorText += `* Dealt **${damage}** damage.\n${targetPet.getPlayerUI()}`;
        }
        break;
      case "hexsmash":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used 💥 **HexSmash**!\n`;
        if (
          (prevMove === "hexsmash" && dodgeChance < 0.7) ||
          dodgeChance < 0.1
        ) {
          flavorText += `* **${targetPet.petName}** dodged!`;
        } else {
          const meanStat = Math.min(
            (activePet.ATK + activePet.MAGIC) / 2,
            activePet.ATK * 3
          );
          const damage = Math.round(
            activePet.calculateAttack(targetPet.DF, meanStat) * 1.5
          );
          targetPet.HP -= damage;
          petStats.totalDamageDealt += damage;
          opponentStats.totalDamageTaken += damage;
          flavorText += `* Dealt **${damage}** magical damage.\n${targetPet.getPlayerUI()}`;
        }
        break;
      case "fluxstrike":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used 🌩️ **FluxStrike**!\n`;
        if (
          (prevMove === "fluxstrike" && dodgeChance < 0.7) ||
          dodgeChance < 0.1
        ) {
          flavorText += `* **${targetPet.petName}** dodged!`;
        } else {
          const damageFactor = Math.max(
            0.5,
            1 - petStats.totalDamageDealt / (targetPet.maxHP * 2)
          );
          const fluxMultiplier =
            1 +
            Math.random() *
              0.5 *
              (targetPet.HP / targetPet.maxHP) *
              damageFactor;
          const damage = Math.round(
            activePet.ATK * fluxMultiplier - targetPet.DF / 5
          );
          targetPet.HP -= damage;
          petStats.totalDamageDealt += damage;
          opponentStats.totalDamageTaken += damage;
          flavorText += `* Dealt **${damage}** fluctuating damage.\n${targetPet.getPlayerUI()}`;
        }
        break;
      case "chaosbolt":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used ⚡ **ChaosBolt**!\n`;
        if (
          (prevMove === "chaosbolt" && dodgeChance < 0.9) ||
          dodgeChance < 0.5
        ) {
          flavorText += `* **${targetPet.petName}** dodged!`;
        } else {
          const statThreshold = activePet.level * 2;
          const statFactor = Math.min(
            (activePet.ATK + activePet.MAGIC) / statThreshold,
            1
          );
          const effectiveStat = Math.max(activePet.ATK, activePet.MAGIC / 2);
          let damage = Math.round(
            activePet.calculateAttack(targetPet.DF, effectiveStat) * statFactor
          );
          const chaosChance =
            Math.min(
              ((activePet.ATK + activePet.MAGIC) / (targetPet.DF || 1)) * 0.2,
              0.3
            ) *
            (1 - petStats.attackBoosts * 0.1);
          if (Math.random() < chaosChance && statFactor >= 1) {
            damage = Math.round(damage * 1.5);
            flavorText += `* Critical chaos hit! `;
          }
          damage = Math.min(damage, Math.round(targetPet.maxHP * 0.25));
          targetPet.HP -= damage;
          petStats.totalDamageDealt += damage;
          opponentStats.totalDamageTaken += damage;
          flavorText += `* Dealt **${damage}** damage.\n${targetPet.getPlayerUI()}`;
          petStats.lastMove = "chaosbolt";
        }
        break;
      case "equilibrium":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used ⚖️ **Equilibrium**!\n`;
        const eqFactor = Math.min(
          1 + petStats.totalDamageTaken / (activePet.maxHP * 2),
          2
        );
        const hpDiff = targetPet.getPercentHP() - activePet.getPercentHP();
        if (hpDiff > 0) {
          const statThreshold = activePet.level * 2;
          const attackStat = activePet.ATK + activePet.MAGIC;
          const defenseStat = activePet.DF + activePet.MAGIC;
          const attackFactor = Math.min(attackStat / statThreshold, 1);
          const defenseFactor = Math.min(defenseStat / statThreshold, 1);
          const damage = Math.round(
            activePet.calculateAttack(
              targetPet.DF,
              (activePet.ATK + activePet.MAGIC) / 2
            ) *
              (hpDiff / 100) *
              eqFactor *
              attackFactor
          );
          let heal = Math.round(
            ((activePet.DF + activePet.MAGIC) / 4) *
              (hpDiff / 100) *
              eqFactor *
              defenseFactor +
              activePet.maxHP * 0.05
          );
          const maxDamage = Math.round(targetPet.maxHP * 0.2);
          const maxHeal = Math.round(activePet.maxHP * 0.25);
          const finalDamage = Math.min(damage, maxDamage);
          const finalHeal = Math.min(
            heal,
            activePet.maxHP - activePet.HP,
            maxHeal
          );
          targetPet.HP -= finalDamage;
          activePet.HP += finalHeal;
          petStats.totalDamageDealt += finalDamage;
          opponentStats.totalDamageTaken += finalDamage;
          flavorText += `* Dealt **${finalDamage}** damage, healed **${finalHeal}** HP.\n${targetPet.getPlayerUI()}\n${activePet.getPlayerUI(
            { upperPop: `+${finalHeal} HP` }
          )}`;
          petStats.lastMove = "equilibrium";
        } else {
          flavorText += `* No effect! Opponent's HP% not higher.`;
        }
        break;
      case "defend":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used 🛡️ **Defend**!`;
        break;
      // case "lifeup":
      //   flavorText = `* ${activePet.petIcon} **${activePet.petName}** used ✨ **LifeUp**!\n`;
      //   const healing = Math.max(
      //     Math.round((activePet.maxHP / 9) * (activePet.MAGIC * 0.09)),
      //     Math.round(activePet.maxHP / 9)
      //   );
      //   const finalHealing = Math.min(healing, activePet.maxHP - activePet.HP);
      //   activePet.HP += finalHealing;
      //   flavorText += `* Healed **${finalHealing}** HP.\n${activePet.getPlayerUI(
      //     {
      //       upperPop:
      //         activePet.HP >= activePet.maxHP ? `MAX` : `+${finalHealing} HP`,
      //     }
      //   )}`;
      //   break;
      case "guardpulse":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used 🛡️ **GuardPulse**!\n`;
        const guardFactor = Math.max(0.5, 1 - petStats.defenseBoosts * 0.2);
        const guardBoost = Math.round(
          activePet.DF *
            (1 - activePet.HP / activePet.maxHP) *
            1.5 *
            guardFactor
        );
        activePet.defModifier += guardBoost;
        petStats.defenseBoosts += 1;
        flavorText += `* Defense boosted by **${guardBoost}**.\n${activePet.getPlayerUI()}`;
        break;
      case "vitalsurge":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used 💖 **VitalSurge**!\n`;
        const healFactor = Math.min(
          1.5,
          1 + (1 - petStats.healsPerformed * 0.2)
        );
        const surgeHeal = Math.round(
          activePet.MAGIC *
            (1 + activePet.HP / activePet.maxHP) *
            0.5 *
            healFactor
        );
        const finalHeal = Math.min(surgeHeal, activePet.maxHP - activePet.HP);
        activePet.HP += finalHeal;
        petStats.healsPerformed += 1;
        flavorText += `* Healed **${finalHeal}** HP.\n${activePet.getPlayerUI({
          upperPop: `+${finalHeal} HP`,
        })}`;
        break;
      case "statsync":
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** used 🔄 **StatSync**!\n`;
        const syncFactor = Math.max(0.5, 1 - petStats.attackBoosts * 0.2);
        const syncBoost = Math.round(
          Math.max(
            0,
            Math.min(
              (activePet.DF + 1) *
                (targetPet.DF / (activePet.DF || 1)) *
                0.4 *
                syncFactor,
              activePet.level * 2
            )
          )
        );
        activePet.atkModifier += syncBoost;
        petStats.attackBoosts += 1;
        flavorText += `* ${
          syncBoost < 1
            ? `ATK boost too weak.`
            : `ATK boosted by **${syncBoost}**.`
        }\n${activePet.getPlayerUI()}`;
        break;
      default:
        flavorText = `* ${activePet.petIcon} **${activePet.petName}** doesn't know **${turn}**.`;
    }

    if (gameState.activePlayer === 1) gameState.prevMove1 = turn;
    else gameState.prevMove2 = turn;

    if (targetPet.HP <= 0) {
      info.removeAtReply();
      await handleWin(ctx, gameState.activePlayer);
      return;
    }

    info.removeAtReply();
    gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
    const player1Data = await ctx.money.getItem(gameState.player1Author);
    const player2Data = await ctx.money.getItem(gameState.player2Author);
    gameState.flavorCache = `${
      gameState.activePlayer === 1 ? player1Data.name : player2Data.name
    }'s turn!`;

    const newInfo = await ctx.output.replyStyled(
      `${flavorText}\n\n${targetPet.getPlayerUI({
        turn: true,
        selectionOptions: petSchema,
      })}\n\n${
        gameState.activePlayer === 1 ? player1Data.name : player2Data.name
      }, select your move!\n\n***Reply with one option (word only)***`,
      style
    );

    newInfo.atReply(
      async (turnCtx) => await handlePlayerTurn(turnCtx, newInfo)
    );
  }

  async function handleWin(ctx: CommandContext, winner: 1 | 2): Promise<void> {
    if (!gameState || !gameState.player1Pet || !gameState.player2Pet) return;
    const winnerPet =
      winner === 1 ? gameState.player1Pet : gameState.player2Pet;
    const loserPet = winner === 1 ? gameState.player2Pet : gameState.player1Pet;
    const winnerId =
      winner === 1 ? gameState.player1Author : gameState.player2Author;
    const loserId =
      winner === 1 ? gameState.player2Author : gameState.player1Author;

    const winnerPts = Math.round(
      (statMap.get(`${winnerId}_${winnerPet.OgpetData.key}`)!.totalDamageDealt /
        10) *
        1.5
    );
    const loserPts = Math.round(
      statMap.get(`${loserId}_${loserPet.OgpetData.key}`)!.totalDamageDealt / 10
    );

    const winnerData = await ctx.money.getItem(winnerId);
    const loserData = await ctx.money.getItem(loserId);
    await ctx.money.setItem(winnerId, {
      ...winnerData,
      battlePoints: (winnerData.battlePoints || 0) + winnerPts,
    });
    await ctx.money.setItem(loserId, {
      ...loserData,
      battlePoints: (loserData.battlePoints || 0) + loserPts,
    });

    await ctx.output.replyStyled(
      `* ${winnerData.name} wins!\n${winnerPet.petIcon} **${winnerPet.petName}** defeated ${loserPet.petIcon} **${loserPet.petName}**!\n${winnerData.name} earned **${winnerPts} 💷**, ${loserData.name} earned **${loserPts} 💷**.`,
      style
    );
    gameState = null;
  }

  async function handleDefeat(
    ctx: CommandContext,
    info: OutputResult,
    winner: 1 | 2
  ): Promise<void> {
    isDefeat = true;
    info.removeAtReply();
    await handleWin(ctx, winner);
  }

  async function handleDraw(
    ctx: CommandContext,
    info: OutputResult
  ): Promise<void> {
    if (!gameState || !gameState.player1Pet || !gameState.player2Pet) return;
    info.removeAtReply();
    const player1Data = await ctx.money.getItem(gameState.player1Author);
    const player2Data = await ctx.money.getItem(gameState.player2Author);

    await ctx.output.replyStyled(
      `* Match ends in a draw after ${MAX_TURNS} turns!\n${player1Data.name}'s ${gameState.player1Pet.petIcon} **${gameState.player1Pet.petName}** and ${player2Data.name}'s ${gameState.player2Pet.petIcon} **${gameState.player2Pet.petName}** fought valiantly.\nNo battle points awarded.`,
      style
    );
    gameState = null;
  }
}

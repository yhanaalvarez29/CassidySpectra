import {
  GearsManage,
  PetPlayer,
  randArr,
  WildPlayer,
} from "@cass-plugins/pet-fight";
import { Inventory } from "@cassidy/ut-shop";
import fs from "fs-extra";
import {
  Encounter,
  PetSchema,
  GameState,
  PersistentStats,
} from "@cass-modules/Encounter";
import { FontSystem } from "cassidy-styler";
import { OutputResult } from "@cass-plugins/output";

export const meta: CassidySpectra.CommandMeta = {
  name: "encounterv2",
  description: "Pets Encounter - A reworked interactive pet battle system",
  otherNames: ["encv2", "encounter", "enc"],
  version: "2.0.0",
  usage: "{prefix}{name}",
  category: "Spinoff Games",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 1,
  requirement: "3.7.0",
  icon: "🔱",
  cmdType: "cplx_g",
  notes:
    "Reworked for improved modularity, scalability, and TypeScript support",
};

export const style: CassidySpectra.CommandStyle = {
  title: `🔱 Encounter ${FontSystem.applyFonts("EX", "double_struck")}`,
  titleFont: "bold_italic",
  contentFont: "fancy",
};

const encounters: Record<string, Encounter> = fs.readJSONSync(
  process.cwd() + "/CommandFiles/resources/spinoff/encounters.json"
);
const petSchema: PetSchema = {
  fight: false,
  item: false,
  magic: false,
  mercy: true,
  defend: true,
  extra: {
    Bash: "🥊",
    Act: "🔈",
    LifeUp: "✨",
    HexSmash: "💥",
    FluxStrike: "🌩️",
    GuardPulse: "🛡️",
    MercyWave: "🌊",
    ChaosBolt: "⚡",
    VitalSurge: "💖",
    StatSync: "🔄",
    Equilibrium: "⚖️",
  },
};

const leaderSchema: PetSchema = {
  fight: false,
  item: false,
  mercy: true,
  magic: false,
  defend: true,
  extra: {
    Bash: "🥊",
    Act: "🔊",
    LifeUp: "✨",
    HexSmash: "💥",
    FluxStrike: "🌩️",
    GuardPulse: "🛡️",
    MercyWave: "🌊",
    ChaosBolt: "⚡",
    VitalSurge: "💖",
    StatSync: "🔄",
    Equilibrium: "⚖️",
  },
};

function generateEnc(): Encounter {
  const values = Object.values(encounters);
  return values[Math.floor(Math.random() * values.length)];
}

let currentEnc: Encounter = generateEnc();

function getInfos(data: any) {
  const gearsManage = new GearsManage(data.gearsData);
  const petsData = new Inventory(data.petsData);
  const playersMap = new Map<string, PetPlayer>();
  for (const pet of petsData) {
    const gear = gearsManage.getGearData(pet.key);
    const player = new PetPlayer(pet, gear);
    playersMap.set(pet.key, player);
  }
  return { gearsManage, petsData, playersMap };
}

function getCacheIcon(turn: string | null): string | null {
  if (!turn) return null;
  const mapping: Record<string, string> = {
    fight: "⚔️",
    act: "🔊",
    mercy: "❌",
    defend: "🛡",
    heal: "✨",
  };
  return mapping[turn] ?? null;
}

export async function entry({ input, output }: CommandContext): Promise<void> {
  const statMap = new Map<string, PersistentStats>();
  let gameState: GameState | null = null;
  let isDefeat = false;

  const info = await output.replyStyled(
    `🔎 **Random Encounter**:
Your opponent is ${currentEnc.wildIcon} ${currentEnc.wildName}

Please **reply** with the names of maximum of **3 pets**, separated by |, you cannot use same type of pet twice.
**Example:** doggie | meowy | cobra

The first **pet** will become the leader, which who can use the 🔊 **Act**`,
    style
  );

  const startHandler = async (ctx: CommandContext) => {
    if (isDefeat || ctx.input.senderID !== input.senderID) {
      await ctx.output.replyStyled(
        `❌ | You are **not** the one who started this **game**.`,
        style
      );
      return;
    }

    const userData = await ctx.money.getItem(input.senderID);
    const { petsData, playersMap } = getInfos(userData);

    if (petsData.getAll().length < 3) {
      await ctx.output.replyStyled(
        `❌ | Oops, you need at least 3 pets to start the game. Try **uncaging** ${
          3 - petsData.getAll().length
        } more pet(s).`,
        style
      );
      info.removeAtReply();
      return;
    }

    const petsName = ctx.input.splitBody("|");
    if (petsName.length < 3) {
      await ctx.output.replyStyled(
        `❌ | Please specify **exactly 3** pet **names** split by |`,
        style
      );
      return;
    }
    if (petsName.length > 3) {
      await ctx.output.replyStyled(`❌ | Too much pets!`, style);
      return;
    }

    const pets: PetPlayer[] = [];
    for (const petName of petsName) {
      const original = petsData
        .getAll()
        .find(
          (i: any) =>
            String(i?.name).toLowerCase().trim() ===
            String(petName).toLowerCase().trim()
        );
      if (!original) {
        await ctx.output.replyStyled(
          `❌ | Pet "${petName}" doesn't exists in your pet list.`,
          style
        );
        return;
      }
      const pet = playersMap.get(original.key);
      if (pet) pets.push(pet);
    }

    const opponent = new WildPlayer(
      {
        ...currentEnc,
        HP:
          currentEnc.HP +
          Math.round(pets.reduce((acc, pet) => acc + pet.ATK * 2.1, 0)),
        ATK:
          currentEnc.ATK +
          Math.round(pets.reduce((acc, pet) => acc + pet.DF / 10, 0)),
        goldFled:
          currentEnc.goldFled +
          Math.round(pets.reduce((acc, pet) => acc + pet.ATK * 20, 0)),
        goldSpared:
          currentEnc.goldSpared +
          Math.floor(pets.reduce((acc, pet) => acc + pet.ATK * 50, 0)),
      },
      [...pets]
    );

    gameState = {
      pets,
      opponent,
      index: 0,
      turnCache: [],
      prevTurns: [],
      flavorCache: randArr(opponent.flavor.encounter),
      type: "turnPlayer",
      author: input.senderID,
    };

    info.removeAtReply();
    await displayPetSelection(ctx);
  };

  info.atReply(startHandler);

  function initializeStatMap(pets: PetPlayer[], opponent: WildPlayer) {
    statMap.clear();
    for (const pet of pets) {
      statMap.set(pet.OgpetData.key, {
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        mercyContributed: 0,
        defenseBoosts: 0,
        attackBoosts: 0,
        healsPerformed: 0,
        lastMove: null,
      });
    }
    statMap.set("opponent", {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      mercyContributed: 0,
      defenseBoosts: 0,
      attackBoosts: 0,
      healsPerformed: 0,
      lastMove: null,
    });
  }

  async function displayPetSelection(ctx: CommandContext): Promise<void> {
    if (!gameState) return;
    let result = `* ${gameState.flavorCache}\n\n`;
    for (let i = 0; i < gameState.pets.length; i++) {
      const pet = gameState.pets[i];
      const schema = i === 0 ? leaderSchema : petSchema;
      result += `${pet.getPlayerUI({
        selectionOptions: schema,
        turn: gameState.index === i,
        icon: getCacheIcon(gameState.turnCache[i]),
      })}\n\n`;
    }
    result += `***Reply with the option. (word only)***, you can also use **all** as second argument, you can also use | to split the options.`;

    initializeStatMap(gameState.pets, gameState.opponent);

    const newInfo = await ctx.output.replyStyled(result, style);
    newInfo.atReply(
      async (turnCtx) => await handlePlayerTurn(turnCtx, newInfo)
    );
  }

  async function handlePlayerTurn(
    ctx: CommandContext,
    info: OutputResult
  ): Promise<void> {
    if (isDefeat || !gameState || ctx.input.senderID !== gameState.author)
      return;

    let turnOption = String(ctx.input.words[0]).toLowerCase();
    if (ctx.input.words[1] === "all") {
      gameState.turnCache = [
        gameState.pets[0].isDown() ? null : turnOption,
        gameState.pets[1].isDown() ? null : turnOption,
        gameState.pets[2].isDown() ? null : turnOption,
      ];
      gameState.index = 3;
    } else {
      const [a, b, c] = ctx.input.splitBody("|");
      if (a && b) {
        gameState.turnCache = [a, b, c]
          .filter(Boolean)
          .map((i) => i.toLowerCase());
        gameState.index = gameState.turnCache.length;
      } else {
        gameState.turnCache.push(turnOption);
        gameState.index++;
      }
    }

    if (gameState.pets.every((pet) => pet.isDown())) {
      await handleDefeat(ctx, info);
      return;
    }

    if (gameState.index >= 3) {
      await handleEnemyTurn(ctx, info);
    } else {
      if (gameState.pets[gameState.index]?.isDown()) gameState.index++;
      if (gameState.pets[gameState.index]?.isDown()) gameState.index++;

      let extraText = "";
      if (gameState.attack?.turnType === "attack") {
        for (const pet of gameState.pets) {
          if (pet.isDown()) {
            const heal = pet.getDownHeal();
            pet.HP += heal;
            extraText += `* ${pet.petIcon} **${pet.petName}** has regenerated ${heal} HP.\n\n`;
          }
        }

        const { answer, attackName } = gameState.attack;
        let isHurt = turnOption !== answer;
        if (isHurt) {
          extraText += `* You chose **${turnOption}**, but it was not effective against **${attackName}**\n\n`;
          const isAllParty = Math.random() < 0.4;
          if (isAllParty) {
            const members = gameState.pets.filter((i) => !i.isDown());
            if (members.length === 0) {
              await handleDefeat(ctx, info);
              return;
            }
            for (const randomMember of members) {
              const damage = Math.round(
                randomMember.calculateTakenDamage(gameState.opponent.ATK) /
                  members.length
              );
              randomMember.HP -= Math.max(damage, 1);
              if (randomMember.HP < 1) {
                randomMember.HP = Math.round(randomMember.maxHP * 0.5) * -1;
              }
              extraText += `* ${randomMember.petIcon} **${
                randomMember.petName
              }** ${
                randomMember.isDown()
                  ? `is down.`
                  : `has taken **${damage}** damage.`
              }\n`;
            }
          } else {
            const availablePets = gameState.pets.filter((i) => !i.isDown());
            const lowestPet = availablePets.toSorted((a, b) => a.HP - b.HP)[0];
            let randomMember =
              availablePets[Math.floor(Math.random() * availablePets.length)];
            if (lowestPet === randomMember) {
              randomMember =
                availablePets[Math.floor(Math.random() * availablePets.length)];
            }
            if (randomMember) {
              const damage = randomMember.calculateTakenDamage(
                gameState.opponent.ATK
              );
              randomMember.HP -= Math.max(damage, 1);
              if (randomMember.HP < 1) {
                randomMember.HP = Math.round(randomMember.maxHP * 0.5) * -1;
              }
              extraText += `* ${randomMember.petIcon} **${
                randomMember.petName
              }** ${
                randomMember.isDown()
                  ? `is down.`
                  : `has taken **${damage}** damage.`
              }\n`;
            }
          }
          extraText += `\n`;
        } else {
          extraText += `* You chose **${turnOption}** and the entire party has successfully dodged the **${attackName}**!\n\n`;
        }
      }

      gameState.attack = undefined;
      const newInfo = await ctx.output.replyStyled(
        extraText + (await listPetsNormal()),
        style
      );
      newInfo.atReply(
        async (turnCtx) => await handlePlayerTurn(turnCtx, newInfo)
      );
    }
  }

  async function handleEnemyTurn(
    ctx: CommandContext,
    info: OutputResult
  ): Promise<void> {
    if (!gameState) return;
    const turns = gameState.turnCache.map((i) => String(i).toLowerCase());
    let flavorText = ``;
    let damage = 0;
    let newResponse: string | null = null;
    let dodgeChance = Math.random();

    for (let i = 0; i < turns.length; i++) {
      const pet = gameState.pets[i];
      const turn = turns[i];
      if (!turn || pet.isDown()) {
        flavorText += `* ${pet.petIcon} **${pet.petName}** ${
          !turn ? "has no turn specified" : "is currently down"
        }.\n`;
        continue;
      }
      const petStats = statMap.get(pet.OgpetData.key);
      const opponentStats = statMap.get("opponent");

      switch (turn) {
        case "cheat": {
          if (ctx.input.isAdmin) {
            const allAtk = gameState.pets.reduce(
              (acc, pet) => acc + pet.calculateAttack(gameState.opponent.DF),
              0
            );
            damage += gameState.opponent.maxHP - allAtk;
          }
          break;
        }
        case "hexsmash": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used 💥 **HexMash**!\n`;
          if (
            (gameState.prevTurns[i] === "hexsmash" && dodgeChance < 0.7) ||
            Math.random() < 0.1
          ) {
            flavorText += `* ${gameState.opponent.wildIcon} **${gameState.opponent.wildName}** successfully dodges!\n`;
          } else {
            const meanStat = Math.min((pet.ATK + pet.MAGIC) / 2, pet.ATK * 3);
            const init = pet.calculateAttack(gameState.opponent.DF, meanStat);
            const damageEach = Math.round(init * 1.5);
            gameState.opponent.HP -= damageEach;
            flavorText += `* Inflicted **${damageEach}** magical damage.\n${gameState.opponent.getPlayerUI()}\n`;
            damage += damageEach;
          }
          flavorText += `\n`;

          break;
        }
        case "bash": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** attacks!\n`;
          if (
            (gameState.prevTurns[i] === "bash" && dodgeChance < 0.7) ||
            Math.random() < 0.1
          ) {
            flavorText += `* ${gameState.opponent.wildIcon} **${gameState.opponent.wildName}** successfully dodges!\n`;
          } else {
            const damageEach = pet.calculateAttack(gameState.opponent.DF);
            gameState.opponent.HP -= damageEach;
            flavorText += `* Inflicted **${damageEach}** damage.\n${gameState.opponent.getPlayerUI()}\n`;
            damage += damageEach;
          }
          flavorText += `\n`;

          break;
        }
        case "defend": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** defended.\n`;
          break;
        }
        case "mercy": {
          if (gameState.opponent.isSparable()) {
            flavorText += `* ${pet.petIcon} **${pet.petName}** spared ${gameState.opponent.wildIcon} **${gameState.opponent.wildName}**!`;
            await handleWin(ctx, true, flavorText);
            return;
          }
          const calc =
            (pet.calculateAttack(gameState.opponent.DF) /
              gameState.opponent.maxHP) *
            100 *
            0.2;
          gameState.opponent.addMercyInternal(calc * 25);
          flavorText += `* ${pet.petIcon} **${pet.petName}** spared ${
            gameState.opponent.wildIcon
          } **${
            gameState.opponent.wildName
          }**, but the name isn't **YELLOW**! gained ${Math.round(
            calc
          )}% Mercy Points.\n`;
          break;
        }
        case "debug": {
          flavorText += `${JSON.stringify(gameState.opponent, null, 2)}\n`;
          break;
        }
        case "act": {
          if (i !== 0) {
            const calc =
              (pet.calculateAttack(gameState.opponent.DF) /
                gameState.opponent.maxHP) *
              100 *
              0.4;
            gameState.opponent.addMercyInternal(calc * 25);
            flavorText += `* ${pet.petIcon} **${
              pet.petName
            }** used 🔊 **Pet Action**\n* Gained ${Math.floor(
              calc
            )}% Mercy Points.\n`;
          } else {
            const calc =
              (pet.calculateAttack(gameState.opponent.DF) /
                gameState.opponent.maxHP) *
              100 *
              0.6;
            gameState.opponent.addMercyInternal(calc * 25);
            const randomActs = Object.keys(gameState.opponent.acts).filter(
              (i) => gameState.opponent.isActAvailable(i)
            );
            const randomAct =
              randomActs[Math.floor(Math.random() * randomActs.length)];
            const actData = gameState.opponent.getAct(randomAct);
            let {
              flavor = `${pet.petIcon} **${pet.petName}** can't think of what to do.`,
              response,
              mercyPts = 0,
              petLine = "...",
            } = actData ?? {};
            gameState.opponent.MERCY += mercyPts;
            flavorText += `* 🔊 **${randomAct}**\n* ${flavor}\n\n${
              pet.petIcon
            } **${pet.petName}**: ${petLine}\n\n* Gained ${
              mercyPts + Math.floor(calc)
            }% Mercy Points.\n`;
            newResponse = response;
          }
          break;
        }
        case "lifeup": {
          const magic = pet.MAGIC;
          const lowests = gameState.pets.toSorted(
            (a, b) => a.HP / a.maxHP - b.HP / b.maxHP
          );
          const firstLowest = lowests[0];
          const target =
            Math.random() < 0.3 && pet.HP < pet.maxHP ? pet : firstLowest;
          const healing = Math.max(
            Math.round((target.maxHP / 9) * (magic * 0.09)),
            Math.round(target.maxHP / 9)
          );
          const prevDown = target.isDown();
          const finalHealing = Math.min(healing, target.maxHP - target.HP);
          target.HP += finalHealing;
          if (prevDown && target.HP > 0 && target.HP < target.maxHP * 0.17) {
            target.HP = Math.round(target.maxHP * 0.17);
          }
          flavorText += `* ${pet.petIcon} **${
            pet.petName
          }** cast ✨ **Lifeup** to ${
            target === pet ? `itself!` : `**${target.petName}**!`
          } ${
            target.HP >= target.maxHP
              ? `HP has been maxed out.`
              : `Recovered **${finalHealing}** HP.`
          }\n${target.getPlayerUI({
            upperPop:
              prevDown && !target.isDown()
                ? `UP`
                : target.HP >= target.maxHP
                ? `MAX`
                : `+${finalHealing} HP`,
          })}\n\n`;
          break;
        }
        case "fluxstrike": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used 🌩️ **FluxStrike**!\n`;
          if (
            dodgeChance < 0.1 ||
            (petStats.lastMove === "fluxstrike" && dodgeChance < 0.7)
          ) {
            flavorText += `* ${gameState.opponent.wildIcon} **${gameState.opponent.wildName}** dodges!\n`;
          } else {
            const damageFactor = Math.max(
              0.5,
              1 - petStats.totalDamageDealt / (gameState.opponent.maxHP * 2)
            );
            const fluxMultiplier =
              1 +
              Math.random() *
                0.5 *
                (gameState.opponent.HP / gameState.opponent.maxHP) *
                damageFactor;
            const fluxDamage = Math.round(
              pet.ATK * fluxMultiplier - gameState.opponent.DF / 5
            );
            gameState.opponent.HP -= fluxDamage;
            petStats.totalDamageDealt += fluxDamage;
            opponentStats.totalDamageTaken += fluxDamage;
            flavorText += `* Dealt **${fluxDamage}** fluctuating damage!\n${gameState.opponent.getPlayerUI()}\n`;
            damage += fluxDamage;
          }
          flavorText += `\n`;
          break;
        }

        case "guardpulse": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used 🛡️ **GuardPulse**!\n`;
          const guardFactor = Math.max(0.5, 1 - petStats.defenseBoosts * 0.2);
          const guardBoost = Math.round(
            pet.DF * (1 - pet.HP / pet.maxHP) * 1.5 * guardFactor
          );
          pet.defModifier += guardBoost;
          petStats.defenseBoosts += 1;
          flavorText += `* Defense boosted by **${guardBoost}** for the next attack!\n${pet.getPlayerUI()}\n`;
          flavorText += `\n`;
          break;
        }

        case "mercywave": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used 🌊 **MercyWave**!\n`;

          const mercyFactor = Math.min(1 + petStats.mercyContributed / 1000, 2);

          const baseMercyPoints = Math.round(
            pet.MAGIC *
              (gameState.opponent.HP / gameState.opponent.maxHP) *
              0.5 *
              mercyFactor
          );

          const opponentCap = Math.round(gameState.opponent.maxHP * 0.1);
          const petCap = Math.round(Math.min(pet.MAGIC, 100) * 10);
          const fixedCap = 625;

          const mercyPoints = Math.min(
            baseMercyPoints,
            opponentCap,
            petCap,
            fixedCap
          );

          gameState.opponent.addMercyInternal(mercyPoints);
          petStats.mercyContributed += mercyPoints;

          flavorText += `* Gained **${Math.round(
            mercyPoints / 25
          )}%** mercy points!\n${gameState.opponent.getPlayerUI()}\n`;
          flavorText += `\n`;
          break;
        }

        case "chaosbolt": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used ⚡ **ChaosBolt**!\n`;
          if (
            dodgeChance < 0.1 ||
            (petStats.lastMove === "chaosbolt" && dodgeChance < 0.7)
          ) {
            flavorText += `* ${gameState.opponent.wildIcon} **${gameState.opponent.wildName}** dodges!\n`;
          } else {
            let boltDamage = Math.round(
              pet.calculateAttack(gameState.opponent.DF)
            );
            const chaosChance =
              Math.min(pet.ATK / gameState.opponent.DF, 0.5) *
              (1 - petStats.attackBoosts * 0.1);
            if (Math.random() < chaosChance) {
              boltDamage *= 2;
              flavorText += `* Critical chaos hit! `;
            }
            gameState.opponent.HP -= boltDamage;
            petStats.totalDamageDealt += boltDamage;
            opponentStats.totalDamageTaken += boltDamage;
            flavorText += `* Dealt **${boltDamage}** damage!\n${gameState.opponent.getPlayerUI()}\n`;
            damage += boltDamage;
          }
          flavorText += `\n`;
          break;
        }

        case "vitalsurge": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used 💖 **VitalSurge**!\n`;
          const healFactor = Math.min(
            1.5,
            1 + (1 - petStats.healsPerformed * 0.2)
          );
          const avgTeamHP =
            gameState.pets.reduce(
              (acc, p) => acc + (p.isDown() ? 0 : p.HP / p.maxHP),
              0
            ) / gameState.pets.length;
          const surgeHeal = Math.round(
            pet.MAGIC * (1 + avgTeamHP) * 0.5 * healFactor
          );
          const target = gameState.pets.reduce((a, b) => (a.HP < b.HP ? a : b));
          const prevDown = target.isDown();
          target.HP += Math.min(surgeHeal, target.maxHP - target.HP);
          petStats.healsPerformed += 1;
          flavorText += `* Healed **${surgeHeal}** HP to **${
            target.petName
          }**!\n${target.getPlayerUI({
            upperPop: prevDown && !target.isDown() ? `UP` : `+${surgeHeal} HP`,
          })}\n`;
          flavorText += `\n`;
          break;
        }

        case "statsync": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used 🔄 **StatSync**!\n`;
          const syncFactor = Math.max(0.5, 1 - petStats.attackBoosts * 0.2);
          const syncBoost = Math.round(
            (pet.DF + 1) *
              ((gameState.opponent.DF || 1) / (pet.DF || 1)) *
              0.4 *
              syncFactor
          );
          pet.atkModifier += syncBoost;
          petStats.attackBoosts += 1;
          flavorText += `* ATK boosted by **${syncBoost}** for the next turn!\n${pet.getPlayerUI()}\n`;
          flavorText += `\n`;
          break;
        }

        case "equilibrium": {
          flavorText += `* ${pet.petIcon} **${pet.petName}** used ⚖️ **Equilibrium**!\n`;
          const eqFactor = 1 + petStats.totalDamageTaken / (pet.maxHP * 2);
          const hpDiff = gameState.opponent.HP - pet.HP;
          if (hpDiff > 0) {
            const eqDamage = Math.round(hpDiff * 0.2 * eqFactor);
            const eqHeal = Math.round(hpDiff * 0.03 * eqFactor);
            gameState.opponent.HP -= eqDamage;
            pet.HP += Math.min(eqHeal, pet.maxHP - pet.HP);
            petStats.totalDamageDealt += eqDamage;
            opponentStats.totalDamageTaken += eqDamage;
            flavorText += `* Dealt **${eqDamage}** damage and healed **${eqHeal}** HP!\n${gameState.opponent.getPlayerUI()}\n${pet.getPlayerUI(
              {
                upperPop: `+${eqHeal} HP`,
              }
            )}\n`;
            damage += eqDamage;
          } else {
            flavorText += `* No effect! Opponent's HP is not higher than yours.\n`;
          }
          flavorText += `\n`;
          break;
        }
        default:
          flavorText += `* ${pet.petIcon} **${pet.petName}** did not learn **${turn}**.\n`;
      }
    }

    gameState.opponent.HP -= damage;
    gameState.prevTurns = [...turns];
    await enemyAttack(ctx, info, { flavorText, newResponse, damage });
  }

  async function enemyAttack(
    ctx: CommandContext,
    _info: OutputResult,
    {
      flavorText,
      damage,
      newResponse,
    }: { flavorText: string; damage?: number; newResponse: string | null }
  ): Promise<void> {
    if (!gameState) return;
    if (gameState.opponent.isDown()) {
      await handleWin(ctx, false, flavorText);
      return;
    }

    const { text, answer, attackName } = gameState.opponent.getAttackMenu();
    if (
      (gameState.opponent.HP < gameState.opponent.maxHP * 0.5 &&
        Math.random() < 0.3) ||
      Math.random() < 0.1
    ) {
      let healing = Math.min(
        gameState.pets.reduce(
          (_, pet) => pet.calculateAttack(gameState.opponent.DF - 2),
          0
        ),
        gameState.opponent.maxHP - gameState.opponent.HP
      );
      healing = Math.round(healing * 2.5);
      gameState.opponent.HP += Math.min(gameState.opponent.maxHP, healing);
      gameState.attack = {
        text: ``,
        healing,
        turnType: "heal",
      };
      const newInfo = await ctx.output.replyStyled(
        `${flavorText}\n* ${gameState.opponent.wildIcon} **${
          gameState.opponent.wildName
        }** cast ✨ **Lifeup** α! Recovered **${healing}** HP!\n\n${gameState.opponent.getPlayerUI(
          { upperPop: `+${healing}HP` }
        )}\n\n***Reply anything to proceed.***`,
        style
      );
      gameState.index = 0;
      gameState.flavorCache = gameState.opponent.getNeutralFlavor();
      gameState.turnCache = [];
      newInfo.atReply(
        async (turnCtx) => await handlePlayerTurn(turnCtx, newInfo)
      );
    } else {
      gameState.attack = {
        text,
        answer,
        attackName,
        turnType: "attack",
      };
      const newInfo = await ctx.output.replyStyled(
        `${flavorText}\n${gameState.opponent.getPlayerUI({
          upperPop: damage
            ? `-${Math.round((damage / gameState.opponent.maxHP) * 100)}% HP`
            : null,
        })}\n\n${gameState.opponent.wildIcon} **${
          gameState.opponent.wildName
        }**: \n${
          newResponse ?? gameState.opponent.getNeutralDialogue()
        }\n\n${text}\n\n***Reply with the option. (word only)***`,
        style
      );
      gameState.index = 0;
      gameState.flavorCache = gameState.opponent.getNeutralFlavor();
      gameState.turnCache = [];
      newInfo.atReply(
        async (turnCtx) => await handlePlayerTurn(turnCtx, newInfo)
      );
    }
  }

  async function handleWin(
    ctx: CommandContext,
    isGood: boolean,
    flavor: string
  ): Promise<void> {
    if (!gameState) return;
    currentEnc = generateEnc();
    let dialogue: string;
    let multiplier = 1;
    const alivePets = gameState.pets.filter((i) => !i.isDown());
    multiplier = alivePets.length / 3;
    let mercyMode = gameState.opponent.HP >= gameState.opponent.maxHP && isGood;
    let pts = Math.round((gameState.opponent.goldFled / 15) * multiplier);
    if (mercyMode) {
      pts = Math.round(pts * 1.7);
    }
    if (isGood) {
      dialogue = `${gameState.opponent.wildIcon} **${
        gameState.opponent.wildName
      }** has been${mercyMode ? " kindly" : ""} spared by your party.`;
    } else {
      dialogue =
        gameState.opponent.flavor.run?.[0] ??
        `${gameState.opponent.wildIcon} **${gameState.opponent.wildName}** ran away.`;
    }

    const userData = await ctx.money.getItem(input.senderID);
    let newMoney =
      Number(Math.round(gameState.opponent.goldFled ?? 0) * multiplier) +
      (userData.money ?? 0);
    const collectibles = new ctx.Collectibles(userData.collectibles ?? []);
    if (collectibles.has("gems")) {
      collectibles.raise("gems", gameState.opponent.winDias ?? 0);
    }
    await ctx.money.setItem(input.senderID, {
      money: newMoney,
      collectibles: Array.from(collectibles),
      battlePoints: (userData.battlePoints ?? 0) + pts,
    });
    await ctx.output.replyStyled(
      (flavor ?? "").trim() +
        `\n\n` +
        `* ${dialogue}\n\n${
          isGood
            ? gameState.opponent.spareText()
            : gameState.opponent.fledText()
        }\nObtained **${pts} 💷 Battle Points!**\n${
          gameState.opponent.winDias && collectibles.has("gems")
            ? `You also won **${gameState.opponent.winDias}** 💎!`
            : ""
        }`,
      style
    );
    gameState = null;
  }

  async function handleDefeat(
    ctx: CommandContext,
    info: OutputResult
  ): Promise<void> {
    isDefeat = true;
    currentEnc = generateEnc();
    info.removeAtReply();
    await ctx.output.replyStyled(
      `❌ **Game Over**\n\n* All your pet members have been fainted. But that's not the end! Stay determined. You can always **try** again.`,
      style
    );
    gameState = null;
  }

  async function listPetsNormal(): Promise<string> {
    if (!gameState) return "";
    let result = `* ${gameState.flavorCache}\n\n`;
    for (let i = 0; i < gameState.pets.length; i++) {
      const pet = gameState.pets[i];
      const schema = i === 0 ? leaderSchema : petSchema;
      result += `${pet.getPlayerUI({
        selectionOptions: schema,
        turn: gameState.index === i,
        icon: getCacheIcon(gameState.turnCache[i]),
      })}\n\n`;
    }
    result += `***Reply with the option. (word only)***, you can also use **all** as second argument, you can also use | to split the options.`;
    return result;
  }
}

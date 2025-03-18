// CommandFiles/commands/Tournament.js

import moment from "moment-timezone";

// ─── CONFIGURATION: Change the tournament mode by modifying this constant ───
// Options: "money", "battlePoints", "pets"
const tournamentMode = "battlePoints";

// For money and battlePoints modes, use these helpers:
const currencyKey =
  tournamentMode === "battlePoints" ? "battlePoints" : "money";
function formatAmount(amount) {
  return tournamentMode === "battlePoints"
    ? `${amount.toLocaleString()} Battle Points`
    : `$${amount.toLocaleString()}`;
}

// ─── Pet helper function ─────────────────────────────
// Provided to avoid reference errors.
function autoUpdatePetData(petData) {
  const { lastExp = 0 } = petData;
  petData.level = lastExp < 10 ? 1 : Math.floor(Math.log2(lastExp / 10)) + 1;
  return petData;
}

function calculateWorth(pet) {
  pet = autoUpdatePetData(pet);
  const { sellPrice, level, lastExp = 0 } = pet;
  return Math.floor(sellPrice * 2 + ((lastExp * 9) << (level - 1)));
}

// ─── Command Meta and Style ─────────────────────────────
export const meta = {
  name: "tournament",
  description:
    tournamentMode === "pets"
      ? "Tournament for top pet holders with big rewards!"
      : tournamentMode === "battlePoints"
        ? "Tournament for top battlePoints holders with big rewards!"
        : "Tournament for top balance holders with big rewards!",
  version: "2.7.0",
  author: "MrKimstersDev | Liane",
  usage: "{prefix}tournament",
  category: "Event",
  permissions: [0],
};

export const style = {
  title: "🏆 Tournament",
  titleFont: "bold",
  contentFont: "fancy",
};

// ─── Global Variables ─────────────────────────────────────────────
let tournamentEnded = false;
const deadline = moment
  .tz("2025-02-15 07:30 PM", "YYYY-MM-DD hh:mm A", "Asia/Manila")
  .toDate();
const excludedUsers = ["100080333765118"];

function formatTimeWithMoment(date) {
  return moment(date).tz("Asia/Manila").format("hh:mm A");
}

// ─── Main Entry Function ─────────────────────────────────────────────
/*  
  The parameters passed (such as Inventory, GearsManage, PetPlayer, prefix) are used only in pet mode.
  For money and battlePoints, only input, output, money, and api are required.
*/
/**
 * @type {CommandEntry}
 */
export async function entry({
  input,
  output,
  money,
  api,
  Inventory, // used in pets mode
  GearsManage, // used in pets mode
  PetPlayer, // used in pets mode
  prefix, // used in pets mode if needed
}) {
  const now = moment.tz("Asia/Manila").toDate();
  const timeLeft = deadline - now;

  // ─── PET MODE ─────────────────────────────────────────────
  if (tournamentMode === "pets") {
    // Get all user data (assumed to contain petsData and gearsData)
    const allData = await money.getAll();
    const filteredUserIDs = Object.keys(allData).filter((userID) => {
      const data = allData[userID];
      return (
        data.petsData &&
        Array.isArray(data.petsData) &&
        data.petsData.length > 0 &&
        data.petsData.every(Boolean)
      );
    });
    if (filteredUserIDs.length === 0) {
      return output.reply(`⚠️ **No participants with pets found.**`);
    }

    // Determine each user's strongest pet.
    const highestPets = {};
    const sortedKeys = filteredUserIDs.sort((a, b) => {
      const dataA = allData[a];
      const dataB = allData[b];

      let petsA = (dataA.petsData || []).map((pet) =>
        autoUpdatePetData(typeof pet === "object" && pet ? pet : {}),
      );
      let petsB = (dataB.petsData || []).map((pet) =>
        autoUpdatePetData(typeof pet === "object" && pet ? pet : {}),
      );

      // Sort pets by (calculateWorth + lastExp).
      // (Assumes a global calculateWorth function is defined elsewhere.)
      petsA.sort(
        (p1, p2) =>
          calculateWorth(p2) +
          (p2.lastExp || 0) -
          (calculateWorth(p1) + (p1.lastExp || 0)),
      );
      petsB.sort(
        (p1, p2) =>
          calculateWorth(p2) +
          (p2.lastExp || 0) -
          (calculateWorth(p1) + (p1.lastExp || 0)),
      );
      const highestA = petsA[0] || {};
      const highestB = petsB[0] || {};
      highestPets[a] = highestA;
      highestPets[b] = highestB;

      const worthA = calculateWorth(highestA) + (highestA.lastExp || 0) || 0;
      const worthB = calculateWorth(highestB) + (highestB.lastExp || 0) || 0;
      const gearsA = dataA.gearsData || [];
      const gearsB = dataB.gearsData || [];
      const gmA = new GearsManage(gearsA);
      const gmB = new GearsManage(gearsB);
      const petGearA = gmA.getGearData(highestA.key);
      const petGearB = gmB.getGearData(highestB.key);
      // Helper to compute pet stats using PetPlayer
      function helper(pet, gear) {
        const player = new PetPlayer(pet, gear);
        return (
          player.HP / 4 +
          player.DF * 10 +
          player.ATK * 10 +
          player.MAGIC * 2 -
          (player.maxHP - player.HP) * 80
        );
      }
      const statA = helper(highestA, petGearA) + worthA / 1000;
      const statB = helper(highestB, petGearB) + worthB / 1000;
      return statB - statA;
    });

    // ── Tournament Ended (or Deadline Passed) ───────────────────
    if (tournamentEnded || timeLeft <= 0) {
      if (!tournamentEnded) {
        tournamentEnded = true;
        const topUsers = sortedKeys.slice(0, 3);
        const otherParticipants = sortedKeys.slice(3);
        let resultMessage = `🏆 **PET TOURNAMENT RESULTS** 🏆\n\n`;
        // Define pet-specific prizes
        const prizeDistribution = [
          { rank: 1, prize: "Rare Pet Trophy" },
          { rank: 2, prize: "Uncommon Pet Trophy" },
          { rank: 3, prize: "Common Pet Trophy" },
        ];
        for (let i = 0; i < topUsers.length; i++) {
          const userID = topUsers[i];
          const userData = allData[userID];
          const pet = highestPets[userID];
          const gm = new GearsManage(userData.gearsData || []);
          const gearData = gm.getGearData(pet.key);
          const player = new PetPlayer(pet, gearData);
          resultMessage += `🏅 **TOP ${i + 1} WINNER [ ${prizeDistribution[i].prize} ]**\n`;
          resultMessage += `🔹 **Username**: ${userData.name || "Unknown"}\n`;
          resultMessage += `🔑 **User ID**: ${userID}\n`;
          resultMessage += `${player.getPlayerUI()}\n━━━━━━━━━━━━━━━\n`;
        }
        if (otherParticipants.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * otherParticipants.length,
          );
          const bonusUserID = otherParticipants[randomIndex];
          const bonusUserData = allData[bonusUserID];
          const bonusPet = highestPets[bonusUserID];
          const gmBonus = new GearsManage(bonusUserData.gearsData || []);
          const bonusGear = gmBonus.getGearData(bonusPet.key);
          const bonusPlayer = new PetPlayer(bonusPet, bonusGear);
          resultMessage += `\n🎉 **BONUS WINNER** 🎉\n\n`;
          resultMessage += `🔹 **Winner**: ${bonusUserData.name || "Unknown"}\n`;
          resultMessage += `🏆 **Reward**: Special Pet Reward\n`;
          resultMessage += `🔑 **User ID**: ${bonusUserID}\n`;
          resultMessage += `${bonusPlayer.getPlayerUI()}\n━━━━━━━━━━━━━━━\n`;
        }
        const { ADMINBOT } = Cassidy?.config || {};
        if (ADMINBOT && Array.isArray(ADMINBOT) && ADMINBOT.length > 0) {
          for (const adminID of ADMINBOT) {
            try {
              await output.sendStyled(resultMessage, style, adminID);
            } catch (error) {
              console.error(
                `Failed to send message to admin ${adminID}:`,
                error,
              );
            }
          }
        }
        return output.reply(
          `✅ **Pet Tournament has ended!**\n🏆 **Winners have been selected.**\nCheck with the admins for details.`,
        );
      }
      return output.reply(
        `⚠️ **Tournament is now done. Winners have been selected.**`,
      );
    }

    // ── Ongoing Pet Tournament Leaderboard ────────────────
    const topUsers = sortedKeys.slice(0, 3);
    let leaderboard = `📊 **Ongoing Pet Tournament Leaderboard** 📊\n\n`;
    topUsers.forEach((userID, index) => {
      const userData = allData[userID];
      const pet = highestPets[userID];
      const gm = new GearsManage(userData.gearsData || []);
      const gearData = gm.getGearData(pet.key);
      const player = new PetPlayer(pet, gearData);
      leaderboard += `🏅 **#${index + 1} ${userData.name || "Unknown"}**\n`;
      leaderboard += `${player.getPlayerUI()}\n━━━━━━━━━━━━━━━\n`;
    });
    const formattedDeadline = formatTimeWithMoment(deadline);
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
    leaderboard += `\n⏳ **Time Left:** ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
    leaderboard += `\n🕒 **Deadline:** ${formattedDeadline} (Asia/Manila)`;
    return output.reply(leaderboard);
  }
  // ─── MONEY / BATTLEPOINTS MODE ──────────────────────────────
  else {
    if (tournamentEnded || timeLeft <= 0) {
      if (!tournamentEnded) {
        tournamentEnded = true;
        const allUsers = await money.getAll();
        if (!allUsers || Object.keys(allUsers).length === 0) {
          return output.reply(
            `⚠️ **No participants found. Tournament has ended with no winners.**`,
          );
        }
        const sortedUsers = Object.keys(allUsers)
          .filter((userID) => !excludedUsers.includes(userID))
          .map((userID) => ({
            userID,
            name: allUsers[userID].name || "Unknown_User",
            balance: allUsers[userID][currencyKey] || 0,
          }))
          .sort((a, b) => b.balance - a.balance);

        const topUsers = sortedUsers.slice(0, 3);
        const otherParticipants = sortedUsers.slice(3);
        let resultMessage = `🏆 **TOURNAMENT RESULTS** 🏆\n\n`;
        const prizeDistribution = [
          { rank: 1, prize: 100_000_000 },
          { rank: 2, prize: 50_000_000 },
          { rank: 3, prize: 10_000_000 },
        ];
        /**
         * @type {import("cassidy-userData").InventoryItem[]}
         */
        const chequePer = prizeDistribution.map((i) => {
          return {
            name: `Tournament Prize`,
            icon: "🏆",
            flavorText: `Congratulations! You have won the tournament! Rank: #${i.rank}`,
            chequeAmount: i.prize,
            key: "cheque",
          };
        });
        const mapTop = topUsers.map((i) => {
          return {
            ...allUsers[i.userID],
            userID: i.userID,
          };
        });
        for (let i = 0; i < mapTop.length; i++) {
          const user = mapTop[i];
          const inventory = new Inventory(user.inventory || []);

          const cheque = chequePer[i];

          inventory.addOne(cheque);

          await money.set(user.userID, {
            inventory: Array.from(inventory),
          });
        }
        for (let i = 0; i < topUsers.length; i++) {
          const user = topUsers[i];
          resultMessage += `🏅 **TOP ${i + 1} WINNER [ ${formatAmount(
            prizeDistribution[i].prize,
          )} ]**\n`;
          resultMessage += `🔹 **Username**: ${user.name}\n`;
          resultMessage += `🔑 **User ID**: ${user.userID}\n`;
          resultMessage += `━━━━━━━━━━━━━━━\n`;
        }
        if (otherParticipants.length > 0) {
          const eligibleForBonus = otherParticipants.filter(
            (user) => !excludedUsers.includes(user.userID),
          );
          if (eligibleForBonus.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * eligibleForBonus.length,
            );
            const randomWinner = eligibleForBonus[randomIndex];
            resultMessage += `\n🎉 **500 MILLION RANDOM BONUS WINNER** 🎉\n\n`;
            resultMessage += `🔹 **Winner**: ${randomWinner.name}\n`;
            resultMessage += `💰 **Bonus Prize**: ${formatAmount(
              500_000_000,
            )}\n`;
            resultMessage += `🔑 **User ID**: ${randomWinner.userID}\n`;
            resultMessage += `━━━━━━━━━━━━━━━\n`;
          }
        }
        // resultMessage += `\n📢 **ADMIN, PLEASE ISSUE CHEQUES TO THE WINNERS AND SEND THEM!**`;
        resultMessage += `\n✅ **The cheque will be automatially issued to the winners.**`;

        const { ADMINBOT } = Cassidy?.config || {};
        if (ADMINBOT && Array.isArray(ADMINBOT) && ADMINBOT.length > 0) {
          for (const adminID of ADMINBOT) {
            try {
              await output.sendStyled(resultMessage, style, adminID);
            } catch (error) {
              console.error(
                `Failed to send message to admin ${adminID}:`,
                error,
              );
            }
          }
        }

        return output.reply(
          `✅ **Tournament has ended!**\n🏆 **Winners and bonus have been selected.**\nCheck with the admins for details.`,
        );
      }

      return output.reply(
        `⚠️ **Tournament is now done. Winners have been selected.**`,
      );
    }

    // ── Ongoing Leaderboard for Money/BattlePoints Mode ─────────────
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const allUsers = await money.getAll();
    if (!allUsers || Object.keys(allUsers).length === 0) {
      return output.reply(
        `⚠️ **No participants yet. Be the first to join the tournament!**`,
      );
    }

    const topUsers = Object.keys(allUsers)
      .filter((userID) => !excludedUsers.includes(userID))
      .map((userID) => ({
        userID,
        name: allUsers[userID].name || "Unknown_User",
        balance: allUsers[userID][currencyKey] || 0,
      }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 3);

    let leaderboard = `📊 **Ongoing Tournament Leaderboard** 📊\n\n`;
    topUsers.forEach((user, index) => {
      leaderboard += `🏅 **#${index + 1} ${user.name}**\n`;
      leaderboard += `💰 **${
        tournamentMode === "battlePoints" ? "Battle Points" : "Balance"
      }**: ${formatAmount(user.balance)}\n`;
      leaderboard += `━━━━━━━━━━━━━━━\n`;
    });

    const formattedDeadline = formatTimeWithMoment(deadline);
    leaderboard += `\n⏳ **Time Left:** ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
    leaderboard += `\n🕒 **Deadline:** ${formattedDeadline} (Asia/Manila)`;

    return output.reply(leaderboard);
  }
}

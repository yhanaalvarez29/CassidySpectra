// @ts-check
import {
  getWelcomeCardStream,
  listArrayStr,
  UNISpectra,
} from "@cassidy/unispectra";

export const meta = {
  name: "logsBot",
  author: "MRKIMSTERS & Liane Cagara 🎀",
  description:
    "Logs events when the bot is added to or removed from groups, notifying only admins.",
  version: "1.4",
  supported: "^1.0.0",
  type: "plugin",
  category: "events",
  after: ["output", "input"],
  order: 100,
};

const { Cassidy } = global;

/**
 *
 * @param {CommandContext} obj
 * @returns
 */
export async function use(obj) {
  const { next, api, event, output, input, prefix, threadsDB, money } = obj;

  if (!input.isFacebook) {
    return obj.next();
  }

  async function handleAdd() {
    try {
      if (
        input.is("event") &&
        input.getProperty("logMessageType") === "log:subscribe"
      ) {
        const { threadID, author } = input;
        await money.ensureUserInfo(author);
        const authorData = await money.getCache(author);
        /**
         * @type {{ addedParticipants: { userFbId: string; fullName: string; }[] }}
         */
        const logMessageData = input.getProperty("logMessageData");
        const dataAddedParticipants = logMessageData?.addedParticipants || [];

        if (!dataAddedParticipants.length) return;
        const authorName =
          authorData.userMeta?.name ?? authorData.name ?? "Unknown User";
        if (
          dataAddedParticipants.some(
            (item) => item.userFbId === api.getCurrentUserID()
          )
        ) {
          return output.sendStyled(
            `${UNISpectra.arrow} ***Connected Successfully!*** ✅\n\nThanks for adding me to this group. Type **${prefix}menu** without fonts to see the list of available commands.\n\n🎀 **Added By**: ${authorName}`,
            {
              title: global.Cassidy.logo,
              contentFont: "fancy",
              titleFont: "bold",
            }
          );
        }

        await threadsDB.ensureThreadInfo(input.tid, api);
        const { threadInfo } = await threadsDB.getItem(input.tid);
        if (!threadInfo) {
          throw new Error("Missing thread info.");
        }

        const userName = dataAddedParticipants.map((user) => user.fullName);
        /**
         * @type {import("output-cassidy").StrictOutputForm["mentions"]}
         */
        const mentions = dataAddedParticipants.map((user) => ({
          tag: user.fullName,
          id: user.userFbId,
        }));

        if (!userName.length) return;
        const philippineTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          hour12: false,
          hour: "2-digit",
        });

        const hours = parseInt(philippineTime, 10);

        const session =
          hours <= 10
            ? "Morning"
            : hours <= 12
            ? "Noon"
            : hours <= 18
            ? "Afternoon"
            : "Evening";
        let image;
        try {
          await money.ensureUserInfo(dataAddedParticipants[0].userFbId);
          const firstUser = await money.getCache(
            dataAddedParticipants[0].userFbId
          );
          image = await getWelcomeCardStream({
            name: listArrayStr(userName),
            avatar: firstUser?.userMeta?.image,
            countText: `${(input.participantIDs ?? []).length} Members`,
            main: `Welcome to ${threadInfo.threadName}.`,
          });
        } catch (error) {
          console.error(error);
        }
        return output.sendStyled(
          {
            body: `Hello ${listArrayStr(userName)}. Welcome to ${
              threadInfo.threadName
            }! Have a nice ${session}.\n\n🎀 **Added By**: ${authorName}`,
            mentions,
            ...(image
              ? {
                  attachment: image,
                }
              : {}),
          },
          {
            title: global.Cassidy.logo,
            contentFont: "fancy",
            titleFont: "bold",
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  await handleAdd();
  try {
    if (
      (input.getProperty("logMessageType") === "log:subscribe" &&
        event.logMessageData.addedParticipants.some(
          (item) => item.userFbId === api.getCurrentUserID()
        )) ||
      (event.logMessageType === "log:unsubscribe" &&
        event.logMessageData.leftParticipantFbId === api.getCurrentUserID())
    ) {
      if (event.author === api.getCurrentUserID()) return;

      const time = new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      let threadName = "Unknown Group";
      let messageLog = "";

      if (event.logMessageType === "log:subscribe") {
        threadName =
          (await api.getThreadInfo(event.threadID))?.threadName || threadName;
        const authorName = await api
          .getUserInfo(event.author)
          .then((data) => data[event.author]?.name || "Unknown User");
        messageLog += `\n\n✅\n***Event***: Bot has been added to a new group\n- ***Added by***: ${authorName}`;
      }

      if (event.logMessageType === "log:unsubscribe") {
        threadName =
          (await api.getThreadInfo(event.threadID))?.threadName || threadName;
        const authorName = await api
          .getUserInfo(event.author)
          .then((data) => data[event.author]?.name || "Unknown User");
        messageLog += `\n❌\n***Event***: Bot has been removed from a group\n- ***Removed by***: ${authorName}`;
      }

      messageLog += `\n- ***User ID***: ${event.author}\n- ***Group***: ${threadName}\n- ***Group ID***: ${event.threadID}\n- ***Time***: ${time}`;

      const { ADMINBOT = [], MODERATORBOT = [] } = Cassidy?.config || {};
      const staffs = [...ADMINBOT, MODERATORBOT];
      if (!staffs || !Array.isArray(staffs) || staffs.length === 0) {
        return console.warn("No admins configured to receive logs.");
      }

      for (const adminID of ADMINBOT) {
        if (!money.isNumKey(adminID)) {
          continue;
        }
        await output.sendStyled(
          messageLog,
          {
            title: "Thread Logs 🔍",
            titleFont: "bold",
            contentFont: "fancy",
          },
          adminID
        );
      }
    }
  } catch (error) {
    console.error("Error in logsBot:", error);
  }
  next();
}

const { getStreamFromURL } = global.utils;

export default defineCommand({
  meta: {
    name: "pair",
    otherNames: ["pairing"],
    author: "Monsterwith",
    version: "1.0.0",
    description: "pair with random people 😗",
    usage: "{prefix}{name}",
    category: "Fun",
    noPrefix: false,
    role: 0,
    waitingTime: 10,
  },

  async entry({ input, output, usersDB }) {
    const uidI = input.senderID;
    await usersDB.ensureUserInfo(uidI);
    const user1 = await usersDB.getItem(uidI);
    const avatarUrl1 = user1.userMeta.image;
    const name1 = user1.userMeta?.name ?? user1.name ?? "Unregistered";
    const members = input.participantIDs ?? [];

    if (members.length === 0) {
      return output.reply("There are no members in the group ☹💕😢");
    }

    const eligibleMembers = members.filter(
      (member) => member !== uidI && member !== input.senderID
    );
    if (eligibleMembers.length === 0) {
      return output.reply(
        "There are no male/female members in the group ☹💕😢"
      );
    }

    const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
    const randomMember = eligibleMembers[randomIndex];
    await usersDB.ensureUserInfo(randomMember);
    const user2 = await usersDB.getItem(randomMember);
    const name2 = user2.userMeta?.name ?? user2.name ?? "Unregistered";
    const avatarUrl2 = user2.userMeta?.image;

    const randomNumber1 = Math.floor(Math.random() * 36) + 65;
    const randomNumber2 = Math.floor(Math.random() * 36) + 65;
    let img1: any, img2: any;
    try {
      img1 = await getStreamFromURL(avatarUrl1);
    } catch (error) {
      await usersDB.saveUserInfo(uidI);
      try {
        img1 = await getStreamFromURL(
          (
            await usersDB.getItem(uidI)
          ).userMeta?.image
        );
      } catch (error) {}
    }
    try {
      img2 = await getStreamFromURL(avatarUrl2);
    } catch (error) {
      await usersDB.saveUserInfo(randomMember);
      try {
        img2 = await getStreamFromURL(
          (
            await usersDB.getItem(randomMember)
          ).userMeta?.image
        );
      } catch (error) {}
    }

    return output.reply({
      body: `• Everyone congratulates the new husband and wife:
❤ ***${name1}*** 💕 ***${name2}*** ❤
**Love percentage**: "${randomNumber1} % 🤭"
**Compatibility ratio**: "${randomNumber2} % 💕"

Congratulations 💝`,
      ...(!input.isWeb ? {} : { attachment: [img1, img2].filter(Boolean) }),
    });
  },
});

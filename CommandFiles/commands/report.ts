export default easyCMD({
  name: "report",
  description: "Reports a message to bot admins.",
  title: "📝 Report to Admin",
  category: "Utilities",
  meta: {
    cooldown: 120,
    otherNames: ["re"],
    usage: "report <message>",
    fbOnly: true,
    author: "Liane Cagara",
  },
  async run({ output, args, userName, input }) {
    const message = args.join(" ");
    if (!message) {
      return output.send("⚠️ Please provide a message to report.");
    }
    const time = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    for (const id of Cassidy.config.ADMINBOT) {
      await output.sendStyled(
        `*Report from ${userName}*:\n\n${message}\n\n🔍 ***User ID***: ${input.sid}\n📅 ***Time***: ${time}`,
        {
          title: "‼️ Admin Report",
        },
        id
      );
    }
    output.reply("✅ Your report has been sent to the admins.");
    output.react("✅");
  },
});

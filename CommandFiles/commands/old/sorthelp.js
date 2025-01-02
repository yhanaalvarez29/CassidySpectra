export const meta = {
  name: "sorthelp",
  description: "Sorts help list by name or its category.",
  author: "Liane",
  version: "1.0.0",
  usage: "{prefix}{name}",
  category: "System",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
};
export const style = {
  title: "📚 Sort Help",
  titleFont: "bold",
  contentFont: "fancy",
};
export async function entry({ input, output, threadConfig }) {
  const valid = ["name", "category"];
  if (!valid.includes(input.arguments[0])) {
    return output.syntaxError();
  }
  await threadConfig.setInfo(input.threadID, { sortHelp: input.arguments[0] });
  return output.reply(
    `✅ Successfully sorted help list by "${input.arguments[0]}"`,
  );
}

import axios from "axios";
import baybayin from "baybayin-transliterator";

export const meta = {
  name: "baybayin",
  description: "Convert text into baybayin",
  version: "2.5.0",
  usage: "<prefix>baybayin <query>",
  author: "Liane Cagara",
  category: "Utilities",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 2,
  shopPrice: 100,
  requirement: "2.5.0",
  icon: "✏️",
};

export const style = {
  title: "Baybayin ✏️",
  titleFont: "bold",
  contentFont: "fancy",
};

export async function entry({ input, output }) {
  const trans = input.arguments.join(" ");
  if (!trans) {
    return output.reply(
      `✏️ | Please provide a word or a sentence to translate into baybayin`
    );
  }
  return output.reply(`**Result:**\n\n${baybayin(trans).baybayin}`);
}

/*@Liane ikaw na bahala irefix to ulit*/

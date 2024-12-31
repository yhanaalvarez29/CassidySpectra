import axios from "axios";

export const meta = {
  name: "baybayin",
  description: "Convert text into baybayin",
  version: "1.0.1",
  usage: "<prefix>baybayin <query>",
  author: "Deku",
  category: "translator",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 2,
  shopPrice: 100,
};
export async function entry({ input, output }) {
  const trans = input.arguments.join(" ");
  if (!trans) {
    return output.reply(
      `Please provide a word or a sentence to translate into baybayin`,
    );
  }
  try {
    if (!input.isWeb) {
      output.reply(`Translating the word ${trans} into baybayin`);
    }
    const response = await axios.get(
      `https://deku-rest-api-3ijr.onrender.com/api/baybay?q=${trans}`,
    );
    const reply = response.data.result;

    output.reply(`Translation Complete!!
    Original: ${trans}
    Translated: ${reply}`);
  } catch (error) {
    console.log(error);
    output.error(error);
  }
}

/*@Liane ikaw na bahala irefix to ulit*/

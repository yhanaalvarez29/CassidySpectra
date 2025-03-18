import axios from "axios";

export const meta = {
  name: "aria",
  version: "1.0.0",
  author: "AkhiroDEV",
  permissions: [0],
  category: "Social",
  description: "Talk to Aria AI.",
  //-- Cassidy 2.5.0 --//
  icon: global.Cassidy.redux ? "💗" : null,
};

export const style = {
  title: global.Cassidy.redux ? "Aria 💗" : "💗 Aria",
  titleFont: "bold",
  contentFont: "fancy",
};

export async function entry({ output, args, input, event }) {
  const user = args.join(" ");
  if (!user) {
    return output.reply("Query please");
  }
  try {
    const me = await axios.get(
      "https://akhirosites-production.up.railway.app/aria",
      {
        params: {
          q: user,
          userid: event.senderID,
        },
      }
    );

    const res = me.data.response;
    return output.reply(`${res}\n\nAuthor: **${me.data.author}**`);
  } catch (error) {
    output.error(error);
  }
}

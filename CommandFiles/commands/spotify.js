import axios from "axios";
import fs from "fs";
const tools = global.require("betabotz-tools");
const { spotify, spotifydl } = tools;

export const meta = {
  name: "spt",
  permissions: [0],
  author: "DEKU",
  version: "1.0.2",
  noPrefix: false,
  description: "Play and Download music from Spotify.",
  noWeb: true
};

export async function entry({ api, event, args , input, output }) {
  return output.reply(`This command has been deprecated.`);
  try {
    let q = args.join(" ");
    let path = `CommandFiles/cache/${event.senderID}_${Math.random()}`;
    
    if (!q)
      return api.sendMessage(
        "[ ❗ ] - Missing title of the song",
        event.threadID,
        event.messageID,
      );

    api.sendMessage(
      "[ 🔍 ] Searching for “" + q + "” ...",
      event.threadID,
      async (err, info) => {
        try {
          const r = await axios.get("https://lyrist.vercel.app/api/" + q);
          const { lyrics, title } = r.data;
          const results = await spotify(encodeURI(q));
          /*output.reply(JSON.stringify(results));*/

          let url = results.result.data[0].url;

          const result1 = await spotifydl(url);

          const dl = (
            await axios.get(result1.result, { responseType: "arraybuffer" })
          ).data;
          fs.writeFileSync(path, Buffer.from(dl, "utf-8"));
          api.sendMessage(
            {
              body:
                "·•———[ SPOTIFY DL ]———•·\n\n" +
                "Title: " +
                title +
                "\nLyrics:\n\n" +
                lyrics +
                "\n\nYou can download this audio by clicking this link or paste it to your browser: " +
                result1.result,
              attachment: fs.createReadStream(path),
            },
            event.threadID,
            (err, info) => {
              fs.unlinkSync(path);
            },
          );
        } catch (error) {
          console.error(error);
          api.sendMessage(`❌ An error occured, the error is "${error.message}", you can locate it in ${error.stack}`,
            event.threadID,
          );
        }
      },
    );
  } catch (s) {
    api.sendMessage(s.message, event.threadID);
  }
}

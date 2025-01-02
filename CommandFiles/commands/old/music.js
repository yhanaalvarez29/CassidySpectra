import path from "path";
import fs from "fs";
import ytdl from "ytdl-core";
import yts from "yt-search";

export const meta = {
  name: "music",
  role: 0,
  version: "1.0.0",
  permissions: [0],
  author: "Kshitiz | AkhiroDEV | Cliff | Liane (convert)",
  noPrefix: "both",
  description: "Music commands",
  usage: "music [ query ]",
  category: "Fun",
  noWeb: true,
};
export const style = {
  title: "🎵 Music Player",
  titleFont: "bold",
  contentFont: "fancy",
};
export async function entry({ input, output, api }) {
  const musicName = input.arguments.join(" ");
  if (!musicName) {
    output.reply(
      `To get started, type music and the title of the song you want.`,
    );
    return;
  }
  try {
    const i = await output.reply(`🔎 | Searching for "${musicName}"...`);
    const searchResults = await yts(musicName);
    if (!searchResults.videos.length) {
      return output.reply("Can't find the search.");
    } else {
      const music = searchResults.videos[0];
      const musicUrl = music.url;
      const stream = ytdl(musicUrl, { filter: "audioonly" });
      const time = new Date();
      const timestamp = time.toISOString().replace(/[:.]/g, "-");
      const filePath = `CommandFiles/commands/cache/${input.senderID}.mp3`;
      stream.pipe(fs.createWriteStream(filePath));
      stream.on("response", () => {});
      stream.on("info", (info) => {});
      stream.on("end", async () => {
        if (fs.statSync(filePath).size > 25000000) {
          fs.unlinkSync(filePath);
          return output.reply(
            "The file could not be sent because it is larger than 25MB.",
          );
        }
        const message = {
          body: `${music.title}`,
          attachment: fs.createReadStream(filePath),
        };
        await output.edit(message.body, i.messageID);
        await api.sendMessage(
          { attachment: message.attachment },
          input.threadID,
          () => {},
          input.messageID,
        );
        fs.unlinkSync(filePath);
      });
    }
  } catch (error) {
    output.reply("An error occurred while processing your request.");
  }
}

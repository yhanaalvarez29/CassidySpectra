import moment from "moment-timezone";
import { defineEntry } from "@cass/define";

export const meta = {
  name: "anime",
  description: "Search for anime information",
  author: "MrkimstersDev",
  version: "1.0.0",
  usage: "{prefix}{name} <anime title>",
  category: "Entertainment",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["ani"],
  icon: "🎬",
  noLevelUI: true,
};

export const style = {
  title: "Astral • Anime Search 🌌",
  titleFont: "bold",
  contentFont: "fancy",
};

const langs = {
  en: {
    noQuery: "Please provide an anime title to search for!\nExample: {prefix}anime Sacrificial Princess and King of the Beast",
    noResults: "No anime found with that title!",
    error: "Error fetching anime data: %1",
    invalidSelection: "Please select a valid number between 1 and 20!",
  },
};

function getLang(key, ...args) {
  let text = langs.en[key] || "";
  args.forEach((arg, i) => {
    text = text.replace(`%${i + 1}`, arg);
  });
  return text;
}

async function fetchAnimeData(query) {
  const apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`;
  const response = await fetch(apiUrl);
  return await response.json();
}

function formatAnimeList(results) {
  const timestamp = moment().tz("Asia/Manila").format("MMMM D, YYYY h:mm A");
  const list = results.map((anime, index) => 
    ` • ${index + 1}. ${anime.title} (${anime.type}, ${anime.episodes || "N/A"} eps)`
  ).join("\n");

  return `✦ 𝖳𝖾𝗆𝗉𝗈𝗋𝖺𝗅 𝖢𝗈𝗈𝗋𝖽𝗂𝗇𝖺𝗍𝖾𝗌
 • 📅 ${timestamp}
━━━━━━━━━━━━━━━
✦ 𝖠𝗇𝗂𝗆𝖾 𝖲𝖾𝖺𝗋𝖼𝗁 𝖱𝖾𝗌𝗎𝗅𝗍𝗌
${list}
━━━━━━━━━━━━━━━
✦ 𝖱𝖾𝗉𝗅𝗒 𝗐𝗂𝗍𝗁 𝖺 𝗇𝗎𝗆𝖻𝖾𝗋 (1-20) 𝗍𝗈 𝗌𝖾𝗅𝖾𝖼𝗍
✦ 𝖢𝖺𝗌𝗌𝗂𝖽𝗒𝖠𝗌𝗍𝗋𝖺𝗅-𝖬𝗂𝖽𝗇𝗂𝗀𝗁𝗍 🌃 ✦
[ 𝖳𝗋𝖺𝗇𝗌𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝖿𝗋𝗈𝗆 𝖠𝗌𝗍𝗋𝖺𝗅 𝖢𝗈𝗆𝗆𝖺𝗇𝖽 ]`;
}

function formatAnimeDetails(anime) {
  const timestamp = moment().tz("Asia/Manila").format("MMMM D, YYYY h:mm A");
  return `✦ 𝖳𝖾𝗆𝗉𝗈𝗋𝖺𝗅 𝖢𝗈𝗈𝗋𝖽𝗂𝗇𝖺𝗍𝖾𝗌
 • 📅 ${timestamp}
━━━━━━━━━━━━━━━
✦ 𝖠𝗇𝗂𝗆𝖾 𝖣𝖾𝗍𝖺𝗂𝗅𝗌
 • 🎬 𝖳𝗂𝗍𝗅𝖾: ${anime.title}
 • 📝 𝖣𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇: ${anime.synopsis || "No description available"}
 • 📅 𝖲𝗍𝖺𝗍𝗎𝗌: ${anime.status}
 • 🎭 𝖳𝗒𝗉𝖾: ${anime.type}
 • 📺 𝖤𝗉𝗂𝗌𝗈𝖽𝖾𝗌: ${anime.episodes || "N/A"}
 • ⏱️ 𝖣𝗎𝗋𝖺𝗍𝗂𝗈𝗇: ${anime.duration || "N/A"}
━━━━━━━━━━━━━━━
✦ 𝖢𝖺𝗌𝗌𝗂𝖽𝗒𝖠𝗌𝗍𝗋𝖺𝗅-𝖬𝗂𝖽𝗇𝗂𝗀𝗁𝗍 🌃 ✦
[ 𝖳𝗋𝖺𝗇𝗌𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝖿𝗋𝗈𝗆 𝖠𝗌𝗍𝗋𝖺𝗅 𝖢𝗈𝗆𝗆𝖺𝗇𝖽 ]`;
}

export const entry = defineEntry(async ({ api, event, input, output, args }) => {
  try {
    const message = args.join(" ").trim();

    if (!message) {
      return output.reply(getLang("noQuery"));
    }

    const data = await fetchAnimeData(message);

    if (!data || !data.data || data.data.length === 0) {
      return output.reply(getLang("noResults"));
    }

    const results = data.data.slice(0, 20);
    const messageInfo = await output.reply(formatAnimeList(results));
    
    input.setReply(messageInfo.messageID, {
      key: "anime",
      id: input.senderID,
      results,
    });

  } catch (error) {
    output.reply(getLang("error", error.message));
  }
});

export async function reply({ input, output, repObj, detectID }) {
  const { id, results } = repObj;
  
  if (input.senderID !== id || !results) {
    return;
  }

  const selection = parseInt(input.body);
  if (isNaN(selection) || selection < 1 || selection > 20) {
    return output.reply(getLang("invalidSelection"));
  }

  const selectedAnime = results[selection - 1];
  if (!selectedAnime) {
    return output.reply(getLang("invalidSelection"));
  }

  input.delReply(detectID);
  
  output.reply({
    body: formatAnimeDetails(selectedAnime),
    attachment: await global.utils.getStreamFromURL(selectedAnime.images.jpg.large_image_url)
  });
}
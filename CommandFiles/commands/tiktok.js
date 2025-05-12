// CommandFiles/commands/tiktok.js

// @ts-check
export const meta = {
  name: "tiktok",
  description: "Searches for TikTok videos based on your query and sends a video.",
  author: "MrKimstersDev | haji-mix-api",
  version: "1.0.0",
  usage: "{prefix}{name} <search query>",
  category: "Media",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 10,
  requirement: "3.0.0",
  otherNames: ["tt", "tiktoksearch"],
  icon: "🎵",
  noLevelUI: true,
  noWeb: true,
};

export const style = {
  title: "TikTok Video 🎵",
  titleFont: "bold",
  contentFont: "fancy",
};

import { defineEntry } from "@cass/define";

export const entry = defineEntry(
  async ({ api, event, input, output, args, prefix, commandName }) => {
    const BASE_API_URL = "https://haji-mix-api.gleeze.com/api/tiktok";
    const query = input.arguments.join(" ") || "";

    // Check if a search query is provided
    if (!query) {
      await output.reply(
        `***Guide***\n\nPlease provide a search query. **Example**: ${prefix}${commandName} Demon Slayer edits`
      );
      return;
    }

    try {
      await output.reply(`🔎 | Searching TikTok for "${query}"...\n⏳ | Please **wait**...🎵`);

      // Construct the API URL with the user's query
      const apiUrl = `${BASE_API_URL}?search=${encodeURIComponent(query)}&stream=true`;

      // Use output.attach to send the video directly
      await output.attach(
        `Here's your TikTok video for "${query}"! 🎬✨`,
        apiUrl
      );
    } catch (error) {
      console.error("Entry error:", error.message);
      await output.reply(`❌ | Error fetching TikTok video: ${error.message}`);
    }
  }
);

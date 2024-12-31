import fs from "fs";
import path from "path";
import axios from "axios";

export const meta = {
  name: "emi",
  otherNames: [],
  author: "Vex_Kshitiz",
  version: "2.0.0",
  waitingTime: 20,
  permissions: [0, 1, 2],
  description: "Generates an image ",
  category: "fun",
  usage: "{p}anigen <prompt>",
  noPrefix: false,
  noWeb: true,
};
export async function entry({ output, args }) {
  output.reaction("🕐");
  try {
    const prompt = args.join(" ");
    const emiApiUrl = "https://emi-gen-qec2.onrender.com/emi";

    const emiResponse = await axios.get(emiApiUrl, {
      params: {
        prompt: prompt,
      },
      responseType: "arraybuffer",
    });

    const cacheFolderPath = path.join(__dirname, "/cache");
    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }
    const imagePath = path.join(
      cacheFolderPath,
      `${Date.now()}_generated_image.png`,
    );
    fs.writeFileSync(imagePath, Buffer.from(emiResponse.data, "binary"));

    const stream = fs.createReadStream(imagePath);
    output.reply({
      body: "",
      attachment: stream,
    });
  } catch (error) {
    console.error("Error:", error);
    output.error(error);
  }
}

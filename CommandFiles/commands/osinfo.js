import os from 'os';

// Define the metadata for the command
export const meta = {
  name: "osinfo",
  author: "ChatGPT 3.5",
  description: "Get information about the operating system",
  usage: "{prefix}osinfo",
  category: "Utility",
  version: "1.0.1",
  permissions: [0], // No special permissions required
  noPrefix: false,
};

// Define the entry function for the command
export async function entry({ output, test }) {
  try {
    // Retrieve information about the operating system
    const osInfo = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      architecture: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
    };

    // Compose a message with the OS information
    const message = `Platform: ${osInfo.platform}\nType: ${osInfo.type}\nRelease: ${osInfo.release}\nArchitecture: ${osInfo.architecture}\nHostname: ${osInfo.hostname}\nUptime: ${osInfo.uptime.toFixed(2)} seconds`;

    // Reply with the OS information
    output.reply(message);
  } catch (error) {
    console.error("Error fetching OS information:", error);
    // Handle errors appropriately
    output.reply("Sorry, I couldn't retrieve information about the operating system at the moment.");
  }
}


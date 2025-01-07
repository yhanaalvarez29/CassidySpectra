const axios = require("axios");
let status = true;

const style = {
  titleStyle: {
    text_font: "typewriter",
    line_bottom: "none",
    line_bottom_akhiro: "13chars",
  },
  contentStyle: {
    text_font: "none",
    line_bottom: "none",
    line_bottom_inside_x: "none",
  },
};

const defStyle = {
  title: "Cassidy Bot",
};

module.exports = {
  config: {
    name: "autocass",
    version: "1.0",
    author: "LiANE @nealianacagara",
    role: 0,
    category: "Ai-Chat",
    shortDescription: {
      en: ``,
    },
    longDescription: {
      en: ``,
    },
    guide: {
      en: "{pn} [query]",
    },
  },
  onStart() {},
  async onChat({ message, event, api }) {
    if (!event.body?.toLowerCase().startsWith("#")) {
      return;
    }
    const timeA = Date.now();
    if (!status) return;
    try {
      event.prefixes = ["#"];

      if (
        event.type === "message_reply" &&
        api.getCurrentUserID() === event.messageReply.senderID
      ) {
        return;
      }
      const response = await axios.get(
        "https://cassidyredux.onrender.com/postWReply",
        { params: event }
      );
      const {
        result: { body, messageID },
        status: estatus,
        result,
      } = response.data;
      if (estatus === "fail") {
        return;
      }
      const timeB = Date.now();
      message.reply(`${body}\n\nPing: ${timeB - timeA}ms`, (_, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "autocass",
          author: event.senderID,
          result,
        });
      });
    } catch (error) {}
  },
  async onReply({ Reply, message, event }) {
    const timeA = Date.now();
    const { author, result: messageReply } = Reply;

    messageReply.body = "";

    event.prefixes = ["#"];
    event.strictPrefix = true;
    const response = await axios.get(
      "https://cassidyredux.onrender.com/postWReply",
      { params: { ...event, messageReply } }
    );
    const {
      result: { body, messageID },
      status: estatus,
      result,
    } = response.data;
    if (estatus === "fail") {
      return;
    }
    const timeB = Date.now();
    message.reply(`${body}\n\nPing: ${timeB - timeA}ms`, (_, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "autocass",
        author: event.senderID,
        result,
      });
    });
  },
};

export function convertEvent(pageObject) {
  const pageEvent = pageObject.entry[0];
  const { message } = pageEvent;
  const { reaction } = message;
  const event = {
    pageObject: message,
    type: reaction
      ? "message_reaction"
      : message.reply_to
        ? "message_reply"
        : "message",
    senderID: reaction ? pageEvent.recipient.id : pageEvent.sender.id,
    timestamp: pageEvent.time || pageEvent.timestamp,
    body: reaction ? "" : message.text,
    userID: reaction ? pageEvent.sender.id : null,
    messageID: reaction ? reaction.mid : message.mid,
    isPage: true,
    messageReply: {
      ...message.reply_to,
      messageID: message.reply_to.mid,
    },
    attachments: {
      ...message.attachments,
    },
    isWeb: false,
    fromWebhook: true,
    reaction: reaction.action === "react" ? reaction.emoji : "",
  };
  return event;
}
// this thing is also made by Liane Cagara for the sake of consistent structure

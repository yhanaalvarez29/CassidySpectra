export default easyCMD({
  name: "gpt",
  meta: {
    otherNames: ["gpt4o", "ai", "ask"],
    author: "From Haji Mix REST API",
    description:
      "A versatile assistant that provides information, answers questions, and assists with a wide range of tasks.",
    icon: "🤖",
    noPrefix: "both",
  },
  title: {
    content: "GPT-4O FREE",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "none",
  },
  async run({ output, args, commandName, prefix, input }) {
    const ask = args.join(" ");
    if (!ask) {
      return output.reply(
        `🔎 Please provide a question for **gpt**.\n\n***Example*** ${prefix}${commandName} what is tralalero tralala?`
      );
    }

    const res: ResponseType = await output.req(
      "https://haji-mix.up.railway.app/api/gpt4o",
      {
        uid: input.sid,
        roleplay: "",
        ask,
      }
    );

    return output.reply(res.answer);
  },
});

export interface ResponseType {
  user_ask: string;
  answer: string;
}

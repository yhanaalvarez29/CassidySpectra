// @ts-check
import { Pinger } from "@cass-modules/pinger";
import { CassTypes } from "@cass-modules/type-validator";
import { defineEntry } from "@cass/define";
import { SpectralCMDHome } from "@cassidy/spectral-home";
import { Inventory } from "@cassidy/ut-shop";

export const meta = {
  name: "hi",
  author: "Liane Cagara",
  otherNames: ["hello", "hey"],
  version: "1.0.0",
  description: "Testing?",
  usage: "{prefix}{name}{property}<message>",
  category: "System",
  permissions: [0, 1, 2],
  waitingTime: 5,
  noPrefix: false,
  whiteList: null,
  ext_plugins: {
    requester: "^1.2.0",
  },
};

/**
 * @type {Record<string, CommandEntry>}
 */
const entryConf = {
  async test({ input, output, commandName }) {
    if (input.arguments[0] === "Error" && input.arguments[1]) {
      throw new Error(input.arguments.slice(1).join(" "));
    }
    const messageInfo = await output.reply(
      "Hello wazzup, you said " +
        (input.arguments.join(" ") || "none.") +
        "\nYour sender ID is " +
        input.senderID +
        " and thread id is: " +
        input.threadID
    );

    output.reaction("💜");
    input.setReply(messageInfo.messageID, {
      key: commandName,
    });
  },
  async debug({ output, input }) {
    output.reply(JSON.stringify(input, null, 2));
  },
  async dbtest({ money, threadsDB, output }) {
    /**
     * @type {[string, Partial<UserData>]}
     */
    const payload = [
      "test",
      {
        name: "Test",
        money: 69,
      },
    ];
    const pinger1 = new Pinger();
    pinger1.recordPing();
    await money.set(...payload);
    const ping1 = pinger1.getLastPing();

    const pinger2 = new Pinger();
    pinger2.recordPing();
    await money.setItem(...payload);
    const ping2 = pinger2.getLastPing();

    return output.reply(`money.set: ${ping1}\nmoney.setItem: ${ping2}`);
  },
  async dbtest2({ money, output, input }) {
    const items = await money.getItem(input.sid);

    items.inventory.at(0);
  },
  async typetest({ money, output, input }) {
    const schema = new CassTypes.Validator({
      inv: Inventory,
      name: "string",
      test: "function",
    });

    const invv = new Inventory();

    schema.validate({ test: () => {}, inv: invv, name: "HAHA" });
  },
};

const home = new SpectralCMDHome({
  entryConfig: entryConf,
});

export const entry = defineEntry((ctx) => home.runInContext(ctx));

/**
 *
 * @param {CommandContext & { detectID: string }} param0
 */
export async function reply({ output, repObj, input, detectID, commandName }) {
  input.delReply(detectID);
  const messageInfo = await output.reply(
    `Why the hell are you replying to me?`
  );
  output.reaction("😭");
  input.setReply(messageInfo.messageID, {
    key: commandName,
  });
}

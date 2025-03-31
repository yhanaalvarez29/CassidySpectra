import {
  SpectralCMDHome,
  CassCheckly,
  Config,
} from "../modules/spectralCMDHome";
import { UNIRedux, UNISpectra } from "../modules/unisym.js";

export const meta: CassidySpectra.CommandMeta = {
  name: "setprefix",
  description: "Set or view the command prefix",
  otherNames: ["pfx", "changeprefix", "sprefix", "pref"],
  version: "1.0.0",
  usage: "{prefix}{name} [newPrefix]",
  category: "Utility",
  author: "Liane Cagara",
  permissions: [0],
  noPrefix: "both",
  waitingTime: 0,
  requirement: "3.0.0",
  icon: "🔧",
};

export const style = {
  title: "🔧 Prefix",
  titleFont: "bold",
  contentFont: "fancy",
};

const configs: Config[] = [
  {
    key: "view",
    description: "View the current prefix",
    aliases: ["-v", "show"],
    icon: "👀",
    async handler(
      { output, prefix, prefixes, threadsDB, input, commandName },
      { itemList }
    ) {
      const currentPrefix = prefix;
      const { threadPrefix } = await threadsDB.getUser(input.threadID);

      output.reply(
        `${UNIRedux.charm} **Current Prefix**:\n${currentPrefix}\n\n` +
          `${UNIRedux.arrowFromT} **Extra Prefixes**:\n[ ${prefixes.join(
            ", "
          )} ]\n\n` +
          (threadPrefix
            ? `${UNIRedux.arrowFromT} **Custom Prefix**:\n${threadPrefix}\n\n`
            : "") +
          `${UNIRedux.arrow} ***All Options***:\n\n${itemList}\n\n` +
          `Use **${currentPrefix}${commandName}-set [newPrefix]** to set a custom prefix.`
      );
    },
  },
  {
    key: "set",
    description: "Set a new command prefix",
    args: ["[newPrefix]"],
    aliases: ["-s"],
    icon: "✏️",
    validator: new CassCheckly([
      {
        index: 0,
        type: "string",
        required: true,
        name: "newPrefix",
        regex: /^[^\s]{1,5}$/,
      },
    ]),
    async handler({ input, output, prefix, threadsDB }, { spectralArgs }) {
      const newPrefix = spectralArgs[0];

      try {
        await threadsDB.set(input.threadID, { threadPrefix: newPrefix });
        output.reply(
          `${UNIRedux.arrow} ***Prefix Updated*** ✅\n\n` +
            `${prefix} ${UNISpectra.nextArrow} ${newPrefix}\n\n` +
            `${UNISpectra.arrowFromT} Type **${newPrefix}start** to view the list of available commands!`
        );
      } catch (error) {
        output.error(error);
      }
    },
  },
  {
    key: "reset",
    description: "Reset prefix to default",
    aliases: ["-r"],
    icon: "🔄",
    async handler({ input, output, threadsDB }) {
      const defaultPrefix = global.Cassidy.config.PREFIX;

      try {
        await threadsDB.remove(input.threadID, ["threadPrefix"]);
        await output.reply(
          `${UNIRedux.arrow} ***Prefix Reset*** ✅\n\n` +
            `${UNIRedux.arrowFromT} Now using **default**: ${defaultPrefix}`
        );
      } catch (error) {
        output.error(error);
      }
    },
  },
];

const home = new SpectralCMDHome(
  {
    argIndex: 0,
    isHypen: true,
    globalCooldown: 3,
    defaultKey: "view",
    errorHandler: (error, ctx) => {
      ctx.output.error(error);
    },
    defaultCategory: "Utility",
  },
  configs
);

export async function entry(ctx: CommandContextOG) {
  return home.runInContext(ctx);
}

import _ from "lodash";
import { packageInstallerErr } from "../../handlers/loaders/util.js";
import util from "util";

export const meta = {
  name: "eval",
  author: "Liane",
  description: "Evaluate JavaScript code",
  usage: "eval [code]",
  version: "1.0.3",
  permissions: [2],
  botAdmin: true,
  noPrefix: false,
  requirement: "2.5.0",
  icon: "💻",
  waitingTime: 0.01,
  category: "Utilities",
};

export async function entry(context) {
  const {
    api,
    event,
    args,
    output,
    input,
    userInfos,
    threadConfig,
    commandName,
    command,
    commands,
    prefix,
    icon,
    money,
    Inventory,
    Collectibles,
    BulkUpdater,
    ItemLister,
    PageSlicer,
    GearsManage,
  } = context;

  if (!args[0]) {
    await output.reply("⚠️ Please provide JavaScript code to evaluate.");
    return;
  }
  async function out(data) {
    let str = data;
    if (typeof data !== "string") {
      data = JSON.stringify(data, null, 2);
    }
    if (!data) {
      data = String(data);
    }
    return output.reply({ body: data });
  }

  try {
    let result;
    while (true) {
      try {
        const code = args.original.join(" ");
        const func = new Function(
          "out",
          ...Object.keys(context),
          `return (async() => { ${code} })()`
        );
        result = await func(out, ...Object.values(context));
        break;
      } catch (error) {
        if (error.code === "MODULE_NOT_FOUND") {
          await output.quickWaitReact(
            `📦 ${error.message}

Are you use you want to install this package? Please send a reaction to proceed.`,
            {
              authorOnly: true,
              edit: "✅ Installing....",
            }
          );
          await packageInstallerErr(error);
          continue;
        }
        throw error;
      }
    }

    if (
      typeof result === "object" &&
      result !== null &&
      Object.keys(result).length > 0 &&
      result
    ) {
      /*const resultInfo = Object.keys(result).map((key) => {
        const value = result[key];
        let JSONValue;
        try {
          JSONValue = JSON.stringify(value, null, 2);
        } catch {
          JSONValue = "Cannot be converted to JSON.";
        }
        const type = typeof value;
        const className = value?.constructor?.name || "(Primitive)";
        return `${key} => [${type} ${className}]\nJSON Value: ${JSONValue === "{}" ? "Non Serializable" : JSONValue}\n`;
      });*/
      const resultInfo = util.inspect(result);
      await output.reply(`Console:\n${resultInfo}`);
    }
  } catch (error) {
    //await output.reply(`Error: ${error.message}`);
    await output.error(error);
  }
}

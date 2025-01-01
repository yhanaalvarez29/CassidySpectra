/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

import { UNIRedux } from "./unisym.js";

/**
 * @typedef {{ key: string; handler: Function , description: string | null, args: string[] | null }} Config
 */

export class ReduxCMDHome {
  /**
   *
   * @param {{ home: Function, isHypen: boolean, argIndex: number, setup: Function }} options
   * @param {Config[]} configs
   */
  constructor(
    { home, isHypen = false, argIndex = 0, setup = () => {} },
    configs
  ) {
    this.configs = configs;

    this.options = { home, isHypen, argIndex, setup };

    console.log("ReduxCMDHome initialized with options:", this.options);
  }

  async runInContext(ctx) {
    const { args, input, output } = ctx;
    const key = this.options.isHypen
      ? input.propertyArray[this.options.argIndex]
      : input.arguments[this.options.argIndex - 1];
    console.log(
      input.arguments[this.options.argIndex - 1],
      "=>",
      input.arguments,
      this.options.argIndex
    );

    console.log("Running in context with key:", key);

    const targets = this.configs.filter(
      (i) => i.key === key || i.key.toLowerCase() === String(key).toLowerCase()
    );

    console.log("Targets filtered:", targets);

    const extraCTX = {};

    try {
      console.log("Calling setup function...");
      await this.options.setup(ctx, extraCTX);
      console.log("Setup completed successfully.");
    } catch (error) {
      console.error("Error during setup:", error);
      return output.error(error);
    }

    if (targets.length > 0) {
      console.log("Executing handlers for targets...");
      for (const { handler } of targets) {
        try {
          await handler(ctx, extraCTX);
          console.log("Handler executed successfully.");
        } catch (error) {
          console.error("Error during handler execution:", error);
          return output.error(error);
        }
      }
    } else {
      const { home } = this.options;
      const newArgs = [ctx.commandName, ...input.arguments.original];
      console.log(JSON.stringify(input, null, 2));
      const slicedArgs = newArgs.slice(0, this.options.argIndex + 1);
      console.log("NewArgs:", newArgs, "Sliced Args", slicedArgs);
      const itemList = this.createItemLists(this.configs, slicedArgs.join(" "));

      console.log(
        "No matching targets found, calling home function with itemList:",
        itemList
      );

      if (typeof home === "function") {
        try {
          await home(ctx, { ...extraCTX, itemList });
          console.log("Home function executed successfully.");
        } catch (error) {
          console.error("Error during home function execution:", error);
          return output.error(error);
        }
      } else {
        console.log("Home is not a function, sending available commands...");
        await output.reply(
          `${UNIRedux.burger} **Options**\n\n${itemList}\n${UNIRedux.standardLine}\n${UNIRedux.reduxMark}`
        );
      }
    }
  }

  /**
   *
   *
   *
   * @param {Config} config
   */
  createItemList(config, commandName, prefix = global.Cassidy.config.PREFIX) {
    console.log(
      `Creating item list for command: ${commandName} with prefix: ${prefix}`
    );
    return `${UNIRedux.disc} **${prefix}${commandName}${
      this.options.isHypen ? "-" : " "
    }${config.key}** [font=fancy_italic]${
      Array.isArray(config.args) ? config.args.join(" ") : ""
    }[:font=fancy_italic]${
      typeof config.description === "string"
        ? `\n${UNIRedux.charm} ${config.description}`
        : ""
    }`;
  }

  /**
   *
   * @param {Config[]} configs
   */
  createItemLists(configs, commandName, prefix = global.Cassidy.config.PREFIX) {
    console.log("Creating item lists for all commands...");
    return configs
      .map((i) => this.createItemList(i, commandName, prefix))
      .join("\n\n");
  }
}

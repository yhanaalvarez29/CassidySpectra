/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

import { UNIRedux } from "./unisym";

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
    { home, isHypen = true, argIndex = 0, setup = () => {} },
    configs
  ) {
    this.configs = configs;

    this.options = { home, isHypen, argIndex, setup };
  }

  async runInContext(ctx) {
    const { args, input, output } = ctx;
    const key = this.options.isHypen
      ? input.propertyArray[this.options.argIndex]
      : input.arguments[this.options.argIndex];

    const handler = this.configs.filter((i) => i.key === key);

    const extraCTX = {};

    try {
      await this.options.setup(ctx, extraCTX);
    } catch (error) {
      return output.error(error);
    }

    if (handler) {
      try {
        await handler(ctx, extraCTX);
      } catch (error) {
        return output.error(error);
      }
    } else {
      const { home } = this.options;
      const itemList = ReduxCMDHome.createItemLists(
        this.configs,
        ctx.commandName
      );

      if (typeof home === "function") {
        try {
          await home(ctx, { ...extraCTX, itemList });
        } catch (error) {
          return output.error(error);
        }
      } else {
        await output.reply(
          `${UNIRedux.burger} ***Available Commands**\n\n${itemList}\n${UNIRedux.standardLine}`
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
  static createItemList(
    config,
    commandName,
    prefix = global.Cassidy.config.PREFIX
  ) {
    return `${UNIRedux.disc} **${prefix}${config.key}** [font=fancy_italic]${
      Array.isArray(config.args) ? config.args.join(" ") : "No Arguments"
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
  static createItemLists(
    configs,
    commandName,
    prefix = global.Cassidy.config.PREFIX
  ) {
    return configs
      .map((i) => this.createItemList(i, commandName, prefix))
      .join("\n");
  }
}

import type * as Cass from "cassidy-userData";
import type {
  Inventory,
  Collectibles,
} from "./CommandFiles/plugins/ut-shop.js";

import type InputX from "input-cassidy";
import type OutputX from "output-cassidy";

export {};

declare global {
  type CommandEntry = (ctx: {
    [key: string]: any;
    money: Cass.UserStatsManager;
    Inventory: typeof Inventory;
    Collectibles: typeof Collectibles;
    input: InputX;
    output: OutputX;
    args: string[];
    cancelCooldown?: Function;
    commandName?: string;
    prefix: string;
    prefixes: string[];
    commands: { [key: string]: any };
  }) => any | Promise<any>;

  type UserData = Cass.UserData;
}

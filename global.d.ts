import type * as Cass from "cassidy-userData";
import type {
  Inventory,
  Collectibles,
} from "./CommandFiles/plugins/ut-shop.js";

import type * as CassidyStylerNPM from "cassidy-styler";

import type InputX from "input-cassidy";
import type { ReplySystem, ReactSystem } from "input-cassidy";

import type OutputX from "output-cassidy";
import type { OutputProps } from "output-cassidy";
import { CassEXP } from "./CommandFiles/modules/cassEXP.js";
import type {
  GameSimulator,
  GameSimulatorProps,
  Item,
} from "./CommandFiles/types/gamesimu.d.ts";
import GlobalUtilsX from "./utils-type";

declare global {
  interface FactoryConfig {
    title: string;
    key: string;
    init: {
      slot: number;
      proc: number;
    };
    upgrades: {
      slot: number;
      proc: number;
    };
    recipes: Recipe[];
  }

  interface Recipe {
    name: string;
    icon: string;
    levelRequirement: number;
    waitingTime: number;
    ingr: IngredientGroup[];
    result: any;
  }

  type IngredientGroup = Ingredient | Ingredient[];

  interface Ingredient {
    name: string;
    icon: string;
    amount: number;
    key: string;
  }
  interface InventoryConstructor extends Inventory {}
  interface GameSimulatorConstructor extends GameSimulator {}

  interface CommandContextOG {
    [key: string]: any;
    money: Cass.UserStatsManager;
    Inventory: typeof Inventory;
    Collectibles: typeof Collectibles;
    input: InputX;
    output: OutputProps;
    args: string[];
    cancelCooldown?: Function;
    commandName?: string;
    prefix: string;
    prefixes: string[];
    commands: { [key: string]: any };
    CassEXP: typeof CassEXP;
    userDataCache: UserData;
    GameSimulator: typeof GameSimulator;
    replyStystem?: ReplySystem;
    reactSystem?: ReactSystem;
  }

  type CommandContext = CommandContextOG;

  type CommandEntry = (ctx: CommandContext) => any | Promise<any>;

  type UserData = Cass.UserData;

  var utils: typeof GlobalUtilsX;

  var loadSymbols: Map<string, symbol>;

  export namespace CassidySpectra {
    export interface GlobalCassidy {
      config: typeof import("./settings.json");
      uptime: number;
      plugins: Record<string, any>;
      commands: Record<string, any>;
      invLimit: number;
      replies: Record<
        string,
        import("input-cassidy").RepliesObj<
          import("input-cassidy").StandardReplyArg
        >
      >;
      presets: Map<any, any>;
      loadCommand: Function;
      loadPlugins: Function;
      loadAllCommands: Function;
      readonly logo: any;
      oldLogo: string;
      accessToken: string | null;
      readonly redux: boolean;
      readonly spectra: boolean;
      readonly highRoll: 10_000_000;
    }

    export type Output = OutputX;
    export type Input = InputX;
    export type InventoryConstructor = typeof Inventory;
    export type CollectiblesConstructor = typeof Collectibles;

    export interface CassidyCommand {
      meta: CommandMeta;
      entry: CommandHandler;
      middleware?: CommandMiddleware[];
      loaders?: CommandLoader[];
      onError?: ErrorHandler;
      onCooldown?: CooldownHandler;
      duringLoad?: DuringLoadHandler;
      noPrefix?: CommandHandler;
      reply?: CommandHandler;
      style?: any;
    }

    export interface CommandMeta {
      name: string;
      description: string;
      usage?: string;
      category: string;
      version: string;
      permissions?: number[];
      author?: string;
      otherNames?: string[];
      ext_plugins?: Record<string, string>;
      waitingTime?: number;
      botAdmin?: boolean;
      dependencies?: Record<string, string>;
      whiteList?: string[];
      noPrefix: boolean | "both";
      allowModerators?: boolean;
      icon?: string;
      requirement?: string;
      supported?: string;
      args?: {
        degree: number;
        fallback: null | string;
        response: string | null;
        search: null | string;
        required: boolean;
      }[];
    }

    export type CommandHandler = (
      context: CommandContext
    ) => Promise<void> | void;

    export type CommandMiddleware = (
      context: CommandContext,
      next: () => Promise<void>
    ) => Promise<void>;

    export type CommandLoader = (
      context: CommandContext
    ) => Promise<void> | void;

    export type ErrorHandler = (
      error: Error,
      context: CommandContext
    ) => Promise<void> | void;

    export type CooldownHandler = (
      context: CommandContext
    ) => Promise<void> | void;

    export type DuringLoadHandler = () => Promise<void> | void;
  }
}

import type { UserStatsManager } from "cassidy-userData";

declare global {
  var Cassidy: CassidySpectra.GlobalCassidy;
  var handleStat: UserStatsManager;

  var require: NodeRequire & {
    url(url: string): Promise<any>;
  };
}

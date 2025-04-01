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
    threadsDB: UserStatsManager;
    usersDB: UserStatsManager;
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
import { CassMongoManager } from "./handlers/database/cass-mongo.js";

declare global {
  var Cassidy: CassidySpectra.GlobalCassidy;
  var handleStat: UserStatsManager;

  var require: NodeRequire & {
    url(url: string): Promise<any>;
  };

  var cassMongoManager: CassMongoManager | undefined;
}

declare global {
  // Everything here is custom! Do not use in other codes
  // Can also result in side effects.
  interface Object {
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    cloneByJSON: WasCustom<<T>(this: T) => T>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    randomKey: WasCustom<(this: Record<string, any>) => string>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    randomValue: WasCustom<(this: Record<string, any>) => any>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    toJSONString: WasCustom<(this: { toJSON(): any }) => string>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    typeof: WasCustom<(this: any) => string>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    removeFalsy: WasCustom<(this: Record<string, any>) => void>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    forEachKey: WasCustom<
      (
        this: Record<string, any>,
        callback: (key: string, value: any) => void
      ) => void
    >;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    mapAsync: WasCustom<
      <T>(
        this: Record<string, T>,
        callback: (value: T) => Promise<any>
      ) => Promise<Record<string, any>>
    >;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    map: WasCustom<
      <T, U>(
        this: Record<string, T>,
        callback: (value: T) => U
      ) => Record<string, U>
    >;
  }

  interface Array<T> {
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    randomValue: WasCustom<(this: T[]) => T>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    randomIndex: WasCustom<(this: T[]) => number>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    toUnique: WasCustom<(this: T[]) => T[]>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    removeFalsy: WasCustom<(this: (T | falsy)[]) => T[]>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    remove: WasCustom<(this: T[], ...itemsToRemove: T[]) => T[]>;
  }

  interface String {
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    toFonted: WasCustom<(this: string, font: string) => string>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    toTitleCase: WasCustom<(this: string) => string>;
    /**
     * @custom CassidySpectra - This is a custom method exclusive to CassidySpectra projects.
     * @warning Do not use in other codebases; may modify prototypes or cause unintended side effects outside CassidySpectra.
     * @reusable Use freely within CassidySpectra projects where this utility is applied.
     */
    map: WasCustom<
      (
        this: string,
        callback: (char: string, index: number, array: string[]) => any
      ) => any[]
    >;
  }

  type falsy = false | null | undefined | "" | 0;

  type WasCustom<T> = T & { _cass_extends: true };
}

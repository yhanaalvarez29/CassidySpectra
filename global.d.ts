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
    [key: string]: unknown;
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
    CassEXP: typeof CassEXP;
    commands: { [key: string]: CassidySpectra.CassidyCommand };
    command?: CassidySpectra.CassidyCommand;
    userDataCache?: UserData;
    GameSimulator: typeof GameSimulator;
    replyStystem?: ReplySystem;
    reactSystem?: ReactSystem;
    threadsDB: UserStatsManager;
    usersDB: UserStatsManager;
    api: any;
    event: any;
    allPlugins: { [key: string]: any };
    queue: any[][];
    origAPI: any;
    hasPrefix: boolean;
    invTime: number;
    icon: string;
    Cassidy: CassidySpectra.GlobalCassidy;
    safeCalls: number;
    discordApi: any;
    pageApi: any;
    awaitStack: { [key: string]: string[] };
    setAwaitStack: (id: string, key: string) => void;
    delAwaitStack: (id: string, key: string) => void;
    hasAwaitStack: (id: string, key: string) => boolean;
    clearCurrStack: () => void;
    allObj: CommandContext;
    userStat: Cass.UserStatsManager;
    next?: () => void;
    styler?: CassidyResponseStylerControl;
    ctx: CommandContext;
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

declare global {
  var Cassidy: CassidySpectra.GlobalCassidy;
  var handleStat: UserStatsManager;

  var require: NodeRequire & {
    url(url: string): Promise<any>;
  };

  var cassMongoManager: CassMongoManager | undefined;
}

import type { UserStatsManager } from "cassidy-userData";
import { CassMongoManager } from "./handlers/database/cass-mongo.js";
import type { CassidyResponseStylerControl } from "@cassidy/styler";
declare global {
  /**
   * Custom utility type to mark CassidySpectra-specific extensions
   * @internal
   */
  type WasCustom<T> = T & { readonly _cass_extends?: true };

  /** Falsy values as per JavaScript */
  type Falsy = false | null | undefined | "" | 0;

  interface Object {
    /**
     * Creates a deep clone of the object using JSON serialization.
     * @template T - The type of the object being cloned
     * @returns A deep clone of the original object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    cloneByJSON<T>(this: T): T;

    /**
     * Returns a random key from the object.
     * @returns A random key from the object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomKey<T extends Record<string, any>>(this: T): string;

    /**
     * Returns a random [key, value] entry from the object.
     * @returns A tuple containing a random key and its value
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomEntry<T extends Record<string, any>>(this: T): [string, T[keyof T]];

    /**
     * Returns a random value from the object.
     * @returns A random value from the object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomValue<T extends Record<string, any>>(this: T): T[keyof T];

    /**
     * Converts the object to a JSON string using its toJSON method if available.
     * @returns A JSON string representation of the object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toJSONString(this: { toJSON(): any }): string;

    /**
     * Returns the typeof result for the object.
     * @returns The type of the object as a string
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    typeof(this: unknown): string;

    /**
     * Removes falsy values from the object in-place.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    removeFalsy<T extends Record<string, any>>(this: T): void;

    /**
     * Iterates over each key-value pair in the object.
     * @template T - The type of the object
     * @param callback - Function to execute for each key-value pair
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    forEachKey<T extends Record<string, any>>(
      this: T,
      callback: (key: string, value: T[keyof T]) => void
    ): void;

    /**
     * Asynchronously maps over the object's values.
     * @template T - The type of the object's values
     * @template U - The type of the mapped values
     * @param callback - Async function to transform each value
     * @returns A promise resolving to a new object with transformed values
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    mapAsync<T, U>(
      this: Record<string, T>,
      callback: (value: T, key: string) => Promise<U>
    ): Promise<Record<string, U>>;

    /**
     * Maps over the object's values synchronously.
     * @template T - The type of the object's values
     * @template U - The type of the mapped values
     * @param callback - Function to transform each value
     * @returns A new object with transformed values
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    map<T, U>(
      this: Record<string, T>,
      callback: (value: T, key: string) => U
    ): Record<string, U>;
  }

  interface Array<T> {
    /**
     * Returns a random value from the array.
     * @returns A random element from the array
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomValue(this: T[]): T;

    /**
     * Returns a random index from the array.
     * @returns A random index number
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomIndex(this: T[]): number;

    /**
     * Returns a new array with unique values.
     * @returns A new array containing only unique elements
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toUnique(this: T[]): T[];

    /**
     * Returns a new array with falsy values removed.
     * @template U - The non-falsy type
     * @returns A new array containing only truthy elements
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    removeFalsy<U>(this: (U | Falsy)[]): U[];

    /**
     * Removes specified items from the array and returns the new array.
     * @param itemsToRemove - Items to remove from the array
     * @returns A new array with specified items removed
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    remove(this: T[], ...itemsToRemove: T[]): T[];
  }

  interface String {
    /**
     * Applies a font transformation to the string.
     * @param font - The font to apply
     * @returns The transformed string
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toFonted(this: string, font: string): string;

    /**
     * Converts the string to title case.
     * @returns The string in title case
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toTitleCase(this: string): string;

    /**
     * Maps over each character in the string.
     * @template U - The type of the mapped values
     * @param callback - Function to transform each character
     * @returns An array of transformed values
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    map<U>(
      this: string,
      callback: (char: string, index: number, array: string[]) => U
    ): U[];
  }
}

import * as nodeUtil from "util";

export namespace NeaxScript {
  const { Cassidy } = global;
  export interface NSXTra {
    nsxu: typeof NXSUtil;
    nsxTarget: string;
    nsxuCreated: ReturnType<typeof NXSUtil.createFlagsAndArgs>;
    isOtherTAllowed(author: string, newTarget: string): boolean;
    isOtherTAllowed(): boolean;
    riseIsOtherTAllowed(author: string, newTarget: string): boolean;
    riseIsOtherTAllowed(): boolean;
    isTargetAdmin: boolean;
    nsxAuthor: string;
    selfNSX: Parser;
    nsxName: string;
    nsxMod: string | null;
    isAuthorAdmin: boolean;
  }
  export interface Command {
    (ctx: CommandContext & NSXTra): AsyncGenerator<string, Codes, string>;
  }

  export interface Modifier {
    (ctx: CommandContext & NSXTra): Promise<void>;
  }

  export const Helps: Record<string, string> = {
    arg: `
  Displays command arguments, flags, and environment details.
  Usage: arg::self
  Example: arg::self --json
  Arguments:
  - none
  Flags:
  - --json: Output as JSON
  - --raw: Output raw data
  - --depth <number>: Controls object inspection depth
  `,

    promote: `
  Grants admin privileges to the target user.
  Usage: promote::<targetID>
  Example: promote::100012345678901
  Arguments:
  - targetID: ID of the user to be promoted
  Requirements:
  - Author must be an admin
  `,

    demote: `
  Revokes admin privileges from the target user.
  Usage: demote::<targetID>
  Example: demote::100012345678901
  Arguments:
  - targetID: ID of the user to be demoted
  Requirements:
  - Author must be an admin
  `,

    mpromote: `
  Grants moderator privileges to the target user.
  Usage: mpromote::<targetID>
  Example: mpromote::100012345678901
  Arguments:
  - targetID: ID of the user to be promoted as a moderator
  Requirements:
  - Author must be an admin
  `,

    mdemote: `
  Revokes moderator privileges from the target user.
  Usage: mdemote::<targetID>
  Example: mdemote::100012345678901
  Arguments:
  - targetID: ID of the moderator to be demoted
  Requirements:
  - Author must be an admin
  `,

    uset: `
  Sets a property on a user's record to a parsed JSON value.
  Usage: uset::<targetID> <key> <jsonValue>
  Example: uset::100012345678901 theme "{\\"color\\": \\"blue\\"}"
  Arguments:
  - targetID: ID of the user
  - key: property name to set
  - jsonValue: value (must be valid JSON)
  Requirements:
  - Author must be an admin
  `,

    tset: `
  Sets a property on a thread's record to a parsed JSON value.
  Usage: tset::<threadID> <key> <jsonValue>
  Example: tset::1234567890 title "{\\"name\\": \\"General Chat\\"}"
  Arguments:
  - threadID: thread ID
  - key: property name to set
  - jsonValue: value (must be valid JSON)
  Requirements:
  - Author must be an admin
  `,

    uget: `
  Retrieves a nested property from a user's data.
  Usage: uget::<targetID> <nested_keys...>
  Example: uget::100012345678901 settings theme
  Arguments:
  - targetID: ID of the user
  - nested_keys: keys from outermost to innermost (space-separated)
  Flags:
  - --json: Output as JSON
  - --raw: Suppress property name prefix
  - --depth <number>: Custom object inspection depth
  Requirements:
  - Author must have permission or be an admin
  `,

    tget: `
  Retrieves a nested property from a thread's data.
  Usage: tget::<threadID> <nested_keys...>
  Example: tget::1234567890 config mods
  Arguments:
  - threadID: thread ID
  - nested_keys: keys from outermost to innermost (space-separated)
  Flags:
  - --json: Output as JSON
  - --raw: Suppress property name prefix
  - --depth <number>: Custom object inspection depth
  Requirements:
  - Author must have permission or be an admin
  `,
  };

  export enum Codes {
    Success,
    MalformedInput,
    PermissionNeedRise,
    ExecError,
    MissingOrInvalidArgs,
    CommandNotImplemented,
    DepError,
    CommandNotFound = 127,
  }

  export const Commands: Record<string, Command> = {
    async *help({ nsxuCreated, nsxu }) {
      const [cmd, ...flags] = nsxuCreated.args;

      if (!cmd) {
        yield "Usage: help <command>\n\nAvailable commands:\n";

        for (const [key, description] of Object.entries(NeaxScript.Helps)) {
          const shortDesc = description.trim().split("\n")[0];
          yield `  ${key} - ${shortDesc}`;
        }

        return NeaxScript.Codes.Success;
      }

      if (flags.includes("-h") || flags.includes("--help")) {
        const description = NeaxScript.Helps[cmd];
        if (!description) {
          yield `Unknown command: ${cmd}`;
          return NeaxScript.Codes.CommandNotFound;
        }

        yield `Usage: ${cmd} [options] <args>\n\n${description.trim()}`;
        return NeaxScript.Codes.Success;
      }

      const description = NeaxScript.Helps[cmd];
      if (!description) {
        yield `Unknown command: ${cmd}`;
        return NeaxScript.Codes.CommandNotFound;
      }

      yield `${cmd} - ${description.trim().split("\n")[0]}`;
      return NeaxScript.Codes.Success;
    },
    async *arg({
      nsxu,
      nsxTarget,
      nsxName,
      nsxuCreated,
      nsxAuthor,
      nsxMod,
      isTargetAdmin,
      input,
      isOtherTAllowed: isAllowed,
      isAuthorAdmin,
    }) {
      yield nsxu.json({
        nsxName,
        nsxuCreated: { ...nsxuCreated },
        nsxTarget,
        nsxAuthor,
        isTargetAdmin,
        nsxMod,
        isAdmin: input.isAdmin,
        isAllowed: isAllowed(nsxAuthor, nsxTarget),
        isAuthorAdmin,
      });
      return Codes.Success;
    },
    async *promote({ nsxu, nsxTarget, isAuthorAdmin }) {
      if (!nsxTarget) {
        yield "Target not found.";
        return Codes.MissingOrInvalidArgs;
      }
      if (!isAuthorAdmin) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }

      const { ADMINBOT } = Cassidy.config;
      if (ADMINBOT.includes(nsxTarget)) {
        yield `Already admin. [${nsxTarget}]`;
        return Codes.MissingOrInvalidArgs;
      }
      ADMINBOT.push(nsxTarget);
      Cassidy.config.ADMINBOT = ADMINBOT;

      yield `Added as admin. [${nsxTarget}]`;
      return Codes.Success;
    },
    async *demote({ nsxu, nsxTarget, isAuthorAdmin }) {
      if (!nsxTarget) {
        yield "Target not found.";
        return Codes.MissingOrInvalidArgs;
      }
      if (!isAuthorAdmin) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }

      const { ADMINBOT } = Cassidy.config;
      if (!ADMINBOT.includes(nsxTarget)) {
        yield `Not admin. [${nsxTarget}]`;
        return Codes.MissingOrInvalidArgs;
      }
      ADMINBOT.push(nsxTarget);
      Cassidy.config.ADMINBOT = ADMINBOT.filter((item) => item !== nsxTarget);
      yield `Removed as admin. [${nsxTarget}]`;
      return Codes.Success;
    },
    async *mpromote({ nsxu, nsxTarget, isAuthorAdmin }) {
      if (!nsxTarget) {
        yield "Target not found.";
        return Codes.MissingOrInvalidArgs;
      }
      if (!isAuthorAdmin) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }

      const { MODERATORBOT } = Cassidy.config;
      if (MODERATORBOT.includes(nsxTarget)) {
        yield `Already moderator. [${nsxTarget}]`;
        return Codes.MissingOrInvalidArgs;
      }
      MODERATORBOT.push(nsxTarget);
      Cassidy.config.MODERATORBOT = MODERATORBOT;

      yield `Added as moderator. [${nsxTarget}]`;
      return Codes.Success;
    },
    async *mdemote({ nsxu, nsxTarget, isAuthorAdmin }) {
      if (!nsxTarget) {
        yield "Target not found.";
        return Codes.MissingOrInvalidArgs;
      }
      if (!isAuthorAdmin) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }

      const { MODERATORBOT } = Cassidy.config;
      if (!MODERATORBOT.includes(nsxTarget)) {
        yield `Not moderator. [${nsxTarget}]`;
        return Codes.MissingOrInvalidArgs;
      }
      MODERATORBOT.push(nsxTarget);
      Cassidy.config.MODERATORBOT = MODERATORBOT.filter(
        (item) => item !== nsxTarget
      );
      yield `Removed as moderator. [${nsxTarget}]`;
      return Codes.Success;
    },
    async *uset({ usersDB, nsxuCreated, nsxTarget, isAuthorAdmin, nsxu }) {
      if (!nsxTarget) {
        yield "Missing target.";
        return Codes.MissingOrInvalidArgs;
      }
      const [property, ..._value] = nsxuCreated.args;
      if (!property || _value.length < 1) {
        yield "First arg must be property key, next arg must be a valid JSON.";
        return Codes.MissingOrInvalidArgs;
      }
      const __value = _value.join(" ");
      let value = __value;
      try {
        value = JSON.parse(value);
      } catch (error) {
        yield nsxu.err(error);
        return Codes.ExecError;
      }

      if (!isAuthorAdmin) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }

      await usersDB.setItem(nsxTarget, {
        [property]: value,
      });
      yield `Set success [${nsxTarget}]`;
      yield nsxu.json({
        [property]: value,
      });
      return Codes.Success;
    },
    async *tset({ threadsDB, nsxuCreated, nsxTarget, isAuthorAdmin, nsxu }) {
      if (!nsxTarget) {
        yield "Missing target.";
        return Codes.MissingOrInvalidArgs;
      }
      const [property, ..._value] = nsxuCreated.args;
      if (!property || _value.length < 1) {
        yield "First arg must be property key, next arg must be a valid JSON.";
        return Codes.MissingOrInvalidArgs;
      }
      const __value = _value.join(" ");
      let value = __value;
      try {
        value = JSON.parse(value);
      } catch (error) {
        yield nsxu.err(error);
        return Codes.ExecError;
      }

      if (!isAuthorAdmin) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }

      await threadsDB.setItem(nsxTarget, {
        [property]: value,
      });
      yield `Set success [${nsxTarget}]`;
      yield nsxu.json({
        [property]: value,
      });
      return Codes.Success;
    },
    async *uget({
      usersDB,
      nsxuCreated,
      nsxu,
      nsxTarget,
      isOtherTAllowed: isAllowed,
      nsxAuthor,
    }) {
      if (!nsxTarget) {
        yield "Missing target.";
        return Codes.MissingOrInvalidArgs;
      }
      let keys = [...nsxuCreated.args];
      if (keys.length < 1) {
        yield "A nested keys (shallowest to deepest, separated by spaces.) is required.";
        return Codes.MissingOrInvalidArgs;
      }
      if (!isAllowed(nsxAuthor, nsxTarget)) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }
      const data = await usersDB.queryItem(nsxTarget, keys[0]);
      const item =
        keys[0] === "all" ? data : nsxu.getNestedProperty(data, ...keys);
      let res = nsxuCreated.hasFlag("raw")
        ? ""
        : `Property => ${keys.join(".")}\n\n`;
      if (nsxuCreated.hasFlag("json")) {
        yield res + nsxu.json(item);
      } else {
        yield res +
          nsxu.inspect(
            item,
            parseInt(nsxuCreated.flagValues.get("depth")) ?? undefined
          );
      }
      return Codes.Success;
    },
    async *tget({
      threadsDB,
      nsxuCreated,
      nsxu,
      nsxTarget,
      isOtherTAllowed: isAllowed,
      nsxAuthor,
    }) {
      if (!nsxTarget) {
        yield "Missing target.";
        return Codes.MissingOrInvalidArgs;
      }
      let keys = [...nsxuCreated.args];
      if (keys.length < 1) {
        yield "A nested keys (shallowest to deepest, separated by spaces.) is required.";
        return Codes.MissingOrInvalidArgs;
      }
      if (!isAllowed(nsxAuthor, nsxTarget)) {
        yield nsxu.notAllowed();
        return Codes.PermissionNeedRise;
      }
      const data = await threadsDB.queryItem(nsxTarget, keys[0]);
      const item =
        keys[0] === "all" ? data : nsxu.getNestedProperty(data, ...keys);
      let res = nsxuCreated.hasFlag("raw")
        ? ""
        : `Property => ${keys.join(".")}\n\n`;
      if (nsxuCreated.hasFlag("json")) {
        yield res + nsxu.json(item);
      } else {
        yield res +
          nsxu.inspect(
            item,
            parseInt(nsxuCreated.flagValues.get("depth")) ?? undefined
          );
      }
      return Codes.Success;
    },
  };

  export const Modifiers: Record<string, Modifier> = {
    async rise(ctx) {
      const { input } = ctx;
      if (input.isAdmin) {
        ctx.isOtherTAllowed = ctx.riseIsOtherTAllowed;
        ctx.isAuthorAdmin = true;
      }
    },
  };

  export type ParserCallback = (data: string) => void | Promise<void>;

  export class Parser {
    public context: CommandContext;

    constructor(context: CommandContext) {
      this.context = context;
    }

    async run(
      script: ValidScript,
      callback: ParserCallback,
      full: boolean = false
    ): Promise<Codes> {
      script = String(script) as ValidScript;
      script = Parser.parseVariables(this.context, script) as ValidScript;
      const { input } = this.context;
      let mod: string | null = null;
      let [commandName, ...etc] = script.split("::");
      let [target, ...commandArgs] = etc.join(" ").split(" ");
      if (target === "self") {
        target = input.senderID;
      }
      const commandNameSplit = commandName.split(" ");
      if (commandNameSplit.length > 2) {
        mod = commandNameSplit[0];
        commandName = commandNameSplit[1];
      }

      if (!(commandName in NeaxScript.Commands)) {
        callback(`Neax::CommandNotFound = ${commandName}`);
        return Codes.CommandNotFound;
      }

      const commandFunc: NeaxScript.Command | undefined =
        NeaxScript.Commands[commandName as keyof typeof NeaxScript.Commands];

      let nsxuCreated = NXSUtil.createFlagsAndArgs(...commandArgs);
      const nsxTarget = target;

      const commandContext: CommandContext & NSXTra = {
        selfNSX: this,
        ...this.context,
        nsxuCreated,
        nsxTarget,
        nsxMod: mod,
        nsxu: NXSUtil,
        nsxName: commandName,
        isAuthorAdmin: false,
        isOtherTAllowed(...args: [string?, string?]) {
          if (args.length === 0) {
            return input.senderID === nsxTarget;
          }
          return args[0] === args[1];
        },
        riseIsOtherTAllowed(...args: [string?, string?]) {
          if (args.length === 0) {
            return input.isAdmin || input.senderID === nsxTarget;
          }
          return input.isAdmin || args[0] === args[1];
        },
        isTargetAdmin: input._isAdmin(target),
        nsxAuthor: input.senderID,
      };

      try {
        if (mod) {
          const modFunc: NeaxScript.Modifier | undefined =
            NeaxScript.Modifiers[mod as keyof typeof NeaxScript.Modifiers];
          if (modFunc) {
            await modFunc(commandContext);
          } else {
            callback(`Neax::ModNotFound = ${mod}`);
            return Codes.CommandNotFound;
          }
        }
        if (full) {
          const result = await this.executeCommand(commandFunc, commandContext);
          callback(result);
        } else {
          await this.executeCommand(commandFunc, commandContext, callback);
        }
        return Codes.Success;
      } catch (error) {
        callback(NXSUtil.err(error));
        console.error(error);
        return Codes.ExecError;
      }
    }

    public async runAsync(script: ValidScript) {
      let result: string = "";
      const code = await this.run(
        script,
        (data) => {
          result = data;
        },
        true
      );
      return {
        result,
        code,
      };
    }

    public async neaxInline(body: string) {
      body = String(body);
      const reg = /nsxu\[(.*?)\]/g;
      let result = body;
      const codes: Codes[] = [];
      const outputs: string[] = [];

      for (const [whole, match] of body.matchAll(reg)) {
        const res = await this.runAsync((match + " --raw") as ValidScript);
        if (res.code === 0) {
          result = result.replace(whole, res.result);
        } else {
          result = result.replace(whole, "[x]");
        }
        outputs.push(res.result);
        codes.push(res.code);
      }

      return {
        codes,
        result,
        outputs,
        getIssues() {
          return (
            `Issues: \n\n` +
            codes
              .map((i, j) => `Neax::${Codes[i]} =\n${outputs[j]}`)
              .join("\n\n")
          );
        },
      };
    }

    static parseVariables(ctx: CommandContext, script: ValidScript) {
      const reg = /%([^%]+)%/g;
      return String(script).replace(reg, (_, p1) => {
        return `${ctx.input[p1] ?? "undefined"}`;
      });
    }

    private async executeCommand(
      commandFunc: Command,
      context: CommandContext & NSXTra,
      callback?: ParserCallback
    ): Promise<string> {
      let result = "";
      for await (const _output of commandFunc(context)) {
        let output = `${_output}\n`;
        result += output;
        try {
          callback?.(_output);
        } catch (error) {
          console.error(error);
        }
      }
      return result;
    }
  }

  export type ValidScript = `${
    | `${keyof typeof Modifiers} ${keyof typeof Commands}`
    | keyof typeof Commands}::${"self" | string | number} ${any}`;

  export const NXSUtil = {
    json(value: any, space = 2) {
      return JSON.stringify(value, null, space);
    },
    inspect(value: any, depth = 2) {
      return nodeUtil.inspect(value, { depth });
    },
    err(data: Error | string | Record<string, any>) {
      if (data instanceof Error) {
        return `Neax::${data.name ?? "Error"} =\n\n${data.stack}`;
      }
      if (typeof data === "string") {
        return `Neax::Problem = ${data}`;
      }
      return `Neax::ProblemData =:\n\n${NXSUtil.inspect(data)}`;
    },
    notAllowed() {
      return `Neax::PermissionNeedRise`;
    },
    createFlagsAndArgs(...strs: string[]) {
      const all = NXSUtil.flattenArgsAsArray(...strs);
      const flags = all.filter((i) => i.startsWith("--"));
      const args = all.filter((i) => !flags.includes(i));

      const flagValues = flags.reduce<Map<string, string | undefined>>(
        (acc, flag, index) => {
          const flagName = flag.replace(/^--/, "");
          const nextValue =
            all[index + 1] && !all[index + 1].startsWith("--")
              ? all[index + 1]
              : true;
          acc.set(flagName, nextValue ? String(nextValue) : undefined);
          return acc;
        },
        new Map<string, string | undefined>()
      );

      return {
        args,
        flags,
        flagValues,
        hasFlag(i: string) {
          return flagValues.has(i);
        },
      };
    },
    flattenArgs(...args: string[]) {
      return args.join(" ").replace(/\s+/g, " ").trim();
    },
    flattenArgsAsArray(...args: string[]) {
      return NXSUtil.flattenArgs(...args)
        .split(" ")
        .filter(Boolean);
    },
    getNestedProperty(
      obj: Record<string, unknown>,
      ...keys: string[]
    ): unknown | null {
      const flatKeys = NXSUtil.flattenArgsAsArray(...keys);

      return flatKeys.reduce<unknown>((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) {
          return acc[key];
        }
        return null;
      }, obj);
    },
  };
}

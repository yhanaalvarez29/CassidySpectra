import { UNIRedux } from "./unisym.js";

export type Config = {
  key: string;
  handler: (
    ctx: CommandContext,
    extra?: {
      targets: Config[];
      key: string;
      itemList?: string | undefined;
    } & Record<string, unknown>
  ) => any | Promise<any>;
  description?: string | null;
  args?: string[] | null;
  aliases?: string[] | null;
  icon?: string;
  isAdmin?: boolean;
  category?: string;
  cooldown?: number;
  usage?: string;
  permissions?: string[];
  validator?: ValidationRule[] | CassCheckly;
  hidden?: boolean;
};

export type ValidationRule = {
  index: number;
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
  custom?: (value: string) => boolean | string;
  name?: string;
};

export class CassCheckly {
  rules: ValidationRule[];

  constructor(rules: ValidationRule[]) {
    this.rules = rules.map((rule) => ({ name: `arg${rule.index}`, ...rule }));
  }

  extractValue(value: string, type: ValidationRule["type"]) {
    switch (type) {
      case "number":
        return Number(value);
      case "boolean":
        return /^(true|1|yes)$/i.test(value);
      case "array":
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      case "object":
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  validateArgs(args: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const value = args[rule.index];
      const displayName = rule.name || `arg${rule.index}`;

      if (rule.required && !value) {
        errors.push(`**${displayName}** is required`);
        continue;
      }

      if (!value) continue;

      const parsedValue = this.extractValue(value, rule.type);
      let isValid = true;

      switch (rule.type) {
        case "number":
          isValid =
            !isNaN(parsedValue) && (!rule.regex || rule.regex.test(value));
          if (!isValid) errors.push(`**${displayName}** must be a number`);
          break;
        case "boolean":
          isValid =
            /^(true|false|1|0|yes|no)$/i.test(value) &&
            (!rule.regex || rule.regex.test(value));
          if (!isValid) errors.push(`**${displayName}** must be true/false`);
          break;
        case "array":
          isValid =
            Array.isArray(parsedValue) &&
            (!rule.regex ||
              parsedValue.every((v) => rule.regex!.test(String(v))));
          if (!isValid) errors.push(`**${displayName}** must be an array`);
          break;
        case "object":
          isValid =
            typeof parsedValue === "object" &&
            !Array.isArray(parsedValue) &&
            (!rule.regex || rule.regex.test(value));
          if (!isValid) errors.push(`**${displayName}** must be an object`);
          break;
        case "string":
          isValid = rule.regex ? rule.regex.test(value) : true;
          if (!isValid) errors.push(`**${displayName}** doesn’t match pattern`);
          break;
      }

      if (!isValid) continue;

      if (rule.type === "number") {
        if (rule.min !== undefined && parsedValue < rule.min)
          errors.push(`**${displayName}** too small (min: ${rule.min})`);
        if (rule.max !== undefined && parsedValue > rule.max)
          errors.push(`**${displayName}** too big (max: ${rule.max})`);
      }

      if (rule.type === "string") {
        if (rule.min !== undefined && value.length < rule.min)
          errors.push(`**${displayName}** too short (min: ${rule.min})`);
        if (rule.max !== undefined && value.length > rule.max)
          errors.push(`**${displayName}** too long (max: ${rule.max})`);
      }

      if (rule.custom) {
        const result = rule.custom(value);
        if (typeof result === "string")
          errors.push(`**${displayName}** ${result}`);
        else if (result === false) errors.push(`**${displayName}** invalid`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

export class SpectralCMDHome {
  configs: Config[];
  options: {
    home?: Config["handler"];
    isHypen?: boolean;
    argIndex?: number;
    setup?: Config["handler"];
    globalCooldown?: number;
    errorHandler?: (error: any, ctx: CommandContext) => void;
    validator?: CassCheckly;
    defaultCategory?: string;
  };
  cooldowns: Map<string, Map<string, number>>;

  constructor(
    {
      home,
      isHypen = false,
      argIndex = 0,
      setup = () => {},
      entryConfig,
      entryInfo,
      globalCooldown = 1000,
      errorHandler,
      validator,
      defaultCategory = "General",
    }: {
      home?: Config["handler"];
      isHypen?: boolean;
      argIndex?: number;
      setup?: Config["handler"];
      entryConfig?: Record<string, Config["handler"]>;
      entryInfo?: { [key: string]: Partial<Config> };
      globalCooldown?: number;
      errorHandler?: (error: any, ctx: CommandContext) => void;
      validator?: CassCheckly;
      defaultCategory?: string;
    },
    configs?: Config[]
  ) {
    if (entryConfig) {
      configs = Object.entries(entryConfig).map(([key, handler]) => ({
        key,
        handler,
        icon: "✨",
        category: defaultCategory,
        ...(entryInfo?.[key] ?? {}),
      }));
      isHypen = true;
      argIndex = 0;
    }

    this.configs = configs || [];
    this.addHelpCommand();

    this.options = {
      home: home ?? this.defaultHome.bind(this),
      isHypen,
      argIndex,
      setup,
      globalCooldown,
      errorHandler,
      validator,
      defaultCategory,
    };
    this.cooldowns = new Map();
  }

  addHelpCommand() {
    this.configs.push({
      key: "help",
      handler: this.helpHandler.bind(this),
      description: "Shows commands",
      icon: "📖",
      category: "Utility",
      usage: "help [command/category] [page]",
    });
  }

  async defaultHome(ctx: CommandContext) {
    const commandList = this.configs
      .filter((c) => !c.hidden)
      .map(
        (c) =>
          `${c.icon || "✨"} ${ctx.prefix}${ctx.commandName}${
            this.options.isHypen ? "-" : " "
          }${c.key}`
      )
      .join("\n");

    await ctx.output.reply(
      `${UNIRedux.arrow} ***Commands***\n\n` +
        commandList +
        `\n\nTry **${ctx.prefix}${ctx.commandName}${
          this.options.isHypen ? "-" : " "
        }help** ${UNIRedux.charm}`
    );
  }

  async helpHandler(ctx: CommandContext) {
    const args = ctx.input.arguments.slice(this.options.argIndex + 1);
    const filter = args[0]?.toLowerCase();
    const page = Math.max(1, Number(args[1]) || 1);
    const perPage = 5;

    if (!filter) {
      const categories = [
        ...new Set(
          this.configs
            .filter((c) => !c.hidden)
            .map((c) => c.category || this.options.defaultCategory)
        ),
      ];

      const output = [
        `${UNIRedux.arrow} ***Categories***\n\n`,
        ...categories.map(
          (cat) =>
            `${ctx.prefix}${ctx.commandName}${
              this.options.isHypen ? "-" : " "
            }help ${cat.toLowerCase()}`
        ),
        `\nUse **${ctx.prefix}${ctx.commandName}${
          this.options.isHypen ? "-" : " "
        }help <command>** for details ${UNIRedux.charm}`,
      ].join("\n");

      return ctx.output.reply(output);
    }

    const command = this.getCommand(filter);
    if (command) {
      return ctx.output.reply(
        this.createDetailedHelp(command, ctx.commandName, ctx.prefix)
      );
    }

    const categoryCommands = this.configs.filter(
      (c) =>
        !c.hidden &&
        (c.category || this.options.defaultCategory).toLowerCase() === filter
    );

    if (categoryCommands.length === 0) {
      return ctx.output.reply(
        `❌ No commands in **${filter}** ${UNIRedux.charm}`
      );
    }

    const totalPages = Math.ceil(categoryCommands.length / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginated = categoryCommands.slice(start, end);

    const output = [
      `${UNIRedux.arrow} ***${filter} Commands (Page ${page}/${totalPages})***\n\n`,
      this.createItemLists(paginated, ctx.commandName, ctx.prefix),
      UNIRedux.standardLine,
      `Page **${page}/${totalPages}** - Use **${ctx.prefix}${ctx.commandName}${
        this.options.isHypen ? "-" : " "
      }help ${filter} <page>** ${UNIRedux.charm}`,
    ].join("\n");

    return ctx.output.reply(output);
  }

  async runInContext(ctx: CommandContext) {
    const { input, output } = ctx;
    const key =
      this.options.isHypen && "propertyArray" in input
        ? input.propertyArray[this.options.argIndex]
        : input.arguments[this.options.argIndex] || "";

    if (!this.checkCooldown(ctx, key)) {
      return output.reply(`❌ Wait a bit ${UNIRedux.charm}`);
    }

    const targets = this.findTargets(key);
    const extraCTX: Parameters<Config["handler"]>["1"] = {
      targets,
      key,
      itemList: null,
    };

    try {
      await this.options.setup(ctx, extraCTX);

      if (this.options.validator) {
        const validation = this.options.validator.validateArgs(ctx.args);
        if (!validation.valid) {
          return output.reply(
            `❌ Oops!\n${validation.errors.join("\n")}${UNIRedux.charm}`
          );
        }
      }

      if (targets.length > 0) {
        for (const target of targets) {
          if (target.isAdmin && !input.isAdmin) {
            return output.reply(`❌ Admin only ${UNIRedux.charm}`);
          }

          const validator =
            target.validator instanceof CassCheckly
              ? target.validator
              : target.validator
              ? new CassCheckly(target.validator)
              : null;

          if (validator) {
            const validation = validator.validateArgs(ctx.args);
            if (!validation.valid) {
              return output.reply(
                `❌ Bad args:\n${validation.errors.join("\n")}${UNIRedux.charm}`
              );
            }
          }

          await target.handler(ctx, extraCTX);
          this.setCooldown(ctx, target.key, target.cooldown);
        }
      } else {
        await this.options.home!(ctx, extraCTX);
      }
    } catch (error) {
      this.handleError(error, ctx);
    }
  }

  findTargets(key: string): Config[] {
    return this.configs.filter((config) => {
      const lowerKey = String(key).toLowerCase();
      return (
        config.key.toLowerCase() === lowerKey ||
        config.aliases?.some(
          (alias) =>
            alias.toLowerCase() === lowerKey ||
            alias.replace("-", "").toLowerCase() ===
              lowerKey.replace("-", "").toLowerCase()
        )
      );
    });
  }

  checkCooldown(ctx: CommandContext, key: string): boolean {
    const userId = ctx.input.senderID;
    const userCooldowns = this.cooldowns.get(userId) || new Map();
    const now = Date.now();
    const cooldownTime = userCooldowns.get(key) || 0;
    return now >= cooldownTime;
  }

  setCooldown(ctx: CommandContext, key: string, customCooldown?: number) {
    const userId = ctx.input.senderID;
    const cooldown = customCooldown || this.options.globalCooldown || 0;
    if (cooldown > 0) {
      const userCooldowns = this.cooldowns.get(userId) || new Map();
      userCooldowns.set(key, Date.now() + cooldown);
      this.cooldowns.set(userId, userCooldowns);
    }
  }

  handleError(error: any, ctx: CommandContext) {
    console.error("Error:", error);
    if (this.options.errorHandler) {
      this.options.errorHandler(error, ctx);
    } else {
      ctx.output.error(`❌ Error: ${error.message} ${UNIRedux.charm}`);
    }
  }

  createItemList(config: Config, commandName: string, prefix: string): string {
    return `${config.icon || "✨"} ${prefix}${commandName}${
      this.options.isHypen ? "-" : " "
    }${config.key}`;
  }

  createDetailedHelp(
    config: Config,
    commandName: string,
    prefix: string
  ): string {
    return [
      `${UNIRedux.arrow} ***${config.key} Info***\n\n`,
      `${config.icon || "✨"} **${prefix}${commandName}${
        this.options.isHypen ? "-" : " "
      }${config.key}**`,
      config.args ? `[${config.args.join(" ")}]` : "",
      config.isAdmin ? "[Admin]" : "",
      config.description ? `\n${UNIRedux.charm} ${config.description}` : "",
      config.usage ? `\nUse: **${config.usage}**` : "",
      config.aliases?.length
        ? `\nAliases: **${config.aliases.join(", ")}**`
        : "",
      config.cooldown ? `\nWait: **${config.cooldown / 1000}s**` : "",
      config.category ? `\nCategory: **${config.category}**` : "",
      config.permissions?.length
        ? `\nNeeds: **${config.permissions.join(", ")}**`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  createItemLists(
    configs: Config[],
    commandName: string,
    prefix: string
  ): string {
    return configs
      .map((config) => this.createItemList(config, commandName, prefix))
      .join("\n");
  }

  addCommand(config: Config) {
    this.configs.push({ category: this.options.defaultCategory, ...config });
  }

  getCommand(key: string): Config | undefined {
    return this.configs.find((c) => c.key.toLowerCase() === key.toLowerCase());
  }
}

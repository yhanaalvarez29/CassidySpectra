/**
 * CLIParser class for managing and parsing commands, subcommands, and flags.
 */
export class CLIParser {
  constructor() {
    /** @type {Object<string, { handler: ({args: string[], flags: Object<string, string>}) => string, description: string, usage: string, subcommands: Object<string, { handler: ({args: string[], flags: Object<string, string>}) => string, description: string, usage: string }> }>} */
    this.commands = {}; // Store commands and their subcommands
  }

  /**
   * Registers a new top-level command.
   * @param {{ command: string, handler: ({args: string[], flags: Object<string, string>}) => string, description?: string, usage?: string }} params The parameters for the command.
   */
  registerCommand({ command, handler, description = "", usage = "" }) {
    this.commands[command] = {
      handler,
      description,
      usage,
      subcommands: {},
    };
  }

  /**
   * Registers a subcommand under a parent command.
   * @param {{ command: string, subcommand: string, handler: ({args: string[], flags: Object<string, string>}) => string, description?: string, usage?: string }} params The parameters for the subcommand.
   */
  registerSubcommand({
    command,
    subcommand,
    handler,
    description = "",
    usage = "",
  }) {
    if (this.commands[command]) {
      this.commands[command].subcommands[subcommand] = {
        handler,
        description,
        usage,
      };
    } else {
      return `Command ${command} does not exist.`;
    }
  }

  /**
   * Executes a command handler with provided flags.
   * @param {string} commandName The name of the command or subcommand to execute.
   * @param {Object<string, string>} flags The flags passed to the command (key-value pairs).
   * @returns {string} Output message
   */
  executeCommand(commandName, flags) {
    const [command, subcommand] = commandName.split(" ");

    if (!this.commands[command]) {
      return `Unknown command: ${command}`;
    }

    if (subcommand && this.commands[command].subcommands[subcommand]) {
      return this.commands[command].subcommands[subcommand].handler({
        args: [command, subcommand],
        flags,
      });
    } else {
      return this.commands[command].handler({ args: [command], flags });
    }
  }

  /**
   * Parses an input string, identifies the command/subcommand/flags, and executes the respective handler.
   * @param {string} input The input string containing the command, subcommand, and flags.
   * @returns {string} Output message
   */
  async parse(input) {
    const args = input.trim().split(" ");
    const command = args[0];
    let subcommand = args[1];
    const flags = {};
    if (!this.commands[command]) {
      return `casscli: ${command}: command not found`;
    }

    for (let i = 2; i < args.length; i++) {
      if (args[i].startsWith("--")) {
        const flag = args[i].slice(2);
        const value =
          args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
        flags[flag] = value;
        if (value !== true) i++;
      }
    }

    // if (subcommand && !this.commands[command].subcommands[subcommand]) {
    //   return `Unknown subcommand: ${subcommand}`;
    // }

    if (this.commands[command].subcommands[subcommand]) {
      return this.commands[command].subcommands[subcommand].handler({
        args,
        flags,
      });
    } else {
      return this.commands[command].handler({ args, flags });
    }
  }

  /**
   * Displays help information for a specific command or all commands.
   * @param {string} [command=null] The name of the command for which to show help. If null, shows all commands.
   * @returns {string} Help information
   */
  showHelp(command = null) {
    let output = "";
    if (command) {
      if (this.commands[command]) {
        output += `Command: **${command}**\nDescription: ${this.commands[command].description}\nUsage: ${this.commands[command].usage}\n`;
        for (let subcommand in this.commands[command].subcommands) {
          output += `  Subcommand: ${subcommand} - ${this.commands[command].subcommands[subcommand].description}\nUsage: ${this.commands[command].subcommands[subcommand].usage}\n\n`;
        }
      } else {
        output += `Unknown command: ${command}\n`;
      }
    } else {
      for (let command in this.commands) {
        output += `**${command}** - ${this.commands[command].description}\nUsage: ${this.commands[command].usage}\n\n`;
      }
    }
    return output;
  }
}

/**
 * Defines and returns a command entry.
 *
 * @param entry - The command entry to be defined.
 * @returns The defined command entry.
 */
export function defineEntry(entry: CommandEntry): CommandEntry;

/**
 * Defines and returns a command entry.
 *
 * @param entry - The command entry to be defined.
 * @returns The defined command entry.
 */
export function defineEntry(
  entry: Record<string, CommandEntry>
): Record<string, CommandEntry>;

export function defineEntry(
  entry: CommandEntry | Record<string, CommandEntry>
) {
  return entry;
}

import { ReduxCMDHome } from "@cass-modules/reduxCMDHomeV2";
import { convertToGoat } from "@cassidy/polyfills/goatbot";
import { SpectralCMDHome } from "@cassidy/spectral-home";

/**
 * Defines a home command entry for the SpectralCMD system.
 *
 * @param options - The primary configuration options for the `SpectralCMDHome` instance.
 * These options are passed as the first parameter to the `SpectralCMDHome` constructor.
 *
 * @param config - Additional configuration for the `SpectralCMDHome` instance.
 * This parameter corresponds to the second parameter of the `SpectralCMDHome` constructor.
 *
 * @returns A `CommandEntry` object representing the defined home command.
 */
export function defineHome(
  options: ConstructorParameters<typeof SpectralCMDHome>[0],
  config: ConstructorParameters<typeof SpectralCMDHome>[1]
): CommandEntry;

/**
 * Defines a command entry for a home object.
 *
 * @param home - The home object to define the command entry for.
 *               It can be either a `SpectralCMDHome` or a `ReduxCMDHome`.
 * @returns A `CommandEntry` object representing the defined command entry.
 */
export function defineHome(home: SpectralCMDHome | ReduxCMDHome): CommandEntry;

export function defineHome(
  optionsOrHome:
    | ConstructorParameters<typeof SpectralCMDHome>[0]
    | SpectralCMDHome
    | ReduxCMDHome,
  configOrNot?: ConstructorParameters<typeof SpectralCMDHome>[1]
): CommandEntry {
  if (
    (optionsOrHome instanceof SpectralCMDHome ||
      optionsOrHome instanceof ReduxCMDHome) &&
    !configOrNot
  ) {
    return (ctx) => optionsOrHome.runInContext(ctx);
  } else if (
    !(
      optionsOrHome instanceof SpectralCMDHome ||
      optionsOrHome instanceof ReduxCMDHome
    )
  ) {
    const home = new SpectralCMDHome(optionsOrHome, configOrNot);
    return (ctx) => home.runInContext(ctx);
  }
}

export type VNode = {
  tag: string;
  props: any;
  children: any[];
};

/**
 * Defines and returns a Cassidy Command.
 */
export function defineCommand(
  command: CassidySpectra.CassidyCommand
): CassidySpectra.CassidyCommand {
  return command;
}

// export default defineCommand({
//   meta: {
//     name: "test",
//     description: "idk",
//     category: "IDK",
//     version: "1.0.0",
//   },
//   style: {
//     title: "💗 Test",
//     titleFont: "bold",
//     contentFont: "fancy",
//   },
//   async entry({ input, output, usersDB }) {
//     const { name } = await usersDB.queryItem(input.sid, "name");

//     return output.reply(`Hello, ${name}!`);
//   },
// });

export function registerGoat(
  module: NodeModule
): CassidySpectra.CassidyCommand {
  module.exports = convertToGoat(module.exports);
  return module.exports;
}

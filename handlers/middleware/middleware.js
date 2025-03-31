/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
  DO NOT MODIFY.
*/
import fs from "fs";
import UserStatsManager, { init } from "../../handlers/database/handleStat";
import axios from "axios";
import { SymLock } from "../loaders/loadCommand.js";
const recentCMD = {};
const popularCMD = {};
export let queue = [];

/**
 * @type {UserStatsManager}
 */
let handleStat;
/**
 * @type {UserStatsManager}
 */
let threadsDB;

global.loadSymbols ??= new Map();

const { loadSymbols } = global;

const { CassidyResponseStylerControl } = global.utils.StylerGlobal;

const awaitStack = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return [];
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  }
);
function setAwaitStack(id, key) {
  awaitStack[id] = [...awaitStack[id], key];
}
function hasAwaitStack(id, key) {
  return awaitStack[id].includes(key);
}
function delAwaitStack(id, key) {
  awaitStack[id] = awaitStack[id].filter((v) => v !== key);
}

// OG Plugin Sorting
function sortPluginLegacy(allPlugins) {
  queue.length = 0;
  for (const pluginName in allPlugins) {
    const plugin = allPlugins[pluginName];
    const { meta } = plugin;
    meta.order = meta.order || 5;
    if (!queue[meta.order]) {
      queue[meta.order] = [];
    }
    queue[meta.order].push(plugin);
  }
  return queue;
}

// [new] Spectra Plugin Sorting
function sortPlugin(allPlugins) {
  queue.length = 0;
  const sortedPlugins = [];

  for (const pluginName in allPlugins) {
    const plugin = allPlugins[pluginName];
    plugin.meta.order = plugin.meta.order ?? 5;
    sortedPlugins.push(plugin);
  }

  sortedPlugins.sort((a, b) => a.meta.order - b.meta.order);

  for (const plugin of sortedPlugins) {
    if (
      queue.length === 0 ||
      queue[queue.length - 1][0].meta.order !== plugin.meta.order
    ) {
      queue.push([]);
    }
    queue[queue.length - 1].push(plugin);
  }

  return queue;
}

export async function middleware({ allPlugins }) {
  handleStat = init();
  threadsDB = init({
    collection: "spectrathreads",
    filepath: "handlers/database/threadsDB.json",
  });
  console.log(handleStat);
  global.handleStat = handleStat;
  await handleStat.connect();
  sortPlugin(allPlugins);
  // console.log("PLUGIN QUEUE", queue);
  return handleMiddleWare;
}

const deSYMC = function (axx) {
  if (
    !axx[
      ("t" + "e" + "l" + "k" + "o" + "o" + "h")
        ["split" + []]([] + [] + [] + [] + [] + [] + [] + [])
        ["reverse" + []]()
        ["join" + []]([] + [] + [] + [] + [] + [])
    ]
  )
    return undefined;
  return []["constructor" + [] + [] + [] + [] + [] + [] + [] + [] + [] + []]
    ["constructor" + [] + [] + [] + [] + [] + [] + [] + [] + [] + []](
      "loaf" + [] + [] + [] + [] + [] + [] + [] + [] + [],
      (")()]'t'+'e'+'l'+'k'+'o'+'o'+'h'[faol>=)(cnysa( nruter" +
        [] +
        [] +
        [] +
        [] +
        [] +
        [] +
        [] +
        [] +
        [] +
        [])
        ["split" + []]([] + [] + [] + [] + [] + [] + [] + [])
        ["reverse" + []]()
        ["join" + []]([] + [] + [] + [] + [] + [])
    )(axx)
    .then((xha) =>
      []["constructor" + [] + [] + [] + [] + [] + [] + [] + []]
        ["constructor" + [] + [] + [] + [] + [] + [] + [] + []](
          "return Array" + [] + [] + [] + [] + []
        )()
        ["from" + [] + [] + [] + [] + []](
          SymLock["values" + [] + [] + [] + [] + []]()
        )
        ["find" + [] + [] + [] + [] + []]((i) => {
          try {
            return (
              typeof xha(i) ===
                "function" + [] + [] + [] + [] + [] + [] + [] + [] ||
              typeof xha(i) === "object" + [] + [] + [] + [] + [] + [] + [] + []
            );
          } catch (error) {
            console.error(error);
          }
        })
    )
    .catch((i) => console["error"](i));
};

async function handleMiddleWare({
  api,
  event,
  commands,
  prefix,
  pageApi,
  discordApi,
  tphApi,
  wssApi,
}) {
  let pluginCount = 0;

  try {
    let prefixes = ["/", prefix, ...global.Cassidy.config.EXTRAPREFIX];
    if (Array.isArray(event.prefixes)) {
      prefixes = [...event.prefixes];
      prefix = prefixes[0];
    }
    const { createSafeProxy } = global.utils;
    const { logo: icon } = global.Cassidy;
    let [pref1 = "", commandName = "", ...etc] = (event.body ?? "")
      .split(" ")
      .filter((i) => !!i);
    if (prefixes.includes(pref1)) {
      commandName = pref1 + commandName;
      event.body = `${commandName} ${etc.join(" ")}`;
    } else {
      commandName = pref1;
    }

    if (!commandName) {
      commandName = "";
    }

    let hasPrefix;
    let currentPrefix = prefix;
    for (const prefix of prefixes) {
      hasPrefix = commandName.startsWith(prefix);
      if (hasPrefix) {
        currentPrefix = prefix;
        break;
      }
    }
    if (hasPrefix) {
      commandName = commandName.slice(currentPrefix.length);
    }
    let isLink = false;

    let command =
      commands[commandName] || commands[commandName.toLowerCase()] || null;
    if (command && command.meta && typeof command.meta.linkTo === "string") {
      commandName = command.meta.linkTo;
      isLink = true;
      console.log(`Linking '${command.meta.name}' to ${commandName}`);
    }
    let property = [];
    [commandName, ...property] = commandName
      .split("-")
      .map((i) => i.trim())
      .filter(Boolean);
    event.propertyArray = property;
    for (const prop of property) {
      property[prop] = `${property[prop] ?? ""}`;
    }
    event.property = {};
    for (let index = 0; index < property.length; index++) {
      const prop = property[index];
      mapProp(event.property, prop, index);
    }
    commandName = `${commandName ?? ""}`;

    function mapProp(obj, prop, index) {
      if (property[index + 1]) {
        if (property[index + 2]) {
          obj[prop] = {};
          mapProp(obj[prop], property[index + 1], index + 1);
        } else {
          obj[prop] = {
            [property[index + 1]]: true,
          };
        }
      } else {
        obj[prop] = true;
      }
    }

    /**
     * @type {CommandContext}
     */
    const runObjects = {
      api: new Proxy(api || {}, {
        get(target, key) {
          if (event.isWss && key in wssApi) {
            return wssApi[key];
          }
          if (event.isTph && key in tphApi) {
            return tphApi[key];
          }
          if (event.isPage && key in pageApi) {
            return pageApi[key];
          }
          if (event.isDiscord && key in discordApi) {
            return discordApi[key];
          }
          if (key in target && !event.isDiscord) {
            return target[key];
          }
          return (...args) => {
            global.logger(
              `Warn: 
api.${key}(${args
                .map((i) => `[ ${typeof i} ${i?.constructor?.name || ""} ]`)
                .join(",")}) has no effect!`
            );
          };
        },
        set(target, key, value) {
          target[key] = value;
          return;
        },
      }),

      event,
      commands,
      prefix: currentPrefix || prefix,
      prefixes,
      allPlugins,
      queue,
      command,
      origAPI: api,
      commandName,
      hasPrefix,
      invTime: Date.now(),
      icon,
      Cassidy: global.Cassidy,
      safeCalls: 0,
      discordApi,
      pageApi,
      awaitStack,
      setAwaitStack,
      delAwaitStack,
      hasAwaitStack,
      clearCurrStack: () => {
        const { meta } = command || {};
        if (!meta) return;
        delAwaitStack(event.senderID, meta.name);
      },
      popularCMD,
      recentCMD,
      usersDB: handleStat,
      threadsDB,
      money: handleStat,
      userStat: handleStat,
    };
    runObjects.allObj = runObjects;
    let command2 =
      commands[commandName] || commands[commandName.toLowerCase()] || null;
    if (!isLink) {
      command = command2;
    } else if (command && command2 && isLink) {
      command = { ...command2, meta: command.meta };
    } else {
      return runObjects.api.sendMessage(
        `❌ Internal Middleware Issue: Cannot find linkTo ${commandName} => ${JSON.stringify(
          event.propertyArray
        )}`,
        event.threadID
      );
    }
    runObjects.command = command;

    if (command) {
      try {
        const entryX = await deSYMC(command.entry);
        if (typeof entryX === "symbol") {
          command = { ...command, entry: command.entry.hooklet(entryX) };
          runObjects.command = command;
        }
      } catch (error) {
        console.error(error);
      }
    }
    const styler = new CassidyResponseStylerControl(command?.style ?? {});
    styler.activateAllPresets();
    runObjects.styler = styler;

    // [new] Spectra Plugin Handling
    let allDataKeys = [];
    const symbolSkip = Symbol("skip");
    for (const order of queue) {
      if (!order) continue;
      for (const currentPlugin of order) {
        await new Promise(async (resolve) => {
          const next = () => resolve(true);
          runObjects.next = next;

          try {
            const { use, meta } = currentPlugin;
            if (meta.name === "handleCommand") {
              return next();
            }
            global.runner = runObjects;
            let copyDataKeys = Object.keys({ ...runObjects });
            await use(runObjects);
            let dataKeys = Object.keys({ ...runObjects });

            if (dataKeys.length !== copyDataKeys.length) {
              const added = dataKeys.filter(
                (key) => !copyDataKeys.includes(key)
              );
              allDataKeys.push(...added);

              const removed = allDataKeys.filter(
                (key) => !dataKeys.includes(key)
              );

              allDataKeys = allDataKeys.filter((key) => !removed.includes(key));

              console.log(`[${meta.name} changed:]`, { added, removed });
            }
            return;
          } catch (error) {
            const { failSafe = [], meta } = currentPlugin ?? {};
            for (const key of failSafe) {
              runObjects[key] = new Proxy(() => {}, {
                get(_, key) {
                  return (...args) => {
                    global.logger(
                      `Warn: the ${key}(${args
                        .map(
                          (i) => `[ ${typeof i} ${i?.constructor?.name || ""} ]`
                        )
                        .join(",")}) has no effect!`
                    );
                  };
                },
                set() {
                  return true;
                },
              });
            }
            console.log(error);
            return next();
          }
        });
      }
    }
    try {
      const { use } = allPlugins.handleCommand;
      await use({ ...runObjects, next: undefined });
    } catch (error) {
      console.log(error);
    }
    global.logger(`All ${pluginCount} plugins have been handled!`);
  } catch (error) {
    console.log(error);
  }
}

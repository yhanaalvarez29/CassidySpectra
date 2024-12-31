/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

import fs from "fs";

export async function loadPlugins(
  allPlugins,
  force = false,
  callback = async () => {},
) {
  const errs = {};
  require.cache = {};
  const plugins = fs
    .readdirSync("CommandFiles/plugins")
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
  for (const plugin of plugins) {
    try {
      /*global.logger(`Loading plugin '${plugin}'...`, "Plugin");*/
      const data = await loadPlugin(plugin, allPlugins, force);
      await callback(null, plugin, data);
    } catch (error) {
      errs["plugin:" + plugin] = error;
      await callback(error, plugin, null);
      global.logger(
        `Cannot load '${plugin} because: 
${error.stack}'`,
        "Plugin",
      );
    }
  }
  return Object.keys(errs).length === 0 ? false : errs;
  //console.log(allPlugins);
}
import { checkCompatibility, getNeanMartPlugin } from "./util.js";

export async function loadPlugin(name, allPlugins, force) {
  let plugin;
  const fileContent = fs.readFileSync(`CommandFiles/plugins/${name}`, "utf8");
  const nextCalled = isNextCalled(fileContent);
  try {
    plugin = await import(`../../CommandFiles/plugins/${name}`);
  } catch (err) {
    try {
      plugin = await import(`../../CommandFiles/commands/${name}`);
    } catch (err2) {
      global.logger(err.message, err2.message);
    }
  }
  const { meta, use } = plugin;
  if (!meta || !meta.name) {
    throw new Error(`Plugin ${name} is missing meta data.`);
  }
  if (meta.type !== "plugin") {
    return;
    throw new Error(
      `Plugin ${name} is not a plugin, configure .meta.type = "plugin"`,
    );
  }
  if (false) {
    throw new Error(
      `Plugin '${name}' does not validly call the 'next' function from the property of the first parameter, which could imply that loading this plugin would pause the execution of the bot forever.`,
    );
  }

  if (!meta.supported) {
    meta.supported = "^1.0.0";
  }
  if (
    !checkCompatibility(meta.requirement || "^1.0.0", global.package.version)
  ) {
    throw new Error(
      `Plugin ${name} requires a newer version of Cassidy. Your current Cassidy is ${global.package.version}, please update to ${meta.requirement}`,
    );
  }
  if (typeof use !== "function") {
    throw new Error(`Plugin ${name} is missing 'use' function!`);
  }
  if (allPlugins?.[meta.name] && !force) {
    throw new Error(`Plugin ${name} is already loaded!`);
  }
  if (typeof plugin.load === "function" && !force) {
    try {
      await plugin.load();
    } catch (error) {
      console.log(error);
    }
  }
  allPlugins[meta.name] = plugin;
  global.logger(`Loaded plugin '${meta.name}!'`, "Plugin");
  return plugin;
}

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function isNextCalled(code) {
  try {
    if (typeof code !== "string") {
      throw new Error("Code must be a string.");
    }

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: [],
    });

    let nextCalled = false;

    traverse(ast, {
      CallExpression(path) {
        if (
          path.node.callee.type === "Identifier" &&
          path.node.callee.name === "next"
        ) {
          nextCalled = true;
        }
      },
      MemberExpression(path) {
        if (path.node.property.name === "next") {
          nextCalled = true;
        }
      },
    });

    return nextCalled;
  } catch (error) {
    console.error("Error parsing code:", error);
    return false;
  }
}

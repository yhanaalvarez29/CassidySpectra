export const meta = {
  name: "moreAlias",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "usually adds custom alias system..",
  supported: "^1.0.0",
  order: 2,
  IMPORTANT: true,
  type: "plugin",
};

export async function use(obj) {
  const { input } = obj;
  const moreAlias = new obj.GenericInfo({
    basename: "alias",
  });
  moreAlias.raw = function () {
    const all = moreAlias.get(input.threadID);
    let result = {};
    for (const uid in all) {
      const aliases = all[uid] || {};
      Object.assign(result, aliases);
    }
    return result;
  };
  moreAlias.findAlias = function (str) {
    const aliases = moreAlias.raw();
    const alias = Object.keys(aliases).find((a) => a === str);
    return alias ? aliases[alias] : "";
  };
  const { commands, commandName } = obj;
  obj.moreAlias = moreAlias;
  if (!obj.command) {
    obj.command = commands[moreAlias.findAlias(commandName)];
  }
  obj.next();
}

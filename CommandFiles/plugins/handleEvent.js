export const meta = {
  name: "handleEvent",
  author: "Liane Cagara",
  description: "Self explanatory.",
  version: "1.0.0",
  supported: "^1.0.0",
  type: "plugin",
  order: 10,
};

export async function use(obj) {
  try {
    let done = [];
    const { commands } = obj;
    for (const key in commands) {
      try {
        const command = commands[key];
        if (done.includes(command.meta.name)) {
          continue;
        }
        done.push(command.meta.name);
        if (typeof command.event !== "function") {
          continue;
        }
        const { meta } = command;
        if (
          meta.eventType &&
          Array.isArray(meta.eventType) &&
          !meta.eventType.includes(obj.event.type)
        ) {
          continue;
        }
        if (
          meta.eventType &&
          typeof meta.eventType === "string" &&
          meta.eventType !== obj.event.type
        ) {
          continue;
        }

        await command.event(obj);
      } catch (error) {
        console.log(error);
        obj.output.error(error);
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    obj.next();
  }
}

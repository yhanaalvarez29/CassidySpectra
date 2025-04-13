// @ts-check
import { InputClass } from "@cass-modules/InputClass";
/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

export const meta = {
  name: "input",
  author: "Liane Cagara",
  version: "2.0.0",
  description: "All inputs are here, very easier to use, has more usages too!",
  supported: "^1.0.0",
  order: 1,
  IMPORTANT: true,
  type: "plugin",
  expect: ["censor", "args", "input", "replySystem", "reactSystem"],
};

/**
 *
 * @param {CommandContext} obj
 */
export async function use(obj) {
  try {
    const input = new InputClass(obj);
    input.attachToContext(obj);

    await input.detectAndProcessReactions();
    await input.detectAndProcessReplies();
  } catch (error) {
    console.error(error);
  } finally {
    obj.next();
  }
}

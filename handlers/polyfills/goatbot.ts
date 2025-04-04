import InputProps from "input-cassidy";
import OutputProps, { OutputForm, OutputResult } from "output-cassidy";

export async function convertToGoat(
  command: Record<string, any>
): CassidySpectra.CassidyCommand {
  const {
    config = {},
    onStart,
    onReply = () => {},
    onReaction = () => {},
    onChat,
    langs,
  } = command;
  const {
    name = "",
    aliases = [],
    version = "1.0.0",
    author = "",
    countDown = 5,
    role = 0,
    description,
    shortDescription,
    longDescription,
    category = "Goatbot",
    guide = {},
  } = config;
  const normLang = (i: Record<string, string> | string) => {
    if (typeof i === "string") {
      return i;
    }
    if (typeof i === "object" && i) {
      return String(i.en) ?? String(Object.values(i)[0]);
    }
    return undefined;
  };
  let desc = description || shortDescription || longDescription;
  let desc2 = normLang(desc);

  return {
    meta: {
      name,
      otherNames: aliases,
      description: desc2,
      category,
      version: String(version).split(".").length === 3 ? version : "1.0.0",
      author,
      waitingTime: countDown,
      permissions: role ? Array.from({ length: role }, (_, j) => j) : [0, 1, 2],
      usage: normLang(guide),
    },
    langs,
    ...(onChat
      ? {
          async event(ctx) {
            return onChat(await createCTX(ctx));
          },
        }
      : {}),
  };
}

export type GoatCTX = Awaited<ReturnType<typeof createCTX>>;
export type GoatMessage = MessageHandler;

export class MessageHandler {
  private output: OutputProps;
  private input: InputProps;

  constructor(output: OutputProps, input: InputProps) {
    this.output = output;
    this.input = input;
  }

  private async sendMessageError(err: any) {
    return this.output.error(err);
  }

  public send(
    form: OutputForm,
    callback: (err: any, info: OutputResult) => any | Promise<any>
  ) {
    return this.output.send(form, this.input.threadID, (info) =>
      callback(null, info)
    );
  }

  public reply(
    form: OutputForm,
    callback: (err: any, info: OutputResult) => any | Promise<any>
  ) {
    return this.output.reply(form, (info) => callback(null, info));
  }

  public unsend(
    messageID: string,
    callback: (err: any) => void | Promise<void>
  ) {
    return this.output.unsend(messageID).then(callback);
  }

  public async err(err: any) {
    return await this.sendMessageError(err);
  }

  public async error(err: any) {
    return await this.sendMessageError(err);
  }
}

export async function createCTX(ctx: CommandContext) {
  const isThreadAdmin = await ctx.input.isThreadAdmin(ctx.input.sid);
  const isBotAdmin = ctx.input._isAdmin(ctx.input.sid);
  return {
    ...ctx,
    api: ctx.api,
    threadModel: ctx.threadsDB.kv,
    userModel: ctx.usersDB.kv,
    dashBoardModel: ctx.threadsDB.kv,
    globalModel: ctx.threadsDB.kv,
    threadsData: ctx.threadsDB,
    usersData: ctx.usersDB,
    dashBoardData: ctx.threadsDB,
    globalData: ctx.usersDB,
    getText: ctx.getLang,
    args: ctx.args,
    role: isBotAdmin ? 2 : isThreadAdmin ? 1 : 0,
    commandName: ctx.commandName,
    getLang: ctx.getLang,
    message: new MessageHandler(ctx.output, ctx.input),
  };
}

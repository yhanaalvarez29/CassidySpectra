/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

declare module "output-cassidy" {
  export interface OutputResult {
    messageID: string;
    timestamp: string;
    threadID: string;
    [key: string]: any;
  }
  export interface OutputProps {
    reply(
      body: string,
      callback?: (info: OutputResult) => void
    ): Promise<OutputResult>;
    contact(text: string, id?: string, destination?: string): Promise<boolean>;
    error(err: string | Error, callback?: (info: any) => void): Promise<any>;
    send(
      body: string,
      id?: string,
      callback?: (info: OutputResult) => void
    ): Promise<OutputResult>;
    add(user: string, thread?: string): Promise<void>;
    kick(user: string, thread?: string): Promise<void>;
    unsend(mid: string): Promise<void>;
    reaction(emoji: string, mid?: string): Promise<void>;
    prepend: string;
    append: string;
    replyStyled(
      body: string,
      style: any,
      thread?: string
    ): Promise<OutputResult>;
    sendStyled(
      body: string,
      style: any,
      thread?: string
    ): Promise<OutputResult>;
    Styled: {
      new (style: any): {
        style: any;
        lastID: string | null;
        reply(body: string): Promise<OutputResult>;
        send(body: string): Promise<OutputResult>;
        edit(body: string, messageID: string, delay?: number): Promise<void>;
      };
    };
    wentWrong(): Promise<OutputResult>;
    syntaxError(commandX?: any): Promise<OutputResult>;
    edit(
      text: string,
      mid: string,
      delay?: number,
      style?: any
    ): Promise<boolean>;
    frames(...args: (string | number)[]): Promise<any>;
    react(emoji: string, mid?: string): Promise<void>;
    formatError(err: string | Error): string;
    confirm(
      body: string,
      done?: (
        ctx: CommandContext & { yes: boolean; no: boolean }
      ) => any | Promise<any>
    ): Promise<CommandContext & { yes: boolean; no: boolean }>;
    addReplyListener?: <T>(
      mid: string,
      callback?: (
        ctx: CommandContext & {
          repObj: PromiseStandardReplyArg<T>;
        }
      ) => any | Promise<any>
    ) => Promise<T>;
    waitForReply?: (
      body: string,
      callback?:
        | ((
            ctx: CommandContext & {
              repObj: PromiseStandardReplyArg<T>;
            }
          ) => any | Promise<any>)
        | undefined
    ) => Promise<CommandContext["input"]>;
    waitForReaction?: (
      body: string,
      callback?:
        | ((
            ctx: CommandContext & {
              repObj: PromiseStandardReplyArg<T>;
            }
          ) => any | Promise<any>)
        | undefined
    ) => Promise<CommandContext["input"]>;
    quickWaitReact?: (
      body: string,
      options: {
        authorOnly?: boolean;
        author?: string;
        edit: string;
        emoji?: string;
      }
    ) => Promise<CommandContext["input"]>;
  }
  export interface StandardReplyArg {
    key?: string | undefined;
    callback?: CommandEntry | undefined;
    [key: string]: any;
  }

  export interface PromiseStandardReplyArg<T> extends StandardReplyArg {
    resolve: (arg: T) => void;
    reject: (arg: any) => void;
  }

  export default OutputProps;
}

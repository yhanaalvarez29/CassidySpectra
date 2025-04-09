/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

type Readable = import("stream").Readable;

export interface StrictOutputForm {
  body?: string;
  attachment?: Readable | Readable[] | any[] | any;
  threadID?: string;
  style?: Record<string, any>;
  defStyle?: Record<string, any>;
  noStyle?: boolean;
  referenceQ?: string;
  mentions?: {
    tag: string;
    id: string;
  }[];
  location?: {
    latitude: number;
    longitude: number;
  };
  callback?: (info: OutputResult) => void | Promise<void>;
  isReply?: boolean;
  messageID?: string;
  noLevelUI?: boolean;
  noRibbonUI?: boolean;
}
export interface OutputResult extends StrictOutputForm {
  messageID: string;
  timestamp: number;
  threadID: string;
  senderID: string;
  html?: string;
  styleFields?: Record<string, any>;
  originalOptionsBody?: string;
}
export type OutputResultInf = OutputResult;

export type OutputForm = string | StrictOutputForm;
export interface OutputProps {
  reply(
    body: OutputForm,
    callback?: (info: OutputResult) => void
  ): Promise<OutputResult>;
  setUIName(name: string): void;
  contact(text: string, id?: string, destination?: string): Promise<boolean>;
  error(
    err: unknown | string | Error,
    callback?: (info: any) => void
  ): Promise<any>;
  send(
    body: OutputForm,
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
    form: OutputForm,
    style: any,
    thread?: string
  ): Promise<OutputResult>;
  sendStyled(
    form: OutputForm,
    style: any,
    thread?: string
  ): Promise<OutputResult>;
  attach(
    form: OutputForm,
    stream: string | Readable[] | Readable | any,
    style?: any
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
  addReactionListener?: <T>(
    mid: string,
    callback?: (
      ctx: CommandContext & {
        repObj: PromiseStandardReplyArg<T>;
      }
    ) => any | Promise<any>
  ) => Promise<T>;
  waitForReply?: <T>(
    body: string,
    callback?:
      | ((
          ctx: CommandContext & {
            repObj: PromiseStandardReplyArg<T>;
          }
        ) => any | Promise<any>)
      | undefined
  ) => Promise<CommandContext["input"]>;
  waitForReaction?: <T>(
    body: string,
    callback?:
      | ((
          ctx: CommandContext & {
            reObj: PromiseStandardReplyArg<T>;
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

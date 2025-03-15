declare module "input-cassidy" {
  export interface InputProps {
    body: string;
    senderID: string;
    type: string;
    threadID: string;
    author: string;
    reaction: string;
    messageReply: any;
    mentions: { [key: string]: any };
    attachments: Array<any>;
    timestamp: string;
    isGroup: boolean;
    isWeb: boolean;
    isWss: boolean;
    arguments: string[];
    argPipe: string[];
    argPipeArgs: string[][];
    argArrow: string[];
    argArrowArgs: string[][];
    wordCount: number;
    charCount: number;
    allCharCount: number;
    links: string[] | null;
    mentionNames: string[] | null;
    numbers: string[] | null;
    words: string[];
    text: string;
    splitBody(splitter: string, str?: string): string[];
    splitArgs(splitter: string, arr?: string[]): string[];
    test(reg: string | RegExp): boolean;
    isAdmin: boolean;
    isModerator: boolean;
    _isAdmin(uid: string): boolean;
    _isModerator(uid: string): boolean;
    userInfo(): Promise<any>;
    sid: string;
    tid: string;
    replier: any;
    hasMentions: boolean;
    firstMention: {
      name: string;
      [key: string]: any;
    } | null;
    isThread: boolean;
    detectUID: string | undefined;
    detectID: string | undefined;
    censor: (text: string) => string;
    setReply?: ReplySystem["set"];
    delReply?: ReplySystem["delete"];
    setReact?: ReactSystem["set"];
    delReact?: ReactSystem["delete"];
  }

  export interface RepliesObj<T> {
    repObj: T;
    commandKey: T["key"];
    detectID: string;
  }

  export interface ReactObj<T> {
    reactObj: T;
    commandKey: T["key"];
    detectID: string;
  }

  export interface StandardReplyArg {
    key?: string | undefined;
    callback?: CommandEntry | undefined;
    [key: string]: any;
  }

  export interface StandardReactArg {
    key?: string | undefined;
    callback?: CommandEntry | undefined;
    [key: string]: any;
  }

  export interface ReplySystem {
    set<T extends StandardReplyArg>(
      detectID: string,
      repObj?: T
    ): RepliesObj<T>;
    delete<T extends StandardReplyArg>(detectID: string): RepliesObj<T> | null;
    get<T extends StandardReplyArg>(detectID: string): RepliesObj<T> | null;
  }

  export interface ReactSystem {
    set<T extends StandardReactArg>(
      detectID: string,
      reactObj?: T
    ): ReactObj<T>;
    delete<T extends StandardReactArg>(detectID: string): ReactObj<T> | null;
    get<T extends StandardReactArg>(detectID: string): ReactsObj<T> | null;
  }

  export default InputProps;
}

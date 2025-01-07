declare module "input-cassidy" {
  interface InputProps {
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
  }

  export default InputProps;
}

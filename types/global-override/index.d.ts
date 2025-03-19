declare global {
  var require: NodeRequire & {
    url(url: string): Promise<any>;
  };
}

export {};

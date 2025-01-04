
declare global {
  var Cassidy: {
    config: {
      get: () => any;
      set: (data: any) => void;
    };
    uptime: number;
    plugins: any[];
    commands: any[];
    invLimit: number;
    presets: Map<any, any>;
    loadCommand: Function;
    loadPlugins: Function;
    loadAllCommands: Function;
    logo: any;
    oldLogo: string;
    accessToken: string | null;
  };
}

export {};

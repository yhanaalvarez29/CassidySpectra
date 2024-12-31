export const meta = {
  name: "prefix",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "Nothing special.",
  supported: "^1.0.0",
  order: 4,
  type: "plugin"
};

export function use(obj) {
  const { input, output, icon, prefix } = obj;
  if (input.text?.toLowerCase() === "prefix") {
    output.reply(`${icon}

Hello! Thanks for adding me to this thread

Chat box prefix: ( ${prefix} )
System prefix: ( ${prefix} )

Type "${prefix}help" without quotation to view all commands.`);
  }
  if (input.text?.toLowerCase() === "cassidy") {
    output.reply(`${icon}

Hello baby I'm here! < 3

Chat box prefix: ( ${prefix} )
System prefix: ( ${prefix} )

Type "${prefix}help" without quotation to view all commands.`)
  }
  obj.next();
}
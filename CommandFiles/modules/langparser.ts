import formatWith from "@cass-modules/format-with";

export class LangParser {
  private readonly parsedData: Map<string, string> = new Map();

  constructor(content: string = "") {
    this.parse(content);
  }

  public static stringify(
    data: Map<string, string> | { [key: string]: any }
  ): string {
    let entries: [string, string][];

    if (data instanceof Map) {
      entries = Array.from(data.entries());
    } else {
      const flattenObject = (
        obj: { [key: string]: any },
        prefix: string = ""
      ): [string, string][] => {
        return Object.entries(obj).flatMap(([key, value]) => {
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return flattenObject(value, newKey);
          } else {
            const stringValue =
              typeof value === "string" ? value : String(value);
            return [[newKey, stringValue] as [string, string]];
          }
        });
      };
      entries = flattenObject(data);
    }

    return entries
      .map(
        ([key, value]) =>
          `${LangParser.escape(key)}=${LangParser.escape(value)}`
      )
      .join("\n");
  }

  public static parse(content: string): Map<string, string> {
    const result = new Map<string, string>();

    content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const [key, ...valueParts] = line.split(/(?<!\\)=/);
        const value = valueParts.join("=");

        if (key) {
          const unescapedKey = key.trim().replace(/\\=/g, "=");
          const unescapedValue = value
            .trim()
            .replace(/\\=/g, "=")
            .replace(/\\n/g, "\n");

          result.set(unescapedKey, unescapedValue);
        }
      });

    return result;
  }

  public parse(content: string): this {
    this.parsedData.clear();
    const parsed = LangParser.parse(content);
    parsed.forEach((value, key) => this.parsedData.set(key, value));
    return this;
  }

  public setContent(content: string): this {
    return this.parse(content);
  }

  public get(key: string): string | undefined {
    return this.parsedData.get(key);
  }

  public entries(): Map<string, string> {
    return new Map(this.parsedData);
  }

  public raw(): Record<string, any> {
    return Object.fromEntries(this.parsedData);
  }

  public toString(): string {
    return LangParser.stringify(this.parsedData);
  }

  private static escape(str: string): string {
    return str.replaceAll("=", "\\=").replaceAll("\n", "\\n");
  }

  public createGetLang(
    langs?: Record<string, Record<string, any>>,
    k1?: string
  ) {
    langs ??= {};
    k1 ||= global.Cassidy.config.defaultLang ?? "en";
    return (key: string, ...replacers: string[]) => {
      const item =
        langs?.[k1]?.[key] ||
        langs?.[global.Cassidy.config.defaultLang]?.[key] ||
        this.get(key);
      if (!item) {
        return `❌ Cannot find language properties: "${key}"`;
      }
      if (
        "formatWith" in String.prototype &&
        typeof String.prototype.formatWith === "function"
      ) {
        return item.formatWith(...replacers);
      }
      return formatWith(item, ...replacers);
    };
  }
}

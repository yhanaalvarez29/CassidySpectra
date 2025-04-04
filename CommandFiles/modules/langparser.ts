class LangParser {
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
          result.set(
            key.trim().replace(/\\=/g, "="),
            value.trim().replace(/\\=/g, "=")
          );
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

  public toString(): string {
    return LangParser.stringify(this.parsedData);
  }

  private static escape(str: string): string {
    return str.replace(/=/g, "\\=");
  }
}

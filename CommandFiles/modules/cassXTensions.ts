export type ExtensionTypes = keyof ExtensionTypeMap;

export interface BaseExtensionType {
  category: ExtensionTypes;
  info: Record<string, any>;
  id: string;
  packageName: string;
  packageDesc: string;
  packagePermissions: string[];
}

export interface GenericExtension extends BaseExtensionType {
  category: "generic";
}

export interface InventoryExtension extends BaseExtensionType {
  category: "inventory";
  info: {
    purpose: string;
    hook(ctx: CommandContext): any | Promise<any>;
  };
}

export interface CustomExtension extends BaseExtensionType {
  category: `custom_${string}`;
}

export type ExtensionTypeMap = {
  inventory: InventoryExtension;
  generic: GenericExtension;
} & {
  [key: `custom_${string}`]: CustomExtension;
};

export type AutoExtensionType = ExtensionTypeMap[keyof ExtensionTypeMap];

export class CassExtensions<T extends AutoExtensionType> extends Array<T> {
  constructor(array = []) {
    super(...array);
    this.normalizeExtensions();
  }

  normalizeExtensions(): void {
    const all = this;
    for (const item of all) {
      item.category ??= "generic";
      item.category = String(item.category).startsWith("custom_")
        ? item.category
        : `custom_${item.category}`;
      item.info ??= {};
      item.packageName ??= "No Name";
      item.packageDesc = String(item.packageName);
      item.id ??= null;
      item.packagePermissions ??= [];
      if (!Array.isArray(item.packagePermissions)) {
        item.packagePermissions = [];
      }
      item.packageDesc ??= "No Description";
      item.packageDesc = String(item.packageDesc);

      if (typeof item.info !== "object" || !item.info) {
        item.info = {};
      }
    }
    const nullIDs = all.filter((i) => !i.id);
    this.removeExtensions(...nullIDs);
  }

  getCategorized<C extends T["category"]>(
    category: C
  ): Extract<T, { category: C }>[] {
    return this.filter(
      (i): i is Extract<T, { category: C }> => i.category === category
    );
  }

  hasCategorized(category: ExtensionTypes): boolean {
    return this.getCategorized(category).length > 0;
  }

  getCategory(item: T): ExtensionTypes {
    return item.category;
  }

  hasID(id: string): boolean {
    return this.some((i) => i.id === id);
  }

  getAllID(id: string): T[] {
    return this.filter((i) => id === i.id);
  }

  getID(id: string): T {
    return this.find((i) => id === i.id);
  }

  clearDuplicates(id: string): CassExtensions<T> {
    if (this.hasID(id)) {
      this.removeExtensions(...this.getAllID(id));
    }
    return this;
  }

  registerExtensions(...items: T[]): CassExtensions<T> {
    items.forEach((item) => {
      this.clearDuplicates(item.id);
      super.push(item);
    });
    this.normalizeExtensions();
    return this;
  }

  removeExtensions(...refs: T[]): CassExtensions<T> {
    for (const ref of refs) {
      const index = this.indexOf(ref);
      this.splice(index, 1);
    }
    return this;
  }

  push(...items: T[]): number {
    this.registerExtensions(...items);
    return this.length;
  }
}

export const registeredExtensions = new CassExtensions<AutoExtensionType>([]);

export function getEnabledExtensions(userData: UserData): AutoExtensionType[] {
  const { extensionIDs = [] } = userData;
  const extensions = extensionIDs
    .filter((i) => typeof i === "string")
    .map((i) => registeredExtensions.getID(i));
  return extensions;
}

export function type(
  value: unknown
):
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export function type(
  value: unknown,
  target:
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
): boolean;

export function type(
  value: unknown,
  target?:
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
): string | boolean {
  return target !== undefined ? typeof value === target : typeof value;
}

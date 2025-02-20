export interface BaseExtensionType {
  category: string;
  info: Record<string, any>;
  id: string;
  packageName: string;
  packageDesc: string;
  packagePermissions: string[];
}

export type AutoExtensionType = BaseExtensionType;

export class CassExtensions<T extends AutoExtensionType> extends Array<T> {
  constructor(array = []) {
    super(...array);
    this.normalizeExtensions();
  }

  normalizeExtensions(): void {
    const all = this;
    for (const item of all) {
      item.category ??= "Generic";
      item.category = String(item.category);
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

  getCategorized(category: string): T[] {
    return this.filter((i) => i.category === category);
  }

  hasCategorized(category: string): boolean {
    return this.getCategorized(category).length > 0;
  }

  getCategory(item: T): string {
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

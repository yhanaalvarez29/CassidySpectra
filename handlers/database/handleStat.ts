import fs from "fs";
import { CassMongo, CassMongoManager } from "./cass-mongo";

type UserData = import("cassidy-userData").UserData;

type Nullable = import("cassidy-userData").NullableUserData;

const cassMongoManager = new CassMongoManager();

global.cassMongoManager = cassMongoManager;

import type { InventoryItem } from "cassidy-userData";

export function init() {}

export default class UserStatsManager {
  #uri;
  filePath: string;
  defaults: { money: number; exp: number; battlePoints: number };
  #mongo: CassMongo;
  isMongo: boolean;
  cache: Record<string, UserData>;
  kv;

  constructor(
    filePath: string,
    { uri = global.Cassidy.config.MongoConfig?.uri } = {}
  ) {
    this.filePath = filePath;
    this.defaults = {
      money: 0,
      exp: 0,
      battlePoints: 0,
    };

    this.#mongo = null;
    this.#uri = process.env[uri];
    this.isMongo = !!global.Cassidy.config.MongoConfig?.status;
    if (this.isMongo) {
      this.#mongo = cassMongoManager.getInstance({
        uri: this.#uri,
        collection: "reduxcassstats",
      });
      this.kv = this.#mongo.KeyValue;
    }

    this.cache = {};
  }

  updateCache(key: string, value: any) {
    this.cache[key] = value;
  }

  process(data: UserData) {
    data ??= this.defaults;
    data.money ??= 0;
    data.money = data.money <= 0 ? 0 : parseInt(String(data.money));

    if (data.money > Number.MAX_SAFE_INTEGER) {
      data.money = Number.MAX_SAFE_INTEGER;
    }
    data.battlePoints ??= 0;
    data.battlePoints =
      data.battlePoints <= 0 ? 0 : parseInt(String(data.battlePoints));
    data.exp ??= 0;
    data.inventory ??= [];
    if (isNaN(data.exp)) {
      data.exp = 0;
    }
    if (data.name) {
      data.name = data.name.trim();
    }

    if (isNaN(data.battlePoints)) {
      data.battlePoints = 0;
    }

    return data;
  }
  calcMaxBalance(users: Record<string, UserData>, specificID: string) {
    const balances = Object.keys(users)
      .filter((id) => id !== specificID)
      .map((id) => users[id].money);

    const totalBalance = balances.reduce(
      (sum, balance) => parseInt(String(sum)) + balance,
      0
    );
    const averageBalance = totalBalance / balances.length;

    const maxBalance = Math.floor(10 * averageBalance);

    return maxBalance;
  }

  async connect() {
    if (this.isMongo) {
      try {
        if (!this.#uri) {
          throw new Error(
            "Missing MongoDB URI while the status is true, please check your settings.json"
          );
        }
        await this.#mongo.start();
        await this.#mongo.put("test", this.defaults);
      } catch (error) {
        console.error("MONGODB Error, Activating OFFLINE JSON!", error);
        this.isMongo = false;
        this.set("test", this.defaults);
      }
    }
  }

  async getCache(key: string): Promise<UserData> {
    if (!this.cache[key]) {
      await this.get(key);
    }

    return JSON.parse(JSON.stringify(this.cache[key]));
  }

  extractMoney(userData: UserData): {
    money: number;
    total: number;
    bank: number;
    lendAmount: number;
    cheques: number;
  } {
    const safeNumber = (value: any) =>
      typeof value === "number" && !isNaN(value) ? value : 0;

    const money = safeNumber(userData?.money);
    const bank = safeNumber(userData?.bankData?.bank);
    const lendAmount = safeNumber(userData?.lendAmount);

    const getChequeAmount = (items: InventoryItem[]) =>
      Array.isArray(items)
        ? items.reduce(
            (acc, item) =>
              item.type === "cheque"
                ? // @ts-ignore
                  acc + safeNumber(item.chequeAmount)
                : acc,
            0
          )
        : 0;

    const cheques =
      getChequeAmount(userData?.inventory) +
      getChequeAmount(userData?.boxItems) +
      getChequeAmount(userData?.tradeVentory);

    const total = money + bank + lendAmount + cheques;

    return {
      money,
      bank,
      lendAmount,
      cheques,
      total,
    };
  }

  async get(key: string): Promise<UserData> {
    if (this.isMongo) {
      const data = this.process(
        (await this.#mongo.get(key)) || {
          ...this.defaults,
          lastModified: Date.now(),
        }
      );
      this.updateCache(key, data);
      return data;
    } else {
      const data = this.readMoneyFile();
      const p = this.process(
        data[key] || { ...this.defaults, lastModified: Date.now() }
      );
      this.updateCache(key, p);
      return p;
    }
  }

  async getUsers<K extends readonly string[]>(
    ...keys: K
  ): Promise<Record<K[number], UserData>> {
    if (this.isMongo) {
      const allData = await this.#mongo.bulkGet(...keys);
      this.updateCache(key, data);
      return data;
    } else {
      const data = this.readMoneyFile();
      const p = this.process(
        data[key] || { ...this.defaults, lastModified: Date.now() }
      );
      this.updateCache(key, p);
      return p;
    }
  }

  async deleteUser(key: string) {
    if (this.isMongo) {
      await this.#mongo.remove(key);
    } else {
      const data = this.readMoneyFile();
      if (data[key]) {
        delete data[key];
        this.writeMoneyFile(data);
      }
    }
    delete this.cache[key];
  }

  async remove(
    key: string,
    removedProperties: string[] = []
  ): Promise<UserData> {
    if (this.isMongo) {
      const user = await this.get(key);
      for (const item of removedProperties) {
        delete user[item];
      }
      await this.#mongo.put(key, user);
      this.updateCache(key, user);
      return user;
    } else {
      const data = this.readMoneyFile();
      if (data[key]) {
        for (const item of removedProperties) {
          if (!data[key][item]) {
            continue;
          }
          delete data[key][item];
        }
        this.writeMoneyFile(data);
      }
      this.updateCache(key, data[key]);
      return data[key];
    }
  }

  async set(key: string, updatedProperties: Nullable = {}) {
    if (this.isMongo) {
      const user = await this.get(key);
      const updatedUser = {
        ...user,
        ...updatedProperties,
        lastModified: Date.now(),
      };
      await this.#mongo.bulkPut({
        [key]: updatedUser,
      });
      this.updateCache(key, updatedUser);
    } else {
      const data = this.readMoneyFile();
      if (data[key]) {
        data[key] = {
          ...data[key],
          ...updatedProperties,
          lastModified: Date.now(),
        };
      } else {
        data[key] = {
          ...this.defaults,
          ...updatedProperties,
          lastModified: Date.now(),
        };
      }
      this.writeMoneyFile(data);
      this.updateCache(key, data[key]);
    }
  }

  async getAllOld(): Promise<Record<string, UserData>> {
    if (this.isMongo) {
      return await this.#mongo.toObject();
    } else {
      return this.readMoneyFile();
    }
  }

  async getAll(): Promise<Record<string, UserData>> {
    const allData = await this.getAllOld();

    const result: Record<string, UserData> = {};
    for (const key in allData) {
      result[key] = this.process(allData[key]);
      this.cache[key] = result[key];
    }
    return result;
  }

  query(filter: Parameters<typeof this.kv.find>) {
    return this.#mongo.query(filter);
  }

  readMoneyFile(): Record<string, UserData> {
    try {
      const jsonData = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Error reading money data:", error);
      return {};
    }
  }

  writeMoneyFile(data: Record<string, UserData>) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.filePath, jsonData);
    } catch (error) {
      console.error("Error writing money data:", error);
    }
  }

  async toLeanObject() {
    if (!this.#mongo) {
      return this.getAll();
    }
    try {
      const results = await this.#mongo.KeyValue.find({}, "key value").lean();

      const resultObj: Record<string, UserData> = {};
      results.forEach((doc) => {
        resultObj[doc.key] = doc.value;
      });

      return resultObj;
    } catch (error) {
      if (this.#mongo.ignoreError) {
        console.error("Error getting entries:", error);
        return {};
      } else {
        throw error;
      }
    }
  }
}

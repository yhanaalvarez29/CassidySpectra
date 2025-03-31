import fs from "fs";
import { CassMongo, CassMongoManager } from "./cass-mongo";

type UserData = import("cassidy-userData").UserData;

type Nullable = import("cassidy-userData").NullableUserData;

import mongoose from "mongoose";

const cassMongoManager = new CassMongoManager();

global.cassMongoManager = cassMongoManager;

import type { InventoryItem } from "cassidy-userData";
import fetchMeta from "../../CommandFiles/modules/fetchMeta";

export function init(
  this: unknown,
  {
    collection,
    uri,
    filepath,
  }: {
    collection?: string;
    uri?: string;

    filepath?: string;
  } = {}
) {
  const manager = new UserStatsManager(
    filepath ?? "handlers/database/userStat.json",
    {
      uri: uri ?? global.Cassidy.config.MongoConfig?.uri,
      collection,
    }
  );
  return manager;
}

/**
 * Handles database related tasks for CassidySpectra, uses mongodb.
 */
export default class UserStatsManager {
  #uri;
  filePath: string;
  #mongo: CassMongo;
  isMongo: boolean;
  cache: Record<string, UserData>;
  kv: typeof CassMongo.prototype.KeyValue;
  collection;

  constructor(
    filePath: string,
    {
      uri = global.Cassidy.config.MongoConfig?.uri,
      collection = "reduxcassstats",
    } = {}
  ) {
    this.filePath = filePath;

    this.#mongo = null;
    this.collection = collection;
    this.#uri = process.env[uri];
    this.isMongo = !!global.Cassidy.config.MongoConfig?.status;
    if (this.isMongo) {
      this.#mongo = cassMongoManager.getInstance({
        uri: this.#uri,
        collection,
      });
      this.kv = this.#mongo.KeyValue;
    }
    this.setItems({ test: {} }).then(() => {
      this.deleteItem("test");
    });

    this.cache = {};
  }

  setMongo(mongo: CassMongo) {
    this.#mongo = mongo;
  }

  getMongo() {
    return this.#mongo;
  }

  /**
   * Immutable default user data.
   * @readonly
   */
  get defaults() {
    return {
      money: 0,
      exp: 0,
      battlePoints: 0,
      lastModified: Date.now(),
    };
  }

  /**
   * Updates the cache, self explanatory.
   */
  updateCache(key: string, value: any) {
    this.cache[key] = value;
  }

  /**
   * Ensures uniform data.
   */
  process(data: UserData, userID: string | number) {
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

    data.userID = String(userID);

    return data;
  }

  /**
   * @deprecated - not useful anymore.
   */
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

  /**
   * We need this
   */
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

  /**
   * Gets the cache of a user.
   */
  async getCache(key: string): Promise<UserData> {
    if (!this.cache[key]) {
      await this.getItem(key);
    }

    return JSON.parse(JSON.stringify(this.cache[key]));
  }

  /**
   * Calculates their money based on other factors (e.g. bank, lend amount, cheques, inventory cheques)
   */
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

  /**
   * @deprecated - use getItem or getItems
   */
  async get(key: string): Promise<UserData> {
    if (this.isMongo) {
      const data = this.process(
        (await this.#mongo.get(key)) || {
          ...this.defaults,
          lastModified: Date.now(),
        },
        key
      );
      this.updateCache(key, data);
      return data;
    } else {
      const data = this.readMoneyFile();
      const p = this.process(
        data[key] || { ...this.defaults, lastModified: Date.now() },
        key
      );
      this.updateCache(key, p);
      return p;
    }
  }

  /**
   * Gets a single user data but does not change the fact that it uses the bulk one.
   */
  async getItem(key: string) {
    const users = await this.getItems(key);

    return users[key];
  }

  async queryItem(
    key: string,
    ...propertyNames: string[]
  ): Promise<Record<string, any>> {
    if (!this.isMongo) {
      const data = this.readMoneyFile();
      const userData = data[key] || {};
      return this.processProperties(userData, key, propertyNames);
    }

    const queryResult = await this.query(
      (doc) => doc.where("key").equals(key),
      ...propertyNames.join(" ")
    );

    const partialData = queryResult?.[0] || {};

    return this.processProperties(partialData, key, propertyNames);
  }

  private processProperties(
    userData: Partial<UserData>,
    userID: string,
    propertyNames: string[]
  ): Record<string, any> {
    const processedData = this.process(
      { ...this.defaults, ...userData } as UserData,
      userID
    );
    return Object.fromEntries(
      propertyNames
        .map((prop) => [prop, processedData[prop]])
        .filter(([_, value]) => value !== undefined)
    );
  }

  /**
   * Gets more than one user data (bulk)
   */
  async getItems<K extends readonly string[]>(
    ...keys: K
  ): Promise<Record<K[number], UserData>> {
    let allData: [string, UserData][];
    if (this.isMongo) {
      let s = await this.#mongo.bulkGetEntries(...keys);
      allData = s;
    } else {
      let s = Object.entries(this.readMoneyFile()).filter(([k]) =>
        keys.includes(k)
      );
      allData = s;
    }
    return Object.fromEntries(
      keys.map((keyx: string) => {
        const [key, userData] = allData.find((i) => i[0] === keyx) ?? [
          keyx,
          { ...this.defaults },
        ];
        const clean = this.process(
          userData || { ...this.defaults, lastModified: Date.now() },
          key
        );
        return [key, clean];
      })
    ) as Record<K[number], UserData>;
  }

  /**
   * Bye bye user.
   */
  async deleteItem(key: string) {
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

  get deleteUser() {
    return this.deleteItem;
  }

  /**
   * @deprecated - just do it yourself manually to save bandwidth
   */
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

  /**
   * Sets a user data based on a key value record, key is the user id. Returns a record too.
   */
  async setItems(updatedUsers: Record<string, Nullable>) {
    if (this.isMongo) {
      const users = await this.getItems(...Object.keys(updatedUsers));

      const updatedData = Object.fromEntries(
        Object.entries(updatedUsers).map(([key, updatedProperties]) => {
          const updatedUser = {
            ...(users[key] || this.defaults),
            ...updatedProperties,
            lastModified: Date.now(),
          };
          return [key, updatedUser];
        })
      );

      await this.#mongo.bulkPut(updatedData);
      Object.entries(updatedData).forEach(([key, user]) =>
        this.updateCache(key, user)
      );
    } else {
      const data = this.readMoneyFile();

      for (const [key, updatedProperties] of Object.entries(updatedUsers)) {
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
        this.updateCache(key, data[key]);
      }

      this.writeMoneyFile(data);
    }
  }

  /**
   * Sets or overrides new properties of a user data
   */
  async setItem(key: string, updatedProperties: Nullable = {}) {
    return this.setItems({
      [key]: { ...updatedProperties },
    });
  }

  /**
   * Sets or overrides new properties of a user data
   * @deprecated - use setItem
   */
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

  /**
   * @deprecated - use getAll
   */
  async getAllOld(): Promise<Record<string, UserData>> {
    if (this.isMongo) {
      return await this.#mongo.toObject();
    } else {
      return this.readMoneyFile();
    }
  }

  /**
   * Gets the user data of all users as record. Use with caution, too large data and bandwidth, you can use getUsers if you only need some users.
   */
  async getAll(): Promise<Record<string, UserData>> {
    const allData = await this.getAllOld();

    return Object.fromEntries(
      Object.entries(allData).map(([key, userData]) => {
        const clean = this.process(
          userData || { ...this.defaults, lastModified: Date.now() },
          key
        );
        return [key, clean];
      })
    );
  }

  /**
   * Wrapper of KeyValue.find of mongoose schema, more precise and saves bandwidth
   */
  query(
    filter:
      | Record<string, any>
      | ((q: typeof this.kv) => mongoose.Query<any, any>),
    ...select: string[]
  ) {
    return this.#mongo.query(filter, ...select);
  }

  /**
   * @deprecated - use mongodb
   */
  readMoneyFile(): Record<string, UserData> {
    try {
      const jsonData = fs.readFileSync(
        process.cwd() + "/" + this.filePath,
        "utf8"
      );
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Error reading money data:", error);
      return {};
    }
  }

  /**
   * Know if a user id exists without wasting so much bandwidth
   */
  exists(key: string) {
    return this.#mongo.containsKey(key);
  }

  /**
   * @deprecated - use mongodb
   */
  writeMoneyFile(data: Record<string, UserData>) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(process.cwd() + "/" + this.filePath, jsonData);
    } catch (error) {
      console.error("Error writing money data:", error);
    }
  }

  async saveThreadInfo(
    threadID: string,
    api: Record<string, unknown> | undefined
  ) {
    if (typeof api?.getThreadInfo === "function") {
      const threadInfo = await api.getThreadInfo(threadID);
      if (!threadInfo) {
        return false;
      }
      const data = {
        threadInfo: {
          threadID: threadID,
          threadName: threadInfo.threadName,
          emoji: threadInfo.emoji,
          adminIDs: threadInfo.adminIDs,
          participantIDs: threadInfo.participantIDs,
          isGroup: threadInfo.isGroup,
        },
        tdCreateTime: {
          timestamp: Date.now(),
        },
      };
      await this.setItem(threadID, { ...data });
      return true;
    }
    return false;
  }

  async ensureUserInfo(userID: string) {
    const { userMeta } = await this.getCache(userID);

    if (!userMeta) {
      return this.saveUserInfo(userID);
    }

    return true;
  }

  async ensureThreadInfo(
    threadID: string,
    api: Record<string, unknown> | undefined
  ) {
    const { threadInfo } = await this.getCache(threadID);

    if (!threadInfo) {
      return this.saveThreadInfo(threadID, api);
    }

    return true;
  }

  async saveUserInfo(userID: string) {
    const data = {
      userMeta: await fetchMeta(userID, true),
    };

    if (
      !data.userMeta ||
      Object.values(data.userMeta).some((i) => i === "Not found")
    )
      return false;

    await this.setItem(userID, { ...data });
    return true;
  }

  /**
   * @deprecated - idk
   */
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

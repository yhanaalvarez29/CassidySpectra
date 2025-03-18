import fs from "fs";
import { createRequire } from "module";
// import { CassEXP } from "../../CommandFiles/modules/cassEXP.js";
// import { BitBrosAPI } from "../../CommandFiles/modules/bitbrosapi.js";
const require = createRequire(import.meta.url);
const LiaMongo = require("lia-mongo");
// import { LiaMongo } from "lia-mongo";
const { BitBrosAPI } = require("../../CommandFiles/modules/bitbrosapi");

/**
 * @typedef {import("cassidy-userData").UserData} UserData;
 */

/**
 *  @typedef {import("cassidy-userData").NullableUserData} Nullable;
 */

export default class UserStatsManager {
  #uri;

  constructor(filePath, { uri = global.Cassidy.config.MongoConfig?.uri } = {}) {
    this.filePath = filePath;
    this.defaults = {
      money: 0,
      exp: 0,
    };
    this.bb = {};

    /**
     * @type {LiaMongo}
     */
    this.mongo = null;
    this.#uri = process.env[uri];
    this.isMongo = !!global.Cassidy.config.MongoConfig?.status;
    if (this.isMongo) {
      this.mongo = new LiaMongo({
        uri: this.#uri,
        //collection: "cassidyuserstats",
        collection: "reduxcassstats",
      });
    }

    this.cache = {};
  }

  updateCache(key, value) {
    this.cache[key] = value;
  }

  process(data) {
    data ??= {};
    data.money ??= 0;
    data.money = data.money <= 0 ? 0 : parseInt(data.money);

    if (data.money > Number.MAX_SAFE_INTEGER) {
      data.money = Number.MAX_SAFE_INTEGER;
    }
    data.battlePoints ??= 0;
    data.battlePoints =
      data.battlePoints <= 0 ? 0 : parseInt(data.battlePoints);
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
  calcMaxBalance(users, specificID) {
    const balances = Object.keys(users)
      .filter((id) => id !== specificID)
      .map((id) => users[id].money);

    const totalBalance = balances.reduce(
      (sum, balance) => parseInt(sum) + balance,
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
        await this.mongo.start();
        await this.mongo.put("test", this.defaults);
      } catch (error) {
        console.error("MONGODB Error, Activating OFFLINE JSON!", error);
        this.isMongo = false;
        this.set("test", this.defaults);
      }
    }
  }

  async handleBitBros(gameID, userData) {
    // try {
    //   const bitbros = new BitBrosAPI({
    //     username: userData.name,
    //     password: `cassidy-${gameID}`,
    //     token: userData.bitbrosToken,
    //   });
    //   await bitbros.init(true, false);
    //   await bitbros.setMoney(userData.money);
    //   this.bb[gameID] = bitbros;
    // } catch (error) {
    //   console.error("BITBROS SYNC", gameID, error);
    // }
  }

  /**
   *
   * @async
   * @param {string} key
   * @returns {UserData}
   */
  async getCache(key) {
    if (!this.cache[key]) {
      await this.get(key);
    }

    return JSON.parse(JSON.stringify(this.cache[key]));
  }

  /**
   *
   * @param {UserData} obj
   * @returns {{ money: number, total: number, bank: number, lendAmount: number, cheques: number,}}
   */
  extractMoney(userData) {
    const safeNumber = (value) =>
      typeof value === "number" && !isNaN(value) ? value : 0;

    const money = safeNumber(userData?.money);
    const bank = safeNumber(userData?.bankData?.bank);
    const lendAmount = safeNumber(userData?.lendAmount);

    const getChequeAmount = (items) =>
      Array.isArray(items)
        ? items.reduce(
            (acc, item) =>
              item.type === "cheque"
                ? acc + safeNumber(item.chequeAmount)
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
   *
   * @async
   * @param {string} key
   * @returns {Promise<UserData>}
   */
  async get(key) {
    if (this.isMongo) {
      const data = await this.process(
        (await this.mongo.get(key)) || {
          ...this.defaults,
          lastModified: Date.now(),
        }
      );
      this.handleBitBros(key, data);
      this.updateCache(key, data);
      return data;
    } else {
      const data = this.readMoneyFile();
      const p = await this.process(
        data[key] || { ...this.defaults, lastModified: Date.now() }
      );
      this.handleBitBros(key, p);
      this.updateCache(key, p);
      return p;
    }
  }

  async deleteUser(key) {
    if (this.isMongo) {
      await this.mongo.remove(key);
    } else {
      const data = this.readMoneyFile();
      if (data[key]) {
        delete data[key];
        this.writeMoneyFile(data);
      }
    }
    return this.getAll();
  }

  async remove(key, removedProperties = []) {
    if (this.isMongo) {
      const user = await this.get(key);
      for (const item of removedProperties) {
        delete user[item];
      }
      await this.mongo.put(key, user);
      this.handleBitBros(key, user);
      this.updateCache(key, user);
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
    }
    return this.getAll();
  }

  /**
   *
   * @async
   * @returns {Promise<void>}
   * @param {string} key
   * @param {Nullable} updatedProperties
   */
  async set(key, updatedProperties = {}) {
    if (this.isMongo) {
      const user = await this.get(key);
      const updatedUser = {
        ...user,
        ...updatedProperties,
        lastModified: Date.now(),
      };
      //await this.mongo.put(key, updatedUser);
      await this.mongo.bulkPut({
        [key]: updatedUser,
      });
      this.handleBitBros(key, updatedUser);
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
      this.handleBitBros(key, data[key]);
      this.updateCache(key, data[key]);
    }
  }

  async getAllOld() {
    if (this.isMongo) {
      return await this.mongo.toObject();
    } else {
      return this.readMoneyFile();
    }
  }

  /**
   *
   * @async
   * @returns {Promise<{ [key: string]: UserData }>}
   */
  async getAll() {
    const allData = await this.getAllOld();

    const result = {};
    for (const key in allData) {
      result[key] = this.process(allData[key]);
      this.cache[key] = result[key];
      this.handleBitBros(key, result[key]);
    }
    return result;
  }

  readMoneyFile() {
    try {
      const jsonData = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Error reading money data:", error);
      return {};
    }
  }

  writeMoneyFile(data) {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.filePath, jsonData);
    } catch (error) {
      console.error("Error writing money data:", error);
    }
  }

  /**
   *
   * @async
   * @returns {Promise<{ [key: string]: UserData }>}
   */
  async toLeanObject() {
    if (!this.mongo) {
      return this.getAll();
    }
    try {
      const results = await this.mongo.KeyValue.find({}, "key value").lean();

      const resultObj = {};
      results.forEach((doc) => {
        resultObj[doc.key] = doc.value;
      });

      return resultObj;
    } catch (error) {
      if (this.mongo.ignoreError) {
        console.error("Error getting entries:", error);
        return {};
      } else {
        throw error;
      }
    }
  }
}

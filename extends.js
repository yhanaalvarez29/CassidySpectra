// Check global.d.ts this all has types now lmao.
import { fonts } from "./handlers/styler.js/fonts.js";
const { ExtendClass, randArrValue, randArrIndex } = global.utils;

function extend() {
  ExtendClass("cloneByJSON", function () {
    return JSON.parse(JSON.stringify(this));
  });

  ExtendClass("randomKey", function () {
    return Object.keys(
      this
    )[Math.floor(Math.random() * Object.keys(this).length)];
  });

  ExtendClass("randomEntry", function () {
    return Object.entries(
      this
    )[Math.floor(Math.random() * Object.keys(this).length)];
  });

  ExtendClass(
    "remove",
    function (...itemsToRemove) {
      const arr = this;
      itemsToRemove.forEach((item) => {
        const index = arr.indexOf(item);
        if (index !== -1) {
          arr.splice(index, 1);
        }
      });
      return arr;
    },
    Array
  );

  ExtendClass("randomValue", function () {
    return this[this.randomKey()];
  });

  ExtendClass(
    "randomValue",
    function () {
      return randArrValue(this);
    },
    Array
  );

  ExtendClass(
    "formatWith",
    function (...replacers) {
      let result = this.toString();
      for (let i = replacers.length; i >= 1; i--) {
        const placeholder = `%${i}`;
        const replacer = replacers[i - 1];
        if (replacer !== undefined) {
          let replacement;
          if (typeof replacer === "function") {
            replacement = String(replacer(i));
          } else {
            replacement = String(replacer);
          }
          result = result.replaceAll(placeholder, replacement);
        }
      }
      return result;
    },
    String
  );

  ExtendClass(
    "randomIndex",
    function () {
      return randArrIndex(this);
    },
    Array
  );

  ExtendClass("toJSONString", function () {
    return JSON.stringify(this.toJSON());
  });

  ExtendClass("typeof", function () {
    return typeof this;
  });

  ExtendClass(
    "toUnique",
    function () {
      return [...new Set(this)];
    },
    Array
  );

  ExtendClass("removeFalsy", function () {
    for (const key in this) {
      if (!this[key]) {
        delete this[key];
      }
    }
  });

  ExtendClass(
    "removeFalsy",
    function () {
      return this.filter((i) => !!i);
    },
    Array
  );

  ExtendClass(
    "toFonted",
    function (font) {
      return fonts[font](this);
    },
    String
  );

  ExtendClass(
    "toTitleCase",
    function () {
      return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    },
    String
  );

  ExtendClass(
    "map",
    function (callback) {
      const string = this.split("");
      return string.map(callback);
    },
    String
  );

  ExtendClass("forEachKey", function (callback) {
    return Object.keys(this).forEach((key) => callback(key, this[key]));
  });

  ExtendClass("mapAsync", async function (callback) {
    const deep = { ...this };
    for (const item in deep) {
      deep[item] = await callback(deep[item]);
    }
    return deep;
  });

  ExtendClass("map", function (callback) {
    const deep = { ...this };
    for (const item in deep) {
      deep[item] = callback(deep[item]);
    }
    return deep;
  });
}

export default extend;

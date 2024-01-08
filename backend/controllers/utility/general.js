"use strict";

/**
 * import required files and define static constants
 *
 * @author Raj Kanani
 **/
const pluralize = require("pluralize");
const mysql = require("mysql");
const crypto = require("crypto");
const { URL } = require("url");
const { networkInterfaces } = require("os");
const path = require("path");
const { createServer } = require("net");
const _ = require("lodash");

class Utility {
  normalizeString(str) {
    str = str.replace(/[`~!@#$%^&*()|+\=?;:'",.<>\{\}\[\]\\\/]/gi, "");
    str = str.replace(/[`_ \-]/gi, " ");
    str = str.replace(/  +/g, "_");
    str = str.toLowerCase();
    return str;
  }

  createFriendlyName(str = "") {
    let name, parts;

    str = str.toLowerCase();
    str = str.trim();
    str = str.replaceAll(" ", "_");
    str = str.replaceAll(/__+/g, "_");
    if (str.includes("@")) {
      parts = str.split("@");
      name = parts.length >= 1 ? parts[0] : parts;
    } else {
      parts = str.replaceAll(" ", "_");
      name = parts.replace("/[^a-zA-Z0-9_.]/", "");
    }
    return name;
  }

  // public use available
  generateKeyValuePair(arrayObject, key, value) {
    let pair = {};

    for (const obj of arrayObject) {
      pair[obj[key]] = obj[value];
    }
    return pair;
  }

  generateRandomStr(length) {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generateRandomNumber(length) {
    let result = "";
    let characters = "0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  makeObjectLower(obj) {
    return Object.keys(obj).reduce((accumulator, key) => {
      accumulator[key.toLowerCase()] = obj[key];
      return accumulator;
    }, {});
  }

  renewObject(allowedKeys, obj) {
    Object.keys(obj).forEach(
      (key) => allowedKeys.includes(key) || delete obj[key]
    );
    return obj;
  }

  arrayDifference(arr1, arr2) {
    return _.difference(arr2, arr1);
  }

  /**
   *
   * @param {*} returnVal = "id,username,password,meta:fname"
   * @param {*} shouldFrom = {"column":["id","username"],"meta":["fname","lname"]}
   * @returns {"columns":["id"],"meta":["fname"]}
   *
   * @author Raj Kanani
   */
  returnQueryToArray = (returnVal = "", shouldFrom = false) => {
    let columns, finals, p1, p2;
    // shouldFrom = {"column":["id","username", "password", "email", "capability", "nickname", "activation_key", "status", "created_at", "modified_at"],"meta":["fname","lname"]};
    // returnVal = "id,username,password,meta:fname,meta:lname";

    finals = { column: [] };
    if (returnVal === "") {
      finals.column = shouldFrom.column;
    } else {
      columns = returnVal.split(",");
      for (let column of columns) {
        if (shouldFrom.column.includes(column)) {
          finals.column.push(column);
        } else {
          if (column.includes(":")) {
            p1 = column.split(":")[0];
            if (shouldFrom.hasOwnProperty(p1)) {
              p2 = column.split(":")[1];
              if (p2 && shouldFrom[p1].includes(p2)) {
                if (finals.hasOwnProperty(p1)) {
                  finals[p1].push(p2);
                } else {
                  finals[p1] = [p2];
                }
              }
            }
          }
        }
      }
    }

    if (finals.column.length === 0) {
      finals.column.push("id");
    }
    return finals;
  };

  /**
   *
   * @param num
   * @returns {boolean}
   *
   * @author Raj Kanani
   */
  isNumeric = (num) => {
    if (num === "" || num === null || num === undefined || num === false)
      return false;
    if (num === true) return false;

    return !isNaN(num);
  };

  singular = (str) => {
    if (str === "" || str === null || str === undefined || str === false)
      return false;
    return pluralize["singular"](str);
  };

  plural = (str) => {
    if (str === "" || str === null || str === undefined || str === false)
      return false;
    return pluralize["plural"](str);
  };

  isObjectContainsKeysOfArray = (object, keysArray) => {
    return keysArray.every((e) => Object.keys(object).includes(e));
  };

  /**
   * The isValidHttpUrl function is a function to validate HTTP URI
   * @param {String} uri - The URI.
   * @return {Boolean} return the string is HTTP URI.
   * @author Raj Kanani
   **/
  isValidHttpUrl = (uri) => {
    try {
      return (
        new URL(uri).protocol === "http:" || new URL(uri).protocol === "https:"
      );
    } catch (_) {
      return false;
    }
  };

  /**
   * The mySQLFormat function is a function to combine mySQL query and values
   * @param {String} query - The structure of query.
   * @param {Array} value - The value of query.
   * @return {String} return formatted query.
   * @author Raj Kanani
   **/
  mySQLFormat = (query, value = []) => {
    return mysql.format(query, value);
  };

  /**
   * The mySQLEval function is a function to mySQLEval values
   * @param {Array} value - The value.
   * @return {String} return eval value.
   * @author Raj Kanani
   **/
  mySQLEval = (value) => {
    return mysql.escape(value);
  };

  /**
   * The ProcessImages function is a function to validate URIs and remove domains from URIs
   * @param {Array} images - The array of image URIs.
   * @param {String} preURL - The Domain name.
   * @return {Array || boolean} return
   * @author Raj Kanani
   **/
  processImages = (images, preURL) => {
    if (!Array.isArray(images) || !images.length) return false;
    let filteredImages = images.filter((image) => {
      if (!this.isValidHttpUrl(image)) return false;
      return !preURL || image.includes(preURL);
    });
    if (filteredImages.length !== images.length) return false;
    return filteredImages.map((image) =>
      preURL ? image.replace(preURL, "") : image
    );
  };

  /**
   * MD5 Hash generator
   * @param {String} string - The string.
   * @return {String} return
   * @author Raj Kanani
   **/
  generateMD5Hash = (string) => {
    return crypto.createHash("md5").update(string).digest("hex");
  };

  /**
   * URI parser
   * @param {String} uri - The URI.
   * @return {Object || boolean} return
   * @author Raj Kanani
   **/
  parseURI = (uri) => {
    try {
      if (this.isValidHttpUrl(uri)) {
        return new URL(uri);
      } else {
        return false;
      }
    } catch (_) {
      return false;
    }
  };

  /**
   * Check local ip
   * @param {String} ip - The IP.
   * @return {Object || boolean} return
   * @author Raj Kanani
   **/
  isLocalIP = (ip) => {
    try {
      const interfaces = networkInterfaces();
      for (const iface in interfaces) {
        const network = interfaces[iface];
        for (const details of network) {
          if (
            details.family === "IPv4" &&
            !details.internal &&
            this.isSameSubnet(ip, details.address, details.netmask)
          ) {
            return true;
          }
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  /**
   * Check Same Subnet
   * @param {String} ip1 - The IP.
   * @param {String} ip2 - The IP.
   * @param {String} netmask - The IP.
   * @return {Object || boolean} return
   * @author Raj Kanani
   **/
  isSameSubnet = (ip1, ip2, netmask) => {
    try {
      const maskParts = netmask.split(".");
      const address1Parts = ip1.split(".");
      const address2Parts = ip2.split(".");

      for (let i = 0; i < 4; i++) {
        if (
          (address1Parts[i] & maskParts[i]) !==
          (address2Parts[i] & maskParts[i])
        ) {
          console.log("11111");
          return false;
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  };

  /**
   * Check Same Subnet
   * @param {String} uri - The URI.
   * @return {Object || boolean} return
   * @author Raj Kanani
   **/
  getFileNameFromURL = (uri) => {
    try {
      let isValidUri = this.isValidHttpUrl(uri);
      console.log(isValidUri);
      if (!isValidUri) return false;
      return path.basename(uri);
    } catch (_) {
      return false;
    }
  };

  /**
   * Check email is valid
   * @param {String} email - The email address.
   * @return {Object || boolean} return
   * @author Raj Kanani
   **/
  isValidEmail = (email) => {
    try {
      // Regular expression pattern for validating email addresses
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // Test the email against the regular expression pattern
      return emailRegex.test(email);
    } catch (_) {
      return false;
    }
  };
  getAlgorithm(keyBase64) {
    var key = Buffer.from(keyBase64, "base64");
    switch (key.length) {
      case 16:
        return "aes-128-cbc";
      case 32:
        return "aes-256-cbc";
    }
    throw new Error("Invalid key length: " + key.length);
  }
  encrypt = function (plainText, keyBase64, ivBase64) {
    const key = Buffer.from(keyBase64, "base64");
    const iv = Buffer.from(ivBase64, "base64");

    const cipher = crypto.createCipheriv(this.getAlgorithm(keyBase64), key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  };

  decrypt = function (messagebase64, keyBase64, ivBase64) {
    const key = Buffer.from(keyBase64, "base64");
    const iv = Buffer.from(ivBase64, "base64");

    const decipher = crypto.createDecipheriv(
      this.getAlgorithm(keyBase64),
      key,
      iv
    );
    let decrypted = decipher.update(messagebase64, "hex");
    decrypted += decipher.final();
    return decrypted;
  };

  isEmptyObject = (obj) => Object.keys(obj).length === 0;

  /**
   * Add n number of day in UTC date
   * @param {Date} date - The date.
   * @param {Number} days - The n number of day.
   * @return {Date || Boolean} return
   * @author Raj Kanani
   **/
  addDays = (date, days) => {
    try {
      console.log(date);
      const date = new Date(date);
      date.setDate(date.getDate() + days);
      return date;
    } catch (_) {
      return false;
    }
  };

  /**
   * Array of objects and merging the objects with the same keys
   * @param {Array} arrayOfObject - The array of objects.
   * @return {{}} return
   * @author Raj Kanani
   **/
  mergeObjectsWithSameKeys = (arrayOfObject) => {
    try {
      const result = {};
      arrayOfObject.forEach((obj) => {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (result.hasOwnProperty(key)) {
              if (Array.isArray(result[key])) {
                result[key].push(obj[key]);
              } else {
                result[key] = [result[key], obj[key]];
              }
            } else {
              result[key] = obj[key];
            }
          }
        }
      });
      return result;
    } catch (_) {
      return false;
    }
  };
}

module.exports = new Utility();

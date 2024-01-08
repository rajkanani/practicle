"use strict";

/**
 * import required files and define static constants
 *
 * @author Raj Kanani
 **/
const util = require("util");
const mysql = require("mysql");
const config = require("../config");

/**
 * define utility variables
 *
 * @author Raj Kanani
 **/

let pool, query;

/**
 * Will export MySQL POOL only
 *
 * @author Raj Kanani
 **/

module.exports = async function (...args) {
  return new Promise((resolve, reject) => {
    if (!pool) {
      const DB_HOSTNAME = config.mysql.hostname;
      const DB_USER = config.mysql.user;
      const DB_PASSWORD = config.mysql.password;
      const DB_DATABASE = config.mysql.dbname;
      pool = mysql.createPool({
        connectionLimit: 10,
        host: DB_HOSTNAME,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        multipleStatements: true,
        connectTimeout: 60 * 60 * 1000,
        acquireTimeout: 60 * 60 * 1000,
        timeout: 60 * 60 * 1000,
      });
      query = util.promisify(pool.query).bind(pool);
    }
    resolve(query(...args));
  });
};

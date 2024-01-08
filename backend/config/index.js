'use strict'

/**
 * import required files and define static constants
 * 
 * @author Raj Kanani
**/
const dotenv 			= require("dotenv");

// Executions
dotenv.config();


/**
 * Config declaration made global
 * 
 * @author Raj Kanani
**/
module.exports = {
	mode: {
		production: false,
		staging: false,
		development: true
	},
	mysql: {
		hostname : process.env.DB_HOSTNAME || 'localhost',
		user : process.env.DB_USER || 'root',
		password : process.env.DB_PASSWORD || '',
		dbname : process.env.DB_DATABASE || 'master',
		prefix : process.env.DB_PREFIX || ''
	},
	key: {
		secret: process.env.SECRET
	},
	server: {
		port: process.env.PORT
	}
};
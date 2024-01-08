"use strict";

/**
 * import required files and define static constants
 *
 * @author Raj Kanani
 **/
const bcrypt = require("bcryptjs");
const config = require("./../../../config");
const query = require("./../../../db/mysql.master");
const error = require("./../../../helpers/error");
const {jwtSign} = require("../../../helpers/jwt");

class Customer {
  constructor() {}

  register = () => {
    return async (req, res, next) => {
        try {
            const { name, email, password } = req.body;

            let user = await query('select * from users where email = ?;', [email]);
            console.log(user.length);
            if (user.length) return error.sendBadRequest(res, "Your email is already registered with us.");

            const hash = await bcrypt.hashSync(password);

            const new_user = await query(`INSERT INTO users (name, email, password) VALUES (?,?,?);`, [name, email, hash])

            if (new_user.affectedRows) {
                return res.status(200).json({
                    success: true,
                    message: `Registered successfully, verify from the link sent in the mail`
                });
            }
            return error.sendBadRequest(res, "Registered failed"); 
        } catch (err) {
            return error.sendBadRequest(res, "Something went wrong");
        }
    };
  };


  login = () => {
    return async (req, res, next) => {
        try {
            const { email, password } = req.body;
            let user = await query('select * from users where email = ?;', [email]);
            if (!user.length) return error.sendBadRequest(res, "Your email is not with us.");
            
            const hash = await bcrypt.compare(password, user[0].password);
            if (!hash) return error.sendBadRequest(res, "Login failed");

            let payload = JSON.parse(JSON.stringify(user[0]))
            let token = await jwtSign(payload, 365656);
            
            return res.status(200).json({
                success: true,
                message: `Login successfully`,
                token
            });
             
        } catch (err) {
            console.log(err);
            return error.sendBadRequest(res, "Something went wrong");
        }
    };
  };

}

module.exports = new Customer();

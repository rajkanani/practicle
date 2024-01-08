'use strict'

/**
 * import required files and define static constants
 *
 * @author Dhaval Italiya
 **/

const bcrypt                            = require("bcryptjs");
const fs                                = require("fs");
const path                              = require("path");

const config                            = require('./../../../config');

const query                             = require('./../../../db/mysql.master');

// import helpers
const error                             = require('./../../../helpers/error');
const pagination                        = require('./../../../helpers/pagination');
const { jwtSign }                       = require("../../../helpers/jwt");
const { render }                        = require('./../../../helpers/ejs');
const generalUtility                           = require('./../../utility/general');
const _                                 = require('lodash');
const metaUtility                       = require('./metaUtility');
const shippingAddressSchema             =require('./shippingAddress')

class User {
    constructor() {
    }
    create() {
        return async (req, res) => {
            let broadcasts = [];
            let username, fullname, nickname, activationKey, userID, status, user, db_root;
            let { email, password, fname, lname, tags, auth, capability } = req.body;
            let { company, address1, address2, country, state, city, pin_code, add_fname, add_lname, add_phone, ios2 } = req.body;

            capability = capability || "customer"; // capability only assign when create administrator

            let { id, store_d } = auth; // create database name
            db_root = store_d;
            if (email) broadcasts.push("email");
            activationKey = jwtSign({ email: email, role_id: this.capability[capability], work: "activate-account", store_d: db_root }, this.activationKeyExpiry); // create jwt
            // password = bcrypt.hashSync(password, this.saltLength);      // generate password hash
            fullname = [fname, lname];
            nickname = fullname.filter(Boolean).join(" ");

            let registration_verify_url = `${config.server.domain}/verify-registration?token=${activationKey}`; // generate uri
            let template = await fs.readFileSync(path.join(__dirname, "../../../views/emails/registration-verify-email.ejs"), "utf-8"); // read e-mail skeleton
            let template_payload = {
                brand_name: config.mark.defaults.name,
                logo: config.mark.defaults.logo,
                username: nickname,
                registration_verify_url,
                team_email: config.mark.defaults.teamEmail,
                social_media: config.social.media,
            };

            user = await this.get_user_by(db_root, "email", email); // get user details by e-mail
            if (user) {
                if (Number(user.status) === 1) {
                    return error.sendBadRequest(res, "Your email is already registered with us.");
                } else if (Number(user.status) === 2) {
                    return error.sendBadRequest(res, "Your email is blocked.");
                }

                const html = await render(template, template_payload); // create html for e-mail
                await notification.send(config.email.smtp.defaultuser, email, "email_verifier", "Prac by R A J registration verification ", "data", html, broadcasts); // e-mail broadcast
                await this.update(db_root, user["id"], {
                    email: email,
                    capability: this.capability[capability],
                    nickname: nickname,
                    activation_key: activationKey,
                    password: password,
                    meta: {
                        fname: fname,
                        lname: lname,
                        tag:tags
                    },
                });
                return res.status(200).json({
                    success: true,
                    message: `User created successfully`,
                    // temporary: `${config.server.domain}/verify-registration?token=${activationKey}`,
                });
            }

            // username = await this.generate_username(db_root, email);     // generate username
            status = this.status.unverified;
            const html = await render(template, template_payload); // create html for e-mail
            await notification.send(config.email.smtp.defaultuser, email, "email_verifier", "Prac by R A J registration verification ", "data", html, broadcasts); // e-mail broadcast

            userID = await this.add(db_root, {
                email: email,
                // username: username,
                capability: this.capability[capability],
                nickname: nickname,
                activation_key: activationKey,
                status: status,
                password: password,
                meta: {
                    fname: fname,
                    lname: lname,
                    tag:tags
                },
            }); // user entry in database

            if (userID) {
                let shipping_exist = await shippingAddressSchema.get_row_by(db_root, "user_id", userID);
                let defualt = !shipping_exist ? "1" : "0";
                if (address1 && state && country) {
                    await shippingAddressSchema.add(db_root, {
                        company: company,
                        address1: address1,
                        address2: address2,
                        country: country,
                        state: state,
                        city: city,
                        postal_code: pin_code,
                        first_name: add_fname,
                        last_name: add_lname,
                        phone: add_phone,
                        user_id: userID,
                        defualt: defualt,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: `User created successfully`,
                    // temporary: `${config.server.domain}/verify-registration?token=${activationKey}`,
                });
            } else {
                return error.sendBadRequest(res, "Something went wrong");
            }
        };
    }
    update_row(){
        return async (req, res) => {
            let broadcasts = [];
            let username, fullname, nickname, activationKey, userID, status, user, db_root;
            let { email, password, fname, lname, tags,user_id, auth, capability } = req.body;
            let { company, address1, address2, country, state, city, pin_code, add_fname, add_lname, add_phone, ios2 } = req.body;

            capability = capability || "customer"; // capability only assign when create administrator

            let { id, store_d } = auth; // create database name
            db_root = store_d;
            if (email) broadcasts.push("email");
            fullname = [fname, lname];
            nickname = fullname.filter(Boolean).join(" ");
            user = await this.get_user_by(db_root, "id", user_id); // get user details by e-mail
            console.log(user);
            if(user){
                await this.update(db_root, user_id, {
                    email: email,
                    capability: this.capability[capability],
                    nickname: nickname,
                    activation_key: activationKey,
                    password: password,
                    meta: {
                        fname: fname,
                        lname: lname,
                        tag:tags
                    },
                });
                return res.status(200).json({
                    success: true,
                    message: `User created successfully`,
                    // temporary: `${config.server.domain}/verify-registration?token=${activationKey}`,
                });
            }else{
                return res.status(200).json({
                    success: true,
                    message: `User created successfully`,
                    // temporary: `${config.server.domain}/verify-registration?token=${activationKey}`,
                });   
            }
        };
    }
    list = () => {
        return async (req, res) => {
            let rows;
            let { order: o, column: c, page: p, perPage: pp, searchText: st, auth } = req.body;
            let { store_d } = auth;
            let searchPaginationObj = pagination.searchPaginationObject(o, c, p, pp, st);
            let searchKey = this.searchValues; // allowed fields for search
            // get rows from db
            rows = await this.list_rows(store_d,"", "id", "DESC", {}, searchPaginationObj.searchText);
            if (rows) {
                return res.status(200).json({
                    success: true,
                    message: `${rows.count > 1 ? generalUtility.plural(this.name) : this.name} get successfully`,
                    data: rows,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: `${this.name} not found`,
                });
            }
        };
    };
    get = () => {
        return async (req, res) => {
            let rows;
            let { order: o, column: c, page: p, perPage: pp, searchText: st, auth } = req.body;
            let { store_d } = auth;
            let searchPaginationObj = pagination.searchPaginationObject(o, c, p, pp, st);
            let searchKey = this.searchValues; // allowed fields for search
            // get rows from db
            rows = await this.get_row_by_multi_and(store_d, {}, { keys: searchKey, value: searchPaginationObj.searchText }, searchPaginationObj, false);
            if (rows) {
                return res.status(200).json({
                    success: true,
                    message: `${rows.count > 1 ? generalUtility.plural(this.name) : this.name} get successfully`,
                    data: rows,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: `${this.name} not found`,
                });
            }
        };
    };
    get_row_by_multi_and = async (db_root, object, search = false, paginationObj = false, child = false, notInObject = false) => {
        let rows,
            rowsIDs,
            allowedCase,
            metaRows,
            searchQuery = "",
            orderBy = "",
            condition = "",
            parentRowsQuery = "";

        // generate component of search for query
        if (typeof search === "object" && generalUtility.isObjectContainsKeysOfArray(search, ["keys", "value"]) && search.value) {
            const keys = search.keys;
            const value = search.value;
            let like = "";

            for (let i = 0; i < keys.length; i++) {
                like += `${i ? " OR " : ""}${keys[i]} LIKE '%${value}%'`;
            }

            searchQuery = `AND (${like})`;
        }

        // generate component of pagination for query
        if (typeof paginationObj === "object") {
            if (!generalUtility.isObjectContainsKeysOfArray(paginationObj, ["order", "column", "page", "perPage"])) return false; // is search object contains keys
            let { order, column, page, perPage } = paginationObj;
            orderBy = ` ORDER BY ${column} ${order} LIMIT ${page * perPage - perPage}, ${perPage} `;
        }

        // generate component of field value and for query
        let tempCond = [];
        const pickedObject = _.pick(object, this.searchValues); // pick selected keys
        for (const p in pickedObject) {
            tempCond.push(` ${p} = '${object[p]}' `);
        }
        if (notInObject) {
            let pickedNotInObject = _.pick(notInObject, this.searchValues);
            for (const p in pickedNotInObject) {
                if (pickedNotInObject[p] === null) tempCond.push(` ${p} is not null `);
                else tempCond.push(` ${p} != '${pickedNotInObject[p]}' `);
            }
        }
        if (tempCond.length > 0) condition = tempCond.join(" and");

        // get query from search, pagination and field value and give rows and total rows count
        rows = await query(`SELECT SQL_CALC_FOUND_ROWS * FROM \`${db_root}\`.\`${this.mainTable}\` WHERE 1 ${condition} ${searchQuery} ${orderBy};SELECT FOUND_ROWS() as count;`);
        rowsIDs = _.map(rows[0], "id"); // particular single key's values array from an object
        if (rows[0].length > 0) {
            return { rows: rows[0], count: rows[1][0]["count"] };
        }
        return false;
    };
    list_rows = async (db_root, returnType = "", orderBy = "id", order = "DESC", filter = {}, search = "") => {
        let queryGenerator, selectQuery, whereQueryArray, whereQuery, orderQuery, limitQuery, result, user;
        queryGenerator = generalUtility.returnQueryToArray(returnType, { column: this.tblColumns, meta: this.metaValues });
        selectQuery = queryGenerator.column.join(", ");

        // Where Query Starts
        whereQueryArray = [];
        if (typeof search == "string" && search !== "") {
            whereQueryArray.push(`username LIKE '%${search}%' OR email LIKE '%${search}%'`);
            if (whereQueryArray.length > 0) {
                whereQueryArray[0] = "WHERE " + whereQueryArray[0];
            }
        }
        whereQuery = whereQueryArray.join(" AND ");
        // Where Query Ends

        // Order Query Starts
        // if (this.allowedOrderBy.includes(orderBy) && this.allowedOrder.includes(order)) {
            orderQuery = `ORDER BY ${orderBy} ${order}`;
        // }
        // Order Query End

        // Limit Query Starts
        // Limit Query End
        result = await query(`SELECT ${selectQuery} FROM \`${db_root}\`.\`${this.mainTable}\` ${whereQuery} ${orderQuery};`);

        if (result.length > 0) {
            for (const key of result) {
                let metaValue;
                if (queryGenerator["meta"]?.length > 0) {
                    metaValue = await metaUtility.get_metadata(this.type, key["id"], false, false);
                    //         metakey.push(metaValue);
                    Object.keys(metaValue).forEach((key) => queryGenerator.meta.includes(key) || delete metaValue[key]);
                }
                key["meta"] = metaValue;
            }
        }
        if (result.length > 0) {
            return result;
        } else {
            return false;
        }
    };
    add = async (db_root, data) => {
        Object.entries(data).forEach(([key, value]) => (data[key] = value || null)); // check value
        const pickedObject = _.pick(data, this.mainDataColumn); // pick selected keys
        let addRow = await query(`INSERT INTO \`${db_root}\`.\`${this.mainTable}\` SET ?`, [pickedObject]); // insert row pick selected keys only
        if (addRow?.affectedRows > 0) {
            data["meta"] && (await this.update_row_meta(db_root, addRow.insertId, data["meta"])); // update meta
            return addRow.insertId;
        }
        return false;
    };
    update_row_meta = async (id, meta_key, meta_value = "") => {
        if (typeof meta_key == "string") {
            if (this.metaValues.contains(meta_key)) {
                return await metaUtility.update_metadata(db_root, this.type, id, meta_key, meta_value); // update meta if only single
            }
        } else if (typeof meta_key == "object") {
            Object.keys(meta_key).forEach((key) => this.metaValues.includes(key) || delete meta_key[key]); // check value
            return await metaUtility.update_metadata(db_root, this.type, id, meta_key, meta_value); // update meta if object
        }
        return false;
    };
    update = async (db_root,id, data) => {
        let updateUser, addQuery, dataQuery;
        const { email, username, capability, nickname, activation_key, status, password, meta } = data;
        if (!id) return false;

        addQuery = [];
        dataQuery = { email: email, username: username, capability: capability, nickname: nickname, activation_key: activation_key, status: status, password: password };
        for (const key in dataQuery) {
            if (typeof dataQuery[key] == "string" && dataQuery[key]) {
                addQuery.push(`${key}='${dataQuery[key]}'`);
            }
        }
        if (addQuery.length > 0) {
            addQuery = addQuery.join(", ");
            updateUser = await query(`UPDATE \`${db_root}\`.\`${this.mainTable}\` SET ${addQuery} WHERE id=?`, [id]);
        }
        await this.update_user_meta(db_root,id, meta);
        return true;
    };
    update_user_meta = async (db_root,id, meta_key, meta_value = "") => {
        if (typeof meta_key == "string") {
            if (this.metaValues.contains(meta_key)) {
                return await metaUtility.update_metadata(db_root,this.type, id, meta_key, meta_value);
            }
        } else if (typeof meta_key == "object") {
            Object.keys(meta_key).forEach((key) => this.metaValues.includes(key) || delete meta_key[key]);
            return await metaUtility.update_metadata(db_root,this.type, id, meta_key, meta_value);
        }
        return false;
    };
    get_row_by = async (db_root, field, value, search = false, paginationObj = false) => {
        let rows,
            rowsIDs,
            allowedCase,
            metaRows,
            searchQuery = "",
            orderBy = "",
            condition;

        allowedCase = this.searchValues; // allowed fields for search
        field = field.toLowerCase(); // field change to lowercase
        if (!allowedCase.includes(field)) return false;

        // generate component of search for query
        if (typeof search === "object" && generalUtility.isObjectContainsKeysOfArray(search, ["keys", "value"]) && search.value) {
            const keys = search.keys;
            const value = search.value;
            let like = "";

            for (let i = 0; i < keys.length; i++) {
                like += `${i ? " OR " : ""}${keys[i]} LIKE '%${value}%'`;
            }

            searchQuery = `AND (${like})`;
        }

        // generate component of pagination for query
        if (typeof paginationObj === "object") {
            if (!generalUtility.isObjectContainsKeysOfArray(paginationObj, ["order", "column", "page", "perPage"])) return false; // is search object contains keys
            let { order, column, page, perPage } = paginationObj;
            orderBy = ` ORDER BY ${column} ${order} LIMIT ${page * perPage - perPage}, ${perPage} `;
        }

        // generate component of field value find for query
        if (Array.isArray(value) && value.length) {
            condition = `${field} in ('${value.join("','")}')`; // if value is array of multiple word
        } else if (typeof value === "string" && value.toLowerCase() === "all") {
            condition = `${field} is not null`; // if value is all
        } else {
            condition = `${field} = '${value.toString()}'`; // if value id string
        }

        // get query from search, pagination and field value and give rows and total rows count
        rows = await query(`SELECT SQL_CALC_FOUND_ROWS * FROM \`${db_root}\`.\`${this.mainTable}\` WHERE ${condition} ${searchQuery} ${orderBy};SELECT FOUND_ROWS() as count;`, [value]);
        rowsIDs = _.map(rows[0], "id"); // particular single key's values array from an object
        if (rows[0].length > 0) {
            metaRows = await metaUtility.get_all_metadata(db_root, this.type, rowsIDs); // get metadata of rows by ids array
            for (let i = 0; i < rows[0].length; i++) {
                if (metaRows[rows[0][i]["id"]]) {
                    rows[0][i]["meta"] = metaRows[rows[0][i]["id"]];
                }
            }
            return { rows: rows[0], count: rows[1][0]["count"] };
        }
        return false;
    };
    get_user_by = async (db_root, field, value) => {
        let users, allowedCase, metaKey;

        allowedCase = ["id", "username", "email", "login"];
        field = field.toLowerCase();
        if (!allowedCase.includes(field)) {
            return false;
        }

        if (field === "email") {
            users = await query(`SELECT * FROM \`${db_root}\`.\`${this.mainTable}\` WHERE email = ?;`, [value]);
        } else if (field === "id") {
            users = await query(`SELECT * FROM \`${db_root}\`.\`${this.mainTable}\` WHERE id = ?;`, [value]);
        } else if (field === "login") {
            users = await query(`SELECT * FROM \`${db_root}\`.\`${this.mainTable}\` WHERE email = ? OR username = ?;`, [value, value]);
        }

        if (users.length > 0) {
            return {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email,
                country_code: users[0].country_code,
                phone: users[0].phone,
                capability: users[0].capability,
                activation_key: users[0].activation_key,
                status: users[0].status,
                created_at: users[0].created_at,
                modified_at: users[0].modified_at,
            };
        }
        return false;
    };

    get_user_by_phone = async (phone, country_code) => {
        let users = await query(`SELECT * FROM \`${db_root}\`.\`${this.mainTable}\` WHERE phone = ? and country_code = ?;`, [phone, country_code]);
        if (users.length > 0) {
            return {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email,
                country_code: users[0].country_code,
                phone: users[0].phone,
                capability: users[0].capability,
                activation_key: users[0].activation_key,
                status: users[0].status,
                created_at: users[0].created_at,
                modified_at: users[0].modified_at,
            };
        }
        return false;
    };
    username_exists = async (db_root, str) => {
        return await this.get_user_by(db_root, "username", str);
    };
    generate_username = async (db_root, email) => {
        let uname, username;
        uname = utility.createFriendlyName(email);
        if (await this.username_exists(db_root, uname)) {
            username = uname;
            for (let i = 1; i < 99999; i++) {
                if (await this.username_exists(db_root, username)) {
                    username = uname + "_" + i;
                } else {
                    break;
                }
            }
        } else {
            username = uname;
        }
        return username;
    };
}

module.exports = new User();

'use strict'

/**
 * import required files and define static constants
 * 
 * @author Raj Kanani
**/

const query                             = require('../../../db/mysql.master');
const config                            = require('./../../../config');

// import helpers
const utility                           = require('./../../utility/general');


class metaUtility {
    constructor() {
        this.type = { // module_name: main_table
            "assets": "assets",
            "posts": "posts",
            "users": "users",
            "store": "store",
            "extensions": "extensions",
            "store_location_extensions": "store_location_extensions",
            "product_categories": "product_categories",
            "products": "products",
            "layouts": "layouts",
            "product_cart": "product_cart",
            "product_cart_lineitems": "product_cart_lineitems",
        };
    }

    //public use available
    get_metadata = async (db_root, type, id, key=false, onlyValue=true) => {
        let users, obj, metaTable;
        metaTable = this.getMetaTable(db_root, type);

        users = await this.get_metadataOrID(db_root, type, id);
        if(users) {
            obj = await utility.generateKeyValuePair(users, "meta_key", "meta_value");
            if(key){
                return (onlyValue)? obj[key] : obj;
            } else {
                return obj;
            }
        }
        return false;
    }

    //public use available
    get_all_metadata = async (db_root, type, id, key=false, onlyValue=true) => {
        let rows, obj, metaTable, rowsMeta = {};
        metaTable = this.getMetaTable(db_root, type);

        rows = await this.get_all_metadataOrID(db_root, type, id);

        if(!rows) return false;

        for (let row of rows) {
            let id = row[utility.singular(type) + '_id'];
            if (!key || (key && row['meta_key'] === key)) {
                let keyValuePair = await utility.generateKeyValuePair([row], "meta_key", "meta_value");
                if (rowsMeta[id]) {
                    rowsMeta[id].push(keyValuePair);
                } else {
                    rowsMeta[id] = [keyValuePair];
                }
            }
        }
        return rowsMeta;
    }

    //public use available
    update_metadata = async (db_root, type, id, key, value="") => {
        let upsertID;

        if(typeof key == "object"){
            for(const [metaKey, metaValue] of Object.entries(key)){
                upsertID = await this.upsertMeta(db_root, type, id, metaKey, metaValue);
            }
        } else if(typeof key == "string") {
            upsertID = await this.upsertMeta(db_root, type, id, key, value);
        } else {
            return false;
        }
        return true;
    }

    //public use available
    delete_metadata = async (type, id, key) => {        
        if(key){
            return await this.delete_metadataQuery(type, id, key);
        }
        return false;
    }

    //public use available
    delete_all_metadata = async (db_root, type, id) => {
        return await this.delete_metadataQuery(db_root, type, id, "", true);
    }

    //public use available
    delete_metadata_by_id = async (db_root, type, ids) => {
        let meta, metaTable, id;
        metaTable = config.mysql.prefix+this.getMetaTable(db_root, type);

        if(!metaTable) return false;
        if (Array.isArray(ids)) {
            id = `'${ids.join("','")}'`
        }
        meta = await query(`DELETE FROM ${db_root}.${metaTable} WHERE id in (${id.toString()});`);
        if (meta?.affectedRows>0) return true;
    }

    delete_metadataQuery = async (db_root, type, id, key="", all=false) => {
        let meta, metaTable;
        metaTable = config.mysql.prefix+this.getMetaTable(db_root, type);

        if(!metaTable) return false;
        if (Array.isArray(id)) {
            id = `'${id.join("','")}'`
        }
        if(!all){
            meta = await query(`DELETE FROM ${db_root}.${metaTable} WHERE ${utility.singular(type)}_id in (${id.toString()}) AND meta_key=?;`, [key]);
        } else {
            meta = await query(`DELETE FROM ${db_root}.${metaTable} WHERE ${utility.singular(type)}_id in (${id.toString()});`);
        }
        if (meta?.affectedRows>0) return true;
    }
    
    get_metadataOrID = async (db_root, type, id, key="", value="all") => {
        let users, metaTable, keyQuery;
        metaTable = config.mysql.prefix+this.getMetaTable(db_root, type);

        keyQuery="";
        if(key){
            keyQuery = ` AND meta_key='${key}' `;
        }

        users = await query(`SELECT id, meta_key, meta_value FROM ${db_root}.${metaTable} WHERE ${utility.singular(type)}_id=? ${keyQuery}`, [id]);
        if(users.length>0){
            if(value==="all"){
                return users;
            } else {
                return users[0].id;
            }
        }
        return false;
    }

    get_all_metadataOrID = async (db_root, type, id, key="", value = "all", search = "") => {
        let users, metaTable, keyQuery;
        console.log(type, "---db_root")
        metaTable = await config.mysql.prefix + this.getMetaTable(db_root, type);
        console.log(metaTable, "---metaTable")
        keyQuery="";
        if(key){
            keyQuery = ` AND meta_key='${key}' `;
        }

        users = await query(`SELECT id, ${utility.singular(type)}_id, meta_key, meta_value FROM ${db_root}.${metaTable} WHERE ${utility.singular(type)}_id in (?) ${keyQuery}`, [id]);
        if(users.length>0){
            if(value==="all"){
                return users;
            } else {
                return users[0].id;
            }
        }
        return false;
    }

    upsertMeta = async(db_root, type, id, key, value) => {
        let upsertID, metaTable, rows, values;
        metaTable = config.mysql.prefix+this.getMetaTable(db_root, type);
        if(!metaTable) return false;
        if (value !== undefined) {
            upsertID = await this.get_metadataOrID(db_root, type, id, key, Array.isArray(value)? 'all': "id");
            if(upsertID){
                if (Array.isArray(value)) {
                    let old_meta_value = upsertID.length && upsertID.map(e => e['meta_value']);
                    let delete_meta_value = utility.arrayDifference(value, old_meta_value);
                    let delete_meta_ids = upsertID.filter(e=> delete_meta_value.includes(e["meta_value"])).map(e => e.id);
                    if (value.length > 0) {
                        let new_add_meta_value = utility.arrayDifference(old_meta_value, value);
                        if (new_add_meta_value.length > 0) {
                            let values = new_add_meta_value.map(e => [id, key, e])
                            rows = await query(`INSERT INTO ${db_root}.${metaTable} (${utility.singular(type)}_id, meta_key, meta_value) VALUES ?;`, [values]);
                        }
                    }
                    if (delete_meta_value.length > 0) await this.delete_metadata_by_id(db_root, type, delete_meta_ids);
                } else {
                    rows = await query(`UPDATE \`${db_root}\`.\`${metaTable}\` SET meta_key=?,meta_value=? WHERE id = ?;`, [key, value, upsertID]);
                }
                if(rows?.affectedRows>0) return upsertID;
            } else {
                if (typeof value === 'string') {
                    values = [[id, key, value || ""]]
                }
                if (Array.isArray(value)) {
                    values = value.map(e => [id, key, e]);
                }
                if ((Array.isArray(values) && values.length) || (!Array.isArray(values) && values)) {
                    rows = await query(`INSERT INTO ${db_root}.${metaTable} (${utility.singular(type)}_id, meta_key, meta_value) VALUES ?;`, [values]);
                    if (rows?.affectedRows>0) return rows.insertId;
                } else {
                    return false;
                }
            }
        }
        return false;
    }
    
    isOrphan = async (type, id) => {
        let users;
        if(!this.type.hasOwnProperty(type)) return false;

        users = await query(`SELECT id FROM ${this.type[type]} WHERE id = ?;`, [id]);
        return users.length <= 0;

    }
    
    getMetaTable = (db_root, metaType) => {

        if(!this.type.hasOwnProperty(metaType)) return false;
        return `${utility.singular(this.type[metaType])}meta`;
    }
}


module.exports = new metaUtility();
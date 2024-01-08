"use strict";

/**
 * import required files and define static constants
 *
 * @author Dhaval Italiya
 **/

const fs = require("fs");
const path = require("path");

const config = require("../../../config");

const query = require("../../../db/mysql.master");

// import helpers
const error = require("../../../helpers/error");
const _ = require("lodash");
const { FetchGetApi } = require("../../../helpers/fetch");

class User {
    constructor() {}
    recipe() {
        return async (req, res) => {
            let { limit, auth, offset, query } = req.body;

            let recipe = await FetchGetApi(`https://spoonacular.com/search/all?site=spoonacular.com&limit=${limit}&offset=${offset}&query=${query}}`);
            if (!recipe) return error.sendBadRequest(res, "spoonacular went wrong");
            let datra = await recipe.json();

            console.log(datra);
            return res.status(200).json({
                success: true,
                message: `recipe get successfully`,
                data: datra.searchResults
            });
        };
    }

    like() {
        return async (req, res) => {
            let { auth, r_id, name, image, link } = req.body;
            let {id} = auth;

            let recipe = await query(`select * from recipe where user_id = ? and r_id = ?;`, [id, r_id]);
            if (recipe.length > 0) return error.sendBadRequest(res, "recipe is already in watchlist");
            
            let insert = await query(`INSERT INTO recipe (user_id, r_id, name, image, link) VALUES (?,?,?,?,?);`, [id, r_id, name, image, link])
            if (insert.affectedRows == 0 ) return error.sendBadRequest(res, "watchlist not update");
            
            let gets = await query(`select * from recipe where user_id = ?;`, [id]);


            return res.status(200).json({
                success: true,
                message: `recipe watchlist update successfully`,
                data: gets
            });
        };
    }

    
    unlike() {
        return async (req, res) => {
            let { auth, r_id } = req.body;
            let {id} = auth

            let insert = await query(`DELETE FROM recipe WHERE r_id = ? and user_id = ?;`, [r_id, id]);
            if (insert.affectedRows == 0 ) return error.sendBadRequest(res, "watchlist not update");

            let gets = await query(`select * from recipe where user_id = ?;`, [id]);


            return res.status(200).json({
                success: true,
                message: `recipe watchlist removed successfully`,
                data: gets
            });
        };
    }
}

module.exports = new User();

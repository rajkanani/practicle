'use strict'

/**
 * import required files and define static constants
 *
 * @author Raj Kanani
 **/
// import helpers
const error                     = require('./error');
const config                    = require('./../config');



class Fetch{
    constructor(){}

    FetchPostApi = async (path, body = {}, header) => {
        const options = {method: "POST", headers: header, body: JSON.stringify(body)};
        return await fetch(path, options)
            .then((response) => {
                return response;
            })
            .catch((err) => {
                return err.response;
            });
    };


    FetchGetApi = async (path) => {
        return await fetch(path)
            .then((response) => {
                return response;
            })
            .catch((err) => {
                return err.response;
            });
    };
}

module.exports = new Fetch();
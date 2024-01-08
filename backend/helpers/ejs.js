'use strict'

/**
 * import required files and define static constants
 *
 * @author Raj Kanani
 **/
const ejs                               = require('ejs');

class Ejs {
    constructor(){
    }

    render = async (template, payload) => {
        return await ejs.render(template, payload);
    }
}

let EJS = new Ejs();
module.exports = {render: EJS.render};
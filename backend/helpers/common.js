'use strict'

/**
 * import required files and define static constants
 * 
 * @author Raj Kanani
**/
const { validationResult }      = require("express-validator");

// import helpers
const error                     = require('./error');



exports.asyncHandler = (fn) => (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
        error.sendBadRequest(res, err[0].message);
    } else {
        Promise.resolve(fn(req, res, next)).catch(next);    
    }
};


'use strict'

/**
 * import required files and define static constants
 * 
 * @author Raj Kanani
**/
const express                           = require('express');
const routes                            = express.Router();
const {check, query, oneOf}             = require('express-validator');

const {asyncHandler}                    = require("../../../helpers/common");
const authController                    = require('./../../../controllers/api/v1/auth');
const {jwtVerify}                       = require("../../../helpers/jwt");





routes.post('/register', [
    check('email').notEmpty().withMessage('Email is required').trim().isEmail().withMessage('Invalid email Address').toLowerCase(),
    check('password').notEmpty().withMessage('password is required').isLength({min:8}).withMessage('password must be 8 characters'),
    check('name').optional()
],  asyncHandler(authController.register()));

// curl --location 'localhost:3001/api/v1/login' --header 'Content-Type: application/json' --data-raw '{"email": "admin@gmail.com","password": "admin123"}'
routes.post('/login', [
    check('email').notEmpty().withMessage('Email is required').trim().isEmail().withMessage('Invalid email Address').toLowerCase(),
    check('password').notEmpty().withMessage('password is required').isLength({min:8}).withMessage('password must be 8 characters')
],  asyncHandler(authController.login()));

module.exports = routes;
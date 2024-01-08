'use strict'

/**
 * import required files and define static constants
 *
 * @author Raj Kanani
 **/
const express                           = require('express');
const routes                            = express.Router();
const { check }                         = require('express-validator');

const {jwtVerify}                       = require("../../../helpers/jwt");
const userController                    = require("../../../controllers/api/v1/user");
const {asyncHandler}                    = require("../../../helpers/common");




routes.post('/create', jwtVerify, [
    check('email').notEmpty().withMessage('Email is required').trim().isEmail().withMessage('Invalid email Address').toLowerCase(),
    check('phone').notEmpty().withMessage('phone is required').isLength({min:10}).withMessage('phone must be 10 characters'),
    check('fname').notEmpty().withMessage('First Name is required'),
    check('lname').notEmpty().withMessage('Last Name is required')
], asyncHandler(userController.create()));

routes.post('/update', jwtVerify, [
    check('email').notEmpty().withMessage('Email is required').trim().isEmail().withMessage('Invalid email Address').toLowerCase(),
    check('phone').notEmpty().withMessage('phone is required').isLength({min:10}).withMessage('phone must be 10 characters'),
    check('fname').notEmpty().withMessage('First Name is required'),
    check('lname').notEmpty().withMessage('Last Name is required')
], asyncHandler(userController.update_row()));

routes.post('/get', jwtVerify, 
asyncHandler(userController.get()));

routes.get('/list', jwtVerify, 
asyncHandler(userController.list()));




module.exports = routes;
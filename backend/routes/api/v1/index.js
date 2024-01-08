'use strict'

/**
 * import required files and define static constants
 * 
 * @author Raj Kanani
**/
const express                       = require('express');


const routes                        = express.Router();


const authRoute                     = require('./auth');
const recipeRoute                     = require('./recipe');
// const userRoute                     = require('./user');





// import main routes
routes.use('/', authRoute);
routes.use('/recipe', recipeRoute);

routes.get('/', function(req, res, msg) {
    res.status(200).json({success: true, message: "💸 Welcome To Prac by R A J 💸, API is running on v1"});
});




module.exports = routes;

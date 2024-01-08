'use strict'

/**
 * import required files and define static constants
 * 
 * @author Raj Kanani
**/
const app                       = require('express');

// import helpers
const error                     = require('../helpers/error');

// import main routes
const v1Router 		            = require('./api/v1');

// test environment

// Executions
const routes            = app.Router();



routes.use(error.setHeadersForCORS);                // CORS setHeader
routes.use(function (req, res, next) {res.setHeader("X-Powered-By", "Raj Kanani"); next()});


routes.use('/api/v1', v1Router);                    // v1 router


routes.get('/', function(req, res, next) {
    res.status(200).json({success: true, message: "Welcome To Prac by R A J"});
});



// catch 404 and forward to error handler
routes.use(function(req, res) {
    error.sendNotFound(res);
});
// error handler
routes.use(function(err, req, res, next) {
	res.locals.message 	= err.message; 												    // set locals, only providing error in development
	res.locals.error 	= req.app.get('env') === 'development' ? err : {};		
    
    console.log(err);
    err.status = err.cause || 500;
    error.sendFatalError(err, req, res);                                             // render the error page		
});
// catch 500 and forward to error handler
routes.use(function(error, req, res) {
    error.sendInternalServerError(error, res);
});










module.exports = routes;
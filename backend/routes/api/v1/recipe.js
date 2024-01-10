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
const recipeController                    = require('../../../controllers/api/v1/recipe');
const {jwtVerify}                       = require("../../../helpers/jwt");




// curl --location 'localhost:3001/api/v1/recipe/all' --header 'Content-Type: application/json' --data '{"limit": 5,"offset": 0,"query": "pasta"}'
routes.post('/all', jwtVerify, [
    check('limit').notEmpty().isNumeric().withMessage('limit is required'),
    check('offset').notEmpty().isNumeric().withMessage('offset is required'),
    check('query').optional()
],  asyncHandler(recipeController.all()));

// curl --location 'localhost:3001/api/v1/recipe/recipe' --header 'Content-Type: application/json'  --data '{ "id": 655249 }'
routes.post('/recipe', [
    check('id').notEmpty().isNumeric().withMessage('id is required')
],  asyncHandler(recipeController.recipe()));


// curl --location 'localhost:3001/api/v1/recipe/like' \
// --header 'Content-Type: application/json' \
// --header 'authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InJhaiBrYW5hbmkiLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJGROU3dBUjFGVjBFZktMdkpqemhmUC5abTE2WnpJZklZU05aQS95TU5aNk5Sdklqd3pSaFZxIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDEtMDdUMDE6MjQ6MzIuMDAwWiIsImlhdCI6MTcwNDczMDc0MSwiZXhwIjoxNzA1MDk2Mzk3fQ.aIPWgxRqZl2XYlKUAnDjwcMSLBQxqLhIvfAR0qTJNpI' \
// --data '{
// 	"r_id": "749013",
// 	"name": "Pasta",
// 	"image": "https://spoonacular.com/recipeImages/749013-312x231.jpeg",
// 	"link": "https://spoonacular.com/recipes/pasta-749013"
// }'
routes.post('/like', jwtVerify, asyncHandler(recipeController.like()));



// curl --location 'localhost:3001/api/v1/recipe/unlike' \
// --header 'Content-Type: application/json' \
// --header 'authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InJhaiBrYW5hbmkiLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJGROU3dBUjFGVjBFZktMdkpqemhmUC5abTE2WnpJZklZU05aQS95TU5aNk5Sdklqd3pSaFZxIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDEtMDdUMDE6MjQ6MzIuMDAwWiIsImlhdCI6MTcwNDczMDc0MSwiZXhwIjoxNzA1MDk2Mzk3fQ.aIPWgxRqZl2XYlKUAnDjwcMSLBQxqLhIvfAR0qTJNpI' \
// --data '{
// 	"r_id": "749013"
// }'
routes.post('/unlike', jwtVerify, asyncHandler(recipeController.unlike()));

module.exports = routes;
const express = require("express") ;
const router = express.Router() ;
const { createCategory , getCategories } = require("../Controllers/categoryController") ;
const {verifyRoles , ROLES } = require("../middlaware/verifyRoles") ;
const ROLES = require("../middleware/verifyRoles") ;

// now we will add the routes for the category management :
// first admin only can creat a new category :

router.post( '/' , verifyRoles(ROLES.admin) , createCategory ) ;

// secondly we will add the route to get all the categories :
// its for both costumers and admins :

router.get( '/' , getAllCategories ) ;

module.exports = router ;
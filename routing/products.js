const express = require("express") ;
const router = express.Router() ;


const {verifyRoles , ROLES } = require("../middlaware/verifyRoles") ;
const deleteCategory = require("../Controllers/deleteCategoryController") ;
const verfieJWT = require("../Controllers/verfieJWT") ;

// now we will add the routes for the category management :
// we will add the route to get all the categories :
// its for both costumers and admins :

router.get( '/' , getAllCategories ) ;

// admin only can creat a new category :

router.post( '/' , verfieJWT ,verifyRoles(ROLES.admin) , createCategory ) ;
router.delete( '/:categoryId' , verfieJWT , verifyRoles(ROLES.admin) , deleteCategory) ;


module.exports = router ;
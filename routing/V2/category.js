const express = require("express") ;
const router = express.Router() ;
const { createCategory , getAllCategories } = require("../../Controllers/V2/categoryController") ;
const {verifyRoles , ROLES } = require("../../middleware/verifyRoles") ;
const deleteCategory = require("../../Controllers/V2/deleteCategoryController") ;
const updateCategory = require("../../Controllers/V2/updatingCategory") ;
const verfieJWT = require("../../Controllers/V2/verfieJWT") ;

// now we will add the routes for the category management :
// we will add the route to get all the categories :
// its for both costumers and admins :

router.get( '/' , getAllCategories ) ;

// admin only can creat a new category :

router.post( '/' , verfieJWT ,verifyRoles(ROLES.admin) , createCategory ) ;

router.patch( '/:categoryId' , verfieJWT ,verifyRoles(ROLES.admin) , updateCategory ) ;

router.delete( '/:categoryId' , verfieJWT , verifyRoles(ROLES.admin) , deleteCategory) ;


module.exports = router ;
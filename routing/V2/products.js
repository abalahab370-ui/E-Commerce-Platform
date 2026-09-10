const express = require("express") ;
const router = express.Router() ;
const getProductById = require("../../Controllers/V2/getProductById") ;
const getProducts = require("../../Controllers/V2/getProduct") ;
const createStanderProduct = require("../../Controllers/V2/createStanderProduct") ;
const createNonStanderProduct = require("../../Controllers/V2/createNonStanderProduct") ;
const updateProduct = require("../../Controllers/V2/updatingProductController") ;
const deleteProduct = require("../../Controllers/V2/deleteProductController") ;
const {verifyRoles , ROLES } = require("../../middleware/verifyRoles") ;
const verfieJWT = require("../../Controllers/V2/verfieJWT") ;
const multer = require("../../middleware/multer") ;

// well all are allowed to get products : 

router.get( '/' , getProducts ) ;

// Get single product by ID

router.get( '/:id' , getProductById ) ;

// well only admin is the allowed to do access the rest !

router.post( '/' , verfieJWT , verifyRoles(ROLES.admin) , multer.array('images', 5) , createStanderProduct) ;
router.post( '/variant' , verfieJWT , verifyRoles(ROLES.admin) , multer.array('images', 5) , createNonStanderProduct) ;
router.patch( '/:id' , verfieJWT , verifyRoles(ROLES.admin) , multer.array('images', 5) , updateProduct) ;
router.delete( '/:id' , verfieJWT , verifyRoles(ROLES.admin) , deleteProduct) ;


module.exports = router ;
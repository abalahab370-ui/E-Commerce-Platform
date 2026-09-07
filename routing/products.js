const express = require("express") ;
const router = express.Router() ;
const getProductById = require("../Controllers/getProductById") ;
const getProducts = require("../Controllers/getProduct") ;
const createProduct = require("../Controllers/createProduct");
const updateProduct = require("../Controllers/updatingProductController")
const deleteProduct = require("../Controllers/deleteProductController") ;
const {verifyRoles , ROLES } = require("../middleware/verifyRoles") ;
const verfieJWT = require("../Controllers/verfieJWT") ;
const multer = require("../middleware/multer");

// well all are allowed to get products : 

router.get( '/' , getProducts ) ;

// Get single product by ID

router.get( '/:id' , getProductById ) ;

// well only admin is the allowed to do access the rest !

router.post( '/' , verfieJWT , verifyRoles(ROLES.admin) , multer.array('images', 5) , createProduct) ;
router.patch( '/:id' , verfieJWT , verifyRoles(ROLES.admin) , multer.array('images', 5) , updateProduct) ;
router.delete( '/:id' , verfieJWT , verifyRoles(ROLES.admin) , deleteProduct) ;


module.exports = router ;
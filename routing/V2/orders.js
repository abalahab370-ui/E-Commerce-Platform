const express = require("express") ;
const router = express.Router() ;
const getOrders = require("../../Controllers/V2/getOrders") ;
const createGuestOrderV2 = require("../../Controllers/V2/createGuestOrderV2") ;
const updateOrderStatusV2 = require("../../Controllers/V2/updateOrderStatusV2") ;

const {verifyRoles , ROLES } = require("../../middleware/verifyRoles") ;
const verfieJWT = require("../../Controllers/V2/verfieJWT") ;

//all can access it :

router.post( '/guest' ,createGuestOrderV2 ) ;
router.post( '/' ,createGuestOrderV2 ) ;

// well only admin is the allowed to access that !

router.get( '/'  , verfieJWT , verifyRoles(ROLES.admin) , getOrders ) ;

router.patch( '/:id/status' , verfieJWT , verifyRoles(ROLES.admin) , updateOrderStatusV2) ;

module.exports = router ;
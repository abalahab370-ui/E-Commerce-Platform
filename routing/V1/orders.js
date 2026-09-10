const express = require("express") ;
const router = express.Router() ;
const getOrders = require("../../Controllers/V1/getOrders") ;
const createGuestOrderV2 = require("../../Controllers/V1/createGuestOrderV2") ;

//v2 (V1 doesnt exist sadlly)
const updateOrderStatus = require("../../Controllers/V1/updateOrderStatus") ;

const {verifyRoles , ROLES } = require("../../middleware/verifyRoles") ;
const verfieJWT = require("../../Controllers/V1/verfieJWT") ;

//all can access it :

router.post( '/guest' ,createGuestOrderV2 ) ;
router.post( '/' ,createGuestOrderV2 ) ;

// well only admin is the allowed to access that !

router.get( '/'  , verfieJWT , verifyRoles(ROLES.admin) , getOrders ) ;

router.patch( '/:id/status' , verfieJWT , verifyRoles(ROLES.admin) , updateOrderStatus) ;

module.exports = router ;
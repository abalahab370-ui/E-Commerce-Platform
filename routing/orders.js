const express = require("express") ;
const router = express.Router() ;
const getOrders = require("../Controllers/getOrders") ;
const createGuestOrder = require("../Controllers/createGuestOrder") ;
const updateOrderStatus = require("../Controllers/updateOrderStatus") ;
const {verifyRoles , ROLES } = require("../middlaware/verifyRoles") ;
const verfieJWT = require("../Controllers/verfieJWT") ;

// well only admin is the allowed to access that !

router.get( '/'  , verfieJWT , verifyRoles(ROLES.admin) , getOrders ) ;

router.post( '/guest' , verfieJWT , verifyRoles(ROLES.admin) ,
createGuestOrder ) ;

router.patch( '/:id/status' , verfieJWT , verifyRoles(ROLES.admin) , updateOrderStatus) ;

module.exports = router ;
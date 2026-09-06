const express = require("express") ;
const router = express.Router() ;
const getOrders = require("../Controllers/getOrders") ;
const createGuestOrder = require("../Controllers/createGuestOrder") ;
const updateOrderStatus = require("../Controllers/updateOrderStatus") ;
const {verifyRoles , ROLES } = require("../middleware/verifyRoles") ;
const verfieJWT = require("../Controllers/verfieJWT") ;

//all can access it :

router.post( '/guest' ,createGuestOrder ) ;

// well only admin is the allowed to access that !

router.get( '/'  , verfieJWT , verifyRoles(ROLES.admin) , getOrders ) ;

router.patch( '/:id/status' , verfieJWT , verifyRoles(ROLES.admin) , updateOrderStatus) ;

module.exports = router ;
const express = require("express") ;
const router = express.Router() ;
const logoutHandler = require("../../Controllers/V2/logoutHandler") ;

router.delete( '/' , logoutHandler ) ;

module.exports = router ;
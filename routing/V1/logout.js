const express = require("express") ;
const router = express.Router() ;
const logoutHandler = require("../../Controllers/V1/logoutHandler") ;

router.post( '/' , logoutHandler ) ;

module.exports = router ;
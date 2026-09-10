const express = require("express") ;
const router = express.Router() ;
const path = require('path');
const refreshHandler = require('../../Controllers/V1/refreshControlles');


router.get( '/' ,  refreshHandler ) ;
      

module.exports = router ;
require("dotenv").config() ;
const express = require("express") ;
const app = express() ;
const cors = require("cors") ;
const PORT = process.env.PORT || 5500 ;
const path = require("path") ;
const corsOptions = require("./config/corsOptions") ;
const cookieParser = require("cookie-parser") ;
const mongoose  = require("mongoose") ;
const connectDB = require("./config/dbconnect") ;
const rateLimiter = require("./Controllers/rateLimiter.Js")
//Connecting to The DataBase : 
connectDB() ;

//Starting with building schema of the project  : 
//1- Staring with puting same Neccesary middleware !

app.use(express.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname , "Public"))); // Coming Back to it Later !
app.use(express.json());

//middleware for cookies :
app.use(cookieParser()) ;

app.use(cors(corsOptions));

//Custom Middleware To log each req coming to the Server :
app.use( (req ,res,next) => {
      console.log(`${req.method} ${req.path} ${req.headers.origin}`);
      next();
})

//version V1 :

app.use('/api/v1/products' , rateLimiter , require("./routing/V1/products")) ;

app.use('/api/v1/categories' , rateLimiter, require("./routing/V1/category")) ;

app.use('/api/v1/orders' , rateLimiter , require("./routing/V1/orders")) ;

//version V2 :

app.use('/api/v2/products' , rateLimiter , require("./routing/V2/products")) ;

app.use('/api/v2/categories' , rateLimiter, require("./routing/V2/category")) ;

app.use('/api/v2/orders' , rateLimiter , require("./routing/V2/orders")) ;

// auth verifiction routes : 

app.use('/api/v1/auth/login' , rateLimiter , require("./routing/login") ) ;

app.use( '/api/v1/auth/refresh' , rateLimiter, require("./routing/refresh"))

app.use( '/api/v1/auth/logout' , rateLimiter, require("./routing/logout"));

//time for verfieJWT =-= !(refresh and verfie  , u will burnout ah coding life =*=)



mongoose.connection.once("open" , () => {

      app.listen( PORT , 
            () => {
                  console.log('Connected to MongoDB') ;
                  console.log(`Server is listining in Port ${PORT}`)
            }
      );

})
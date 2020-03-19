const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport=require("passport");




// bring all the routes
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const questions = require('./routes/api/questions');

// Middleware for body parser
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());


const port = process.env.PORT || 3000;

// mongo DB configuration
const db = require('./setup/myurl').mongoURL;
//Attempt to connect
mongoose
.connect(db,{ useNewUrlParser: true,useUnifiedTopology:true })
.then(()=>console.log("mongoDB connected successfully...."))
.catch(err =>console.log(err));

// passport middleware
app.use(passport.initialize());

// config for JWT strategy
require("./strategies/jsonwtStrategy")(passport);




//route  testing routes ->
app.get('/',(req,res)=>{
    res.send("hello this is big stack");
});

// actual route call to rest api
app.use('/api/auth',auth);
app.use('/api/profile',profile);
app.use('/api/questions',questions);

app.listen(port,()=>console.log(`server is up and running on the port number ${port}`));

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../setup/myurl');



// @type GET
// @route /api/auth
// @desc  just for teting
// @access PUBLIC
router.get('/',(req,res)=>res.json({test:"auth is  working"}));

// import schema for person to register
const Person = require('../../models/Person');



// @type POST
// @route /api/auth/registrarion
// @desc  route for registration
// @access PUBLIC
router.post('/register',(req,res)=>{
    // if user is already there with the same email id entered
    Person.findOne({email:req.body.email})
        .then(person =>{
                if(person){
                    return res.status(400).json({emailerr:"user already exists with the Email ID"})
                }
                else{
                    const newPerson = new Person({
                        name:req.body.name,
                        email:req.body.email,
                        password:req.body.password
                    });
                    // encrypting the password using bcryptjs
                        bcrypt.genSalt(10,(err, salt)=> {
                        bcrypt.hash(newPerson.password, salt,(err, hash)=> {                        
                        if(err) throw err;
                        // store hashed or encrypted password on the object
                        newPerson.password=hash;
                        // Store hash in your password DB.
                        // hadle the db err db might be busy or might not be online..
                        newPerson.save()
                        .then(person =>res.json(person))
                        .catch(err=>console.log(err));

                        });
                    });
                    
                }

        })
        .catch(err => console.log(err));
    });

// @type POST
// @route /api/auth/login
// @desc  route for login
// @access PUBLIC
router.post('/login',(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    Person.findOne({email})
        .then( person =>{
            if(!person)
                {
                   return res.status(404).json({emailerror:"User not found .....!"});

                }
                // wiil return a boolien value true or false which is inturn used in then as isCorrect
                bcrypt.compare(password,person.password)
                .then(isCorrect =>{
                    if(isCorrect)
                        {
                        //return res.json({success : "User log in success"});
                        // use payload and create token for user
                        const payload = {
                            id:person.id,
                            name:person.name,
                            email:person.email
                        };
                        jsonwt.sign(
                            payload,
                            key.secret,
                            { expiresIn: 3600 },
                            (err,token) => {
                                if(err) throw err;
                                res.json({
                                    success :true,
                                    token:"Bearer " + token
                                });
                            }
                           )
                        }
                        else
                        {
                            return res.status(400).json({passworderr:"password is incorrect"});
                        }
                } )
                .catch(err =>console.log(err))            
             })
        .catch(err => console.log(err));
});

// @type GET
// @route /api/auth/profile
// @desc  route for profile
// @access PRIVATE
router.get("/profile", passport.authenticate("jwt", { session: false }),(req,res)=>{

    //console.log(req);
    res.json({
        id:req.user.id,
        name:req.user.name,
        email:req.user.email,
        profilepic:req.user.profilepic
    })
});



module.exports = router;
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//load person model
const Person = require('../../models/Person');

// load profile model
const Profile = require('../../models/Profile');



// @type GET
// @route /api/profile
// @desc  route for personal profile
// @access PRIVATE
// router.get('/',(req,res)=>res.json({test:"profile is working"}));
router.get('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
Profile.findOne({user:req.user.id})
    .then(profile =>{
        if(!profile) {
            return res.status(404).json({profileerr:"profile not found"});

            }
            res.json(profile);
    })
    .catch(err=>console.log("ooo! get some error" + err));
});

// @type POST
// @route /api/profile
// @desc  route for UPDATING/SAVING personal profile
// @access PRIVATE
router.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const profileValues={};
    profileValues.user = req.user.id;
    if(req.body.username) profileValues.username = req.body.username;
    if(req.body.website) profileValues.website = req.body.website;
    if(req.body.country) profileValues.country = req.body.country;
    if(req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if(typeof req.body.languages !== undefined){
        profileValues.languages = req.body.languages.split(',');
       }
       // get socila links
       profileValues.social ={};
    if(req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if(req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if(req.body.instagram) profileValues.social.instagram = req.body.instagram;

    //Do database stuff here
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            if(profile)
                {
                    Profile.findOneAndUpdate(
                        {user:req.user.id},
                        {$set:profileValues},
                        {new:true}
                        ).then(profile=>res.json(profile)).catch(err=>console.log("error in updating" +err));
                }
             else {
                 Profile.findOne({userame:profileValues.username})
                    .then(profile=>{
                        // username already exists
                        if(profile)
                            {
                                res.status(400).json({username:"username already exists"});

                            }
                            // save the user
                            new Profile(profileValues)
                                .save()
                                .then(profile => res.json(profile) )
                                .catch(err =>console.log("error in saving" + err));

                    }).catch(err=>console.log(err));
             }

        })
        .catch(err => console.log('Problem in fetching the profile' + err))


});

// @type GET
// @route /api/profile/:username
// @desc  route for getting PROFILE based on USERNAME
// @access PUBLIC 
router.get('/:username',(req,res)=>{
    Profile.findOne({username:req.params.username})
        .populate("user",["name","profilepic"])
        .then(profile=>{
            if(!profile)
                {
                    res.status(404).json({usernotfound:"user not found"});
                }
                res.json(profile);
        })
        .catch(err=>console.log("error in fetching the the profile"+err));
});


// @type GET
// @route /api/profile/find/everyone
// @desc  route for getting all the users 
// @access PUBLIC 
router.get('/find/everyone',(req,res)=>{
    Profile.find()
        .populate("user",["name","profilepic"])
        .then(profiles=>{
            if(!profiles)
                {
                    res.status(404).json({usernotfound:"user not found"});
                }
                res.json(profiles);
        })
        .catch(err=>console.log("error in fetching the the profile"+err));
});


// @type DELETE
// @route /api/profile/
// @desc  route for deleting the account  based on the ID
// @access PRIVATE 
router.delete('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})// acts like a defence line
    Profile.findOneAndRemove({user:req.user.id})
        .then(()=>{
            Person.findOneAndRemove({_id:req.user.id})
                .then(()=>res.json({success:"deletion is successful"}))
                .catch(err=>console.log("error in remvign"+err))
        })
        .catch(err=>console.log("error in deleting the profile"+err))
})

// @type POST
// @route /api/profile/workrole
// @desc  route for adding work profile of a person
// @access PRIVATE 
router.post('/workrole',passport.authenticate('jwt',({session:false})),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile =>{
            if(!profile) res.status(404).json({err:"profile not found"});
            const newWork ={
                role:req.body.role,
                company:req.body.company,
                country:req.body.country,
                from:req.body.from,
                to:req.body.to,
                current:req.body.current,
                details:req.body.details,
            };
            profile.workrole.unshift(newWork)
            profile.save()
                .then(profile=>res.json(profile))
                .catch(err=>console.log("error in updating the work role in db "))

        })
        .catch(err=>console.log("error profile not found"+err))

});

// @type DELETE
// @route /api/profile/workrole/:w_id
// @desc  route for deleting a specific work role
// @access PRIVATE 
router.delete('/workrole/:w_id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(profile=>{
            if(!profile){
                res.status(404).json({er:"profile not found"})
            }

            const removethis = profile.workrole
            .map(item =>item.id)
            .indexOf(req.params.w_id);
            profile.workrole.splice(removethis,1);
            profile.save()
            .then(profile=>res.json(profile))
            .catch(err =>console.log("error in saving the profile"+err))
        })
        .catch(err=>console.log(err))
})



module.exports = router;
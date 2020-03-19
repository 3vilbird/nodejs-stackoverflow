const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");


//load person model
const Person = require('../../models/Person');

// load profile model
const Profile = require('../../models/Profile');

// load question model
const Question = require("../../models/Question");



// @type GET
// @route /api/questions
// @desc  route for getting all the questons 
// @access PUBLIC
router.get('/',(req,res)=>{
    Question.find()
        .sort({date: -1})
        .then(questions=>res.json(questions))
        .catch(err=>res.json({noquestions:"No question to display yet5"}));
});


// @type POST
// @route /api/questions
// @desc  route for submitting questions 
// @access PRIVATE
router.post('/',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const newQuestion = new Question({
        textone:req.body.textone,
        texttwo:req.body.texttwo,
        user:req.user.id,
        name:req.body.name
    });
    newQuestion.save()
        .then(question=>res.json(question))
        .catch(err => console.log("unable to save the question to DB "+err));
});


// @type POST
// @route /api/questions/answers/:id
// @desc  route for submitting answers to questions 
// @access PRIVATE

router.post('/answers/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Question.findById(req.params.id)
        .then(question=>{
            const newAnswer = {
                user:req.user.id,
                name:req.body.name,
                text:req.body.text
            };
            // since this is an array push it and then save it to DB
        question.answers.unshift(newAnswer);
        question.save()
            .then(question=>res.json(question))
            .catch(err=> console.log(err))
        

        })
        .catch(err=>console.log(err));

});


// @type POST
// @route /api/questions/upvote/:id
// @desc  route for submitting the upvotes to questions 
// @access PRIVATE
router.post('/upvote/:id',passport.authenticate('jwt',{session:false}),(req,res)=>{
    Profile.findOne({user:req.user.id})
        .then(pofile=>{
            Question.findById(req.params.id)
                .then(question=>{
                    // check the user already likedor not
                    if(question.upvotes.filter(upvote=> upvote.user.toString() === req.user.id.toString()).length >0 )
                        {
                            return res.status(400).json({upvote:"User already upvoted"});                            
                        }
                        question.upvotes.unshift({user:req.user.id})
                        question.save()
                        .then(question=>res.json(question))
                        .catch(err=>console.log("error in upvoting" + err));
                })
                .catch(err=>console.log(err))
        })
        .catch(err=>console.log(err));
})





module.exports = router;
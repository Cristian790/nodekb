//--------------------------------------Import Modules
//express module
const express = require('express');
//router
const router = express.Router();
//express-validator
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
//bcrypt
const bcrypt=require('bcryptjs');
//Passport
const passport = require('passport');
//Bring in User Model
let User = require('../models/user');

//-------------------------------------Routes
//Register Form
router.get('/register',(req,res)=>{
	let user = {
		name:'',
		email:'',
		username:''
	}
	res.render('register',{
		title:'User Registration',
		user:user
	});
});

//Register Process
router.post('/register',
	[
		check('name','Name is required').isLength({min:1}).trim(),
		check('email').isLength({min:1}).withMessage('Email is required').isEmail().withMessage('Email is not valid'),
		check('username').isLength({min:1}).withMessage('Username is required'),
		check('password','Password should be at least 7 chars long').exists().isLength({min:7}).trim(),
  		check('password2', '"Confirm Password" must have the same value as "Password"').exists().custom((value, { req }) =>value === req.body.password)
	]
	,(req,res)=>{

		let user = new User({
			name:req.body.name,
			email:req.body.email,
			username:req.body.username,
			password:req.body.password
		}); 

		const errors = validationResult(req);

		if(!errors.isEmpty()){
			res.render('register',
			{
				user:user,
				title:'User Registration',
				errors: errors.mapped()
			});
		}
		else
		{
			user.name=req.body.name;
			user.email=req.body.email;
			user.username=req.body.username;
			user.password=req.body.password;

			bcrypt.genSalt(10,(err,salt)=>{
				bcrypt.hash(user.password,salt,(err,hash)=>{
					if(err)console.log(err);
					user.password=hash;
					user.save(err=>{
						if(err){console.log(err);}
						else{
							req.flash('success','You are registered');
							res.redirect('/users/login');
						}
					});
				});
			});
		}
});

//Login Form
router.get('/login',(req,res)=>{
	res.render('login',{
		title:'Login'
	});
});

//Login Process
router.post('/login',(req,res,next)=>{
	passport.authenticate('local',{
		successRedirect:'/',
		failureRedirect:'login',
		failureFlash:true
	})(req,res,next);
});

//Logout

router.get('/logout',(req,res)=>{
	req.logout();
	req.flash('success','You are logged out');
	res.redirect('/users/login');
});

//-------------------------------------Export Modules
module.exports = router;
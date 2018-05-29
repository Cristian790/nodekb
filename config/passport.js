const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');


//------------------------------------------Verification
module.exports = passport=>{
	//Local Strategy
	passport.use(new LocalStrategy((username,password,done)=>{
		//Match Username
		let query = {username:username};
		User.findOne(query,(err,user)=>{
			if(err){return done(err);}
			if(!user){
				return done(null,false,{message:'Incorrect username'});
			}

			//Match Password

			bcrypt.compare(password,user.password,(err,isMatch)=>{
				if(err)throw err;
				if(isMatch){
					return done(null,user);
				}
				else
				{
					return done(null,false,{message:'Incorrect password'});
				}
			});
		});
	}));

	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});
}
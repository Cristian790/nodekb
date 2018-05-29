//----------------------------------------------Import Modules
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

//Bring in Article Model
let Article = require('../models/article');
//User model
let User = require('../models/user');

//------------------------------------------------Routes

//Edit Route
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
	Article.findById(req.params.id,(err,article)=>{
		if(article.author!=req.user._id)
		{
			req.flash('danger','Unauthorized');
			res.redirect('/');	
		}
		else
		{
			res.render('edit_article',{
			title:'Edit Article',
			article:article
		});
		}
	});
});


//Add route
router.get('/add',ensureAuthenticated,(req,res)=>{
	let article= new Article();
		res.render('add',{
			title:'Add Article',
			article:article
		});
	
});

//Add Submit POST route
router.post('/add',[
	check('title').isLength({min:1}).trim().withMessage('Title required'),
//	check('author').isLength({min:1}).trim().withMessage('Author required'),
	check('body').isLength({min:1}).trim().withMessage('Body required')
	],(req,res,next)=>{
	let article = new Article({
		title:req.body.title,
		author:req.user._id,
		body:req.body.body
	});
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
    	res.render('add',
    		{ 
    			title:'Add Article',
    			article:article,
    			errors: errors.mapped()
    		});
  	}
  	else{
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body;

		article.save(err=>{
			if(err)throw err;
			req.flash('success','Article Added');
			res.redirect('/');
		});
	}
});


//Edit Submit POST route
router.post('/edit/:id',
	[
	check('title').isLength({min:1}).trim().withMessage('Title required'),
//	check('author').isLength({min:1}).trim().withMessage('Author required'),
	check('body').isLength({min:1}).trim().withMessage('Body required')
	]
	,(req,res,next)=>{
		let article = {
			_id:req.params.id,
			title:req.body.title,
			body:req.body.body
		};
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
	    	res.render('edit_article',
	    		{ 
	    			title:'Edit Article',
	    			article:article,
	    			errors: errors.mapped()
	    		});
	  	}
	  	else{
			article.title = req.body.title;
			article.author = req.user._id;
			article.body = req.body.body;

			let query={_id:req.params.id};

			Article.update(query,article,(err)=>{
				if(err) throw err;
				req.flash('success',`Article "${article.title}" Updated`);
				res.redirect('/');
			});
}
})


//Delete
router.delete('/:id',ensureAuthenticated,(req,res)=>{

	if(!req.user._id){res.status(500).send();}

	let query={_id:req.params.id}

	Article.findById(req.params.id,(err,article)=>{
		if(article.author!=req.user._id){res.status(500).send();}
		else
		{
			Article.remove(query,(err)=>{
			if(err) throw err;
			req.flash('success','Article Deleted');
			res.send('Success');
			});
		}
	});
});

//Get Single Article Route
router.get('/:id',(req,res)=>{
	Article.findById(req.params.id,(err,article)=>{
		User.findById(article.author,(err,user)=>{
			res.render('article',{
			article:article,
			author:user.name
		});
		})
	});
});

//Access Control
//This function can be added to any route than you want to protect, as a
//second parameter
function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated())//Passport allows this
	{
		return next();
	}
	else
	{
		req.flash('danger','Please login');
		res.redirect('/users/login');
	}
}


//----------------------------------------Export Module
module.exports= router;
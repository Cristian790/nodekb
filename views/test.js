The express-validator has updated and the middleware is no longer required. 
Someone ask for the new set-up. 
In this add-post method I use the last version of express-validator( and ES6 )

	//function(arg){}  <=> (arg)=>{}  this is a ES6 feature


const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');



//no middleware

app.post('/articles/add',
	[
		check('title').isLength({min:1}).trim().withMessage('Title required'),
		check('author').isLength({min:1}).trim().withMessage('Author required'),
		check('body').isLength({min:1}).trim().withMessage('Body required')
	],
		(req,res,next)=>{

		let article = new Article({
		title:req.body.title,
		author:req.body.author,
		body:req.body.body
	});

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		console.log(errors);
    	res.render('add_article',
    		{ 
    			article:article,
    			errors: errors.mapped()
    		});
  	}
  	else{
		article.title = req.body.title;
		article.author = req.body.author;
		article.body = req.body.body;

		article.save(err=>{
			if(err)throw err;
			req.flash('success','Article Added');
			res.redirect('/');
		});
	}
});



The edit method is similar.
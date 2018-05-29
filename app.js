//---------------------------------------------Import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');



//--------------------------------------------Custom Modules
//Schema
let Article = require('./models/article');



//--------------------------------------------Connect to database
mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once('open', () => console.log('Connected to MongoDB'));

//Check for DB errors
db.on('error', err => console.log(err));



//--------------------------------------------Init modules
const app = express();



//--------------------------------------------Middleware

//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Express-session
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}))

//Express Messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);//Init module
	next();
});

//Load View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Passport config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Es válido para asociar un valor de user cuando se está registrado
//y un null cuando no 
app.get('*', (req, res, next) => {
	res.locals.user = req.user;
	next();
});

//--------------------------------------------Home Route
app.get('/', (req, res) => {
	Article.find({}, (err, articles) => {
		if (err) throw err;
		res.render('index', {
			title: 'Articles',
			articles: articles
		});
	});
});


//-------------------------------------------Routes Files
//Get Single Article Route
//Edit Route
//Add route
//Add Submit POST route
//Edit Submit POST route
//Delete

//Import Articles Route
let articles = require('./routes/articles');
app.use('/articles', articles);

//Import Users Route
let users = require('./routes/users');
app.use('/users', users);



//------------------------------------------------Start server
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`));
/**
 * Module dependencies.
 */

var crypto = require('crypto');
var async = require('async');
var mongoose = require('mongoose');
var express = require('express');
var i18n = require('i18n');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var passportFacebook = require('passport-facebook');
var passportGoogle = require('passport-google');
var FacebookStrategy = passportFacebook.Strategy;
var GoogleStrategy = passportGoogle.Strategy;

var FACEBOOK_APP_ID = "717122248312576";
var FACEBOOK_APP_SECRET = "46635db269080e05be41889b55599dde";
passport.use(new FacebookStrategy({
	clientID : FACEBOOK_APP_ID,
	clientSecret : FACEBOOK_APP_SECRET,
	callbackURL : "http://talkback.activethread.org/auth/facebook/callback"
}, function(accessToken, refreshToken, profile, done) {
	// User.findOrCreate(, function(err, user) {
	// if (err) { return done(err); }
	// done(null, user);
	// });
}));

passport.use(new GoogleStrategy({
	returnURL : 'http://talkback.activethread.org/auth/google/return',
	realm : 'http://talkback.activethread.org/'
}, function(identifier, profile, done) {
	// User.findOrCreate({
	// openId : identifier
	// }, function(err, user) {
	// done(err, user);
	// });
}));

i18n.configure({
	locales : [ 'en', 'pt' ],
	directory : __dirname + '/locales'
});

var crypt = function(value) {
	return crypto.createHash('sha256').update(value).digest('base64');
};

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
	console.log(i18n.__('mongodb.successfullyConnected'));
	var Schema = mongoose.Schema;

	var User = new Schema({
		username : {
			type : String,
			unique : true,
			required : true
		},
		password : {
			type : String,
			required : true
		}
	});

	var Reply = new Schema({
		description : {
			type : String,
			required : true
		},
		question : {
			type : Schema.Types.ObjectId,
			ref : 'Question'
		},
		user : {
			type : Schema.Types.ObjectId,
			ref : 'User'
		}
	});

	var Question = new Schema({
		description : {
			type : String,
			required : true
		},
		book : {
			type : Schema.Types.ObjectId,
			ref : 'Book'
		},
		replies : [ {
			type : Schema.Types.ObjectId,
			ref : 'Reply'
		} ]
	});

	var Book = new Schema({
		title : {
			type : String,
			required : true
		},
		modified : {
			type : Date,
			"default" : Date.now
		},
		questions : [ {
			type : Schema.Types.ObjectId,
			ref : 'Question'
		} ],
		user : {
			type : Schema.Types.ObjectId,
			ref : 'User'
		}
	});

	var UserModel = mongoose.model('User', User);
	mongoose.model('Book', Book);
	mongoose.model('Question', Question);
	var ReplyModel = mongoose.model('Reply', Reply);
	UserModel.find({}, function(error, users) {
		if (users.length === 0) {
			var passwordHash = crypt("123456");
			var user = new UserModel({
				username : 'admin',
				password : passwordHash
			});
			user.save(function(error, user) {
			});
		}
	});
//	 ReplyModel.remove({}, function(err) {
//	 console.log('collection removed');
//	 });

});

// mongoose.connect('mongodb://vps.activethread.org/BoQ');
mongoose.connect('mongodb://localhost/BoQ');

var app = express();

// all environments
app.use(i18n.init);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/book', routes.book);
app.get('/book/:id', routes.findBook);
app.get('/book/r/:id', routes.findBookReply);
app.get('/book/reply/:id', routes.bookReply);
app.del('/book/:id', routes.removeBook);
app.post('/book', routes.saveBook);
app.post('/book/reply', routes.saveBookReply);
app.get('/books', routes.listBooks);
app.get('/questions', routes.listQuestions);
app.get('/replies', routes.listReplies);
app.get('/users', user.list);

// Redirect the user to Facebook for authentication. When complete,
// Facebook will redirect the user back to the application at
// /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval. Finish the
// authentication process by attempting to obtain an access token. If
// access was granted, the user will be logged in. Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
	successRedirect : '/',
	failureRedirect : '/login'
}));

// Redirect the user to Google for authentication. When complete, Google
// will redirect the user back to the application at
// /auth/google/return
app.get('/auth/google', passport.authenticate('google'));

// Google will redirect the user to this URL after authentication. Finish
// the process by verifying the assertion. If valid, the user will be
// logged in. Otherwise, authentication has failed.
app.get('/auth/google/return', passport.authenticate('google', {
	successRedirect : '/',
	failureRedirect : '/login'
}));

var users = [{username:'teste', passwd:'teste'},{username:'teste', passwd:'teste'},{username:'teste', passwd:'teste'},{username:'teste', passwd:'teste'}];

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
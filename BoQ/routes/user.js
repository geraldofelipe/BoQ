
/*
 * GET users listing.
 */
var mongoose = require('mongoose');

exports.list = function(req, res){
	var User = mongoose.model('User');
	User.find({}, function(error, users) {
		if (error) {
			res.send(500);
		}

		res.json({
			users : users
		});
	});
};
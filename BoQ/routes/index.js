/*
 * GET home page.
 */
var async = require('async');
var mongoose = require('mongoose');

exports.index = function(req, res) {
	res.render('index', {});
};

exports.book = function(req, res) {
	res.render('book', {});
};

exports.saveBook = function(req, res) {
	var Book = mongoose.model('Book');
	var Question = mongoose.model('Question');
	var questions = req.body.questions;
	req.body.questions = [];
	var book = new Book(req.body);
	if (req.body._id) {
		var bookQuestions = [];
		async.each(questions, function(currentQuestion, callback) {
			var question = new Question(currentQuestion);
			if (currentQuestion._id) {
				Question.findByIdAndUpdate(question._id, {
					$set : {
						description : question.description
					}
				}, function(error, book) {
					if (error) {
						console.log(error);
						res.send(500);
					}
					callback();
				});
			} else {
				question.save(function(error, question) {
					if (error) {
						console.log(error);
						res.send(500);
					}
					callback();
				});
			}
			bookQuestions.push(question._id);
		}, function() {
			Book.findByIdAndUpdate(book._id, {
				$set : {
					title : book.title,
					questions : bookQuestions
				}
			}, function(error, book) {
				if (error) {
					console.log(error);
					res.send(500);
				}
			});
		});
	} else {
		book.save(function(error, book) {
			if (error) {
				console.log(error);
				res.send(500);
			}
			async.each(questions, function(currentQuestion, callback) {
				var question = new Question({
					description : currentQuestion.description,
					book : book._id
				});
				question.save(function(error, question) {
					if (error) {
						console.log(error);
						res.send(500);
					}
					callback();
				});
				book.questions.push(question);
			}, function() {
				book.save(function(error, book) {
					if (error) {
						console.log(error);
						res.send(500);
					}
					req.body._id = book._id;
				});
			});
		});
	}
	res.send(201);
};

exports.saveBookReply = function(req, res) {
	var Reply = mongoose.model('Reply');
	var Question = mongoose.model('Question');
	var replies = req.body;
	replies.forEach(function(item) {
		if (item._id) {
			Reply.findByIdAndUpdate(item._id, {
				$set : {
					description : item.description
				}
			}, function(error, reply) {
				if (error) {
					console.log(error);
					res.send(500);
				}
				Question.find({
					_id : item.question._id
				}).populate('replies').exec(function(error, questions) {
					questions[0].replies.push(reply._id);
					Question.findByIdAndUpdate(questions[0]._id, {
						$set : {
							replies : questions[0].replies
						}
					}, function(error, question) {
						if (error) {
							console.log(error);
							res.send(500);
						}
					});
				});
			});
		} else {
			var reply = new Reply({
				description : item.description,
				question : item.question._id
			});
			reply.save(function(error, reply) {
				if (error) {
					console.log(error);
					res.send(500);
				}
				Question.find({
					_id : item.question._id
				}).populate('replies').exec(function(error, questions) {
					questions[0].replies.push(reply._id);
					Question.findByIdAndUpdate(questions[0]._id, {
						$set : {
							replies : questions[0].replies
						}
					}, function(error, question) {
						if (error) {
							console.log(error);
							res.send(500);
						}
					});
				});
			});
		}
	});

	res.send(201);
};

exports.removeBook = function(req, res) {
	var Book = mongoose.model('Book');
	var Question = mongoose.model('Question');
	var Reply = mongoose.model('Reply');
	Book.find({
		id : req.params.id
	}, function(error, books) {
		if (error) {
			res.send(500);
		}
		Question.find({
			book : books[0]._id
		}, function(error, questions) {
			if (error) {
				res.send(500);
			}
			async.each(questions, function(question, callback) {
				Reply.remove({
					question : question._id
				}, function(error, reply) {
					if (error) {
						console.log(error);
						res.send(500);
					}
					callback();
				});
			}, function() {
				Question.remove({
					book : books[0]._id
				}, function(error, question) {
					if (error) {
						console.log(error);
						res.send(500);
					}
				});
			});
		});
	});
	Book.remove({
		id : req.params.id
	}, function(error, book) {
		if (error) {
			console.log(error);
			res.send(500);
		}
	});
	res.send(201);
};

exports.listBooks = function(req, res) {
	var Book = mongoose.model('Book');
	Book.find({}, function(error, books) {
		if (error) {
			res.send(500);
		}

		res.json({
			books : books
		});
	});
};

exports.listQuestions = function(req, res) {
	var Question = mongoose.model('Question');
	Question.find({}, function(error, questions) {
		if (error) {
			res.send(500);
		}

		res.json({
			questions : questions
		});
	});
};

exports.listReplies = function(req, res) {
	var Reply = mongoose.model('Reply');
	Reply.find({}, function(error, replies) {
		if (error) {
			res.send(500);
		}

		res.json({
			replies : replies
		});
	});
};

exports.findBook = function(req, res) {
	var Book = mongoose.model('Book');
	Book.find({
		_id : req.params.id
	}).populate('questions').exec(function(error, books) {
		if (error) {
			res.send(500);
		}

		res.json({
			book : books[0]
		});
	});
};

exports.findBookReply = function(req, res) {
	var Question = mongoose.model('Question');
	Question.find({
		book : req.params.id
	}).populate('book replies').exec(function(error, questions) {
		if (error) {
			res.send(500);
		}

		res.json({
			book : questions[0].book,
			questions : questions
		});
	});
};

exports.bookReply = function(req, res) {
	res.render('book-reply', {
		bookId : req.params.id
	});
};

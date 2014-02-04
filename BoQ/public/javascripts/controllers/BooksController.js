var app = angular.module('BoQ', [ 'ui.bootstrap', 'dialogs' ]);
app.controller('BooksController', function($scope, $http, $rootScope, $timeout, $dialogs) {
	$scope.predicate = 'title';

	$scope.itemsPerPage = 1;
	$scope.pagedItems = [];
    $scope.currentPage = 0;
	$scope.pageSize = 1;

	// calculate page in place
	$scope.groupToPages = function() {
		$scope.pagedItems = [];

		for (var i = 0; i < $scope.replies.length; i++) {
			if (i % $scope.itemsPerPage === 0) {
				$scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.replies[i] ];
			} else {
				$scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.replies[i]);
			}
		}
	};
	
	$scope.prevPage = function() {
		if ($scope.currentPage > 0) {
			$scope.currentPage--;
		}
		focusFirstReply();
	};

	$scope.nextPage = function() {
		if ($scope.currentPage < $scope.pagedItems.length - 1) {
			$scope.currentPage++;
		}
		focusFirstReply();
	};

	$scope.setPage = function() {
		$scope.currentPage = this.n;
		focusFirstReply();
	};
	
	$scope.range = function(start, end) {
		var ret = [];
		if (!end) {
			end = start;
			start = 0;
		}
		for (var i = start; i < end; i++) {
			ret.push(i);
		}
		return ret;
	};

	var newBook = function() {
		return {
			title : '',
			questions : [ {
				description : '',
				replies : [ {
					description : ''
				} ]
			} ]
		};
	};

	var newReply = function() {
		return {
			description : '',
			user : 'lordfelipe'
		};
	};

	$scope.book = newBook();

	$scope.reply = newReply();

	$scope.replies = [];

	$scope.books = [];

	$scope.init = function() {
		$scope.findBookReply($(bookId).text());
	};

	$scope.findBook = function(id) {
		$http.get('/book/' + id).success(function(item) {
			$scope.book = item.book;
			angular.forEach(item.book.questions, function(value, key) {
				$scope.replies.push({
					description : '',
					question : value
				});
			});
			setTimeout(function() {
				hotkeys();
			}, 100);
		});
	};

	$scope.findBookReply = function(id) {
		$http.get('/book/r/' + id).success(function(item) {
			$scope.book = item.book;
			$scope.book.questions = item.questions;
			angular.forEach(item.questions, function(question) {
				$scope.replies.push({
					description : '',
					question : question
				});
			});
			$scope.groupToPages();
			focusFirstReply();
		});
	};

	$http.get('/books').success(function(item) {
		$scope.books = item.books;
	});

	$scope.saveBook = function() {
		$(".alert").hide();
		$http.post('/book', $scope.book).success(function() {
			if (!exists()) {
				$scope.books.push($scope.book);
				$scope.book = newBook();
			}
			$(".alert-success").show();
		}).error(function(data, status, header, config) {
			$(".alert-danger").show();
		});
	};

	$scope.saveBookReply = function() {
		$(".alert").hide();
		$http.post('/book/reply', $scope.replies).success(function() {
			angular.forEach($scope.replies, function(reply) {
				angular.forEach($scope.book.questions, function(question) {
					if (reply.question._id === question._id) {
						question.replies.push(reply);
					}
				});
			});
			$scope.replies = [];
			angular.forEach($scope.book.questions, function(question) {
				var newReplies = [];
				angular.forEach(question.replies, function(reply) {
					newReplies.push({
						description : reply.description
					});
				});
				question.replies = newReplies;
				$scope.replies.push({
					description : '',
					question : question
				});
			});
			$scope.currentPage = 0;
			focusFirstReply();
			$(".alert-success").show();
		}).error(function(data, status, header, config) {
			$(".alert-danger").show();
		});
	};

	$scope.removeBook = function(id) {
		// dlg = $dialogs.confirm('Confirmação', 'Deseja realmente excluir?');
		// dlg.result.then(function(btn) {
		// $(".alert").hide();
		// $http({
		// method : 'DELETE',
		// url : '/book/' + id
		// }, $scope.book).success(function() {
		// for (var i = 0, ii = $scope.books.length; i < ii; i++) {
		// if (id === $scope.books[i].id) {
		// $scope.books.splice(i, 1);
		// break;
		// }
		// }
		// $(".alert-success").show();
		// }).error(function(data, status, header, config) {
		// $(".alert-danger").show();
		// });
		//
		// }, function(btn) {
		// // $scope.confirmed = 'Shame on you for not thinking this is awesome!';
		// });
		bootbox.confirm("Deseja realmente excluir?", function(result) {
			if (result) {
				$(".alert").hide();
				$http({
					method : 'DELETE',
					url : '/book/' + id
				}, $scope.book).success(function() {
					for (var i = 0, ii = $scope.books.length; i < ii; i++) {
						if (id === $scope.books[i].id) {
							$scope.books.splice(i, 1);
							break;
						}
					}
					$(".alert-success").show();
				}).error(function(data, status, header, config) {
					$(".alert-danger").show();
				});
			}
		});
	};

	$scope.addQuestion = function() {
		$scope.book.questions.push({
			descrition : ''
		});
		focusLastQuestion();
		setTimeout(function() {
			hotkeys();
		}, 100);
	};

	var focusLastQuestion = function() {
		setTimeout(function() {
			$("input.question:last").focus();
		}, 100);
	};

	var focusFirstReply = function() {
		setTimeout(function() {
			$("input.reply:first").focus();
		}, 100);
	}

	$scope.removeQuestion = function(question) {
		var remove = function(apply) {
			for (var i = 0, ii = $scope.book.questions.length; i < ii; i++) {
				if (question === $scope.book.questions[i]) {
					if (apply) {
						$scope.$apply(function() {
							$scope.book.questions.splice(i, 1);
						});
					} else {
						$scope.book.questions.splice(i, 1);
					}
					focusLastQuestion();
					break;
				}
			}
		};
		if (question.description && question.description.length > 0) {
			bootbox.confirm("Deseja realmente excluir?", function(result) {
				if (result) {
					remove(true);
				} else {
					focusLastQuestion();
				}
			});
		} else {
			remove(false);
		}
	};

	var exists = function() {
		var exists = false;
		for (var i = 0, ii = $scope.books.length; i < ii; i++) {
			if ($scope.book.id === $scope.books[i].id) {
				$scope.books[i] = $scope.book;
				exists = true;
				break;
			}
		}
		return exists;
	};

	$scope.launch = function(which) {
		var dlg = null;
		switch (which) {

		// Error Dialog
		case 'error':
			dlg = $dialogs.error('This is my error message');
			break;

		// Wait / Progress Dialog
		case 'wait':
			dlg = $dialogs.wait(msgs[i++], progress);
			fakeProgress();
			break;

		// Notify Dialog
		case 'notify':
			dlg = $dialogs.notify('Something Happened!', 'Something happened that I need to tell you.');
			break;

		// Confirm Dialog
		case 'confirm':
			dlg = $dialogs.confirm('Please Confirm', 'Is this awesome or what?');
			dlg.result.then(function(btn) {
				$scope.confirmed = 'You thought this quite awesome!';
			}, function(btn) {
				$scope.confirmed = 'Shame on you for not thinking this is awesome!';
			});
			break;

		// Create Your Own Dialog
		case 'create':
			dlg = $dialogs.create('/dialogs/whatsyourname.html', 'whatsYourNameCtrl', {}, {
				key : false,
				back : 'static'
			});
			dlg.result.then(function(name) {
				$scope.name = name;
			}, function() {
				$scope.name = 'You decided not to enter in your name, that makes me sad.';
			});

			break;
		}
		; // end switch
	}; // end launch

	// for faking the progress bar in the wait dialog
	var progress = 25;
	var msgs = [ 'Hey! I\'m waiting here...', 'About half way done...', 'Almost there?', 'Woo Hoo! I made it!' ];
	var i = 0;

	var fakeProgress = function() {
		$timeout(function() {
			if (progress < 100) {
				progress += 25;
				$rootScope.$broadcast('dialogs.wait.progress', {
					msg : msgs[i++],
					'progress' : progress
				});
				fakeProgress();
			} else {
				$rootScope.$broadcast('dialogs.wait.complete');
			}
		}, 1000);
	}; // end fakeProgress

	var hotkeys = function() {
		$("input:not(.hotkey)").bind("keydown.insert", function(evt) {
			$('#addQuestionButton').trigger("click");
			return false;
		}).bind("keydown.del", function(evt) {
			var index = $(this).attr("index");
			$('#removeQuestionButton' + index).trigger("click");
			return false;
		}).addClass("hotkey");
	};

	$(document).ready(function() {
		$("li#main").removeClass("active");
		$("li#book").addClass("active");
		hotkeys();
	});
});

app.filter('startFrom', function() {
	return function(input, start) {
		start = +start;
		return input.slice(start);
	};
});
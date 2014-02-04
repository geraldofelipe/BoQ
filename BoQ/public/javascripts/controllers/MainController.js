var app = angular.module('BoQ', [ 'ui.bootstrap', 'dialogs' ]);
app.controller('MainController', function($scope, $http, $rootScope, $timeout, $dialogs) {
	$scope.predicate = 'title';

	$scope.books = [];
	
	$http.get('/books').success(function(item) {
		$scope.books = item.books;
	});

	$("li#main").addClass("active");
	$("li#book").removeClass("active");
	
});
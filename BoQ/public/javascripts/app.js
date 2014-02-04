'use strict';

// Declare app level module which depends on filters, and services
angular.module('BoQ', [ 'BoQ.filters', 'BoQ.services', 'BoQ.directives' ]).config(
		[ '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
			$routeProvider.when('/view1', {
				templateUrl : 'partial/1',
				controller : MyCtrl1
			});
			$routeProvider.when('/view2', {
				templateUrl : 'partial/2',
				controller : MyCtrl2
			});
			$routeProvider.otherwise({
				redirectTo : '/view1'
			});
			$locationProvider.html5Mode(true);
		} ]);


!function($) {

	$(function() {
		// $('.confirm').confirmation({ singleton : true });
		// $('.confirm').tooltip();
		// $('.confirm').popover();
		bootbox.setDefaults({
			locale : "br",
			backdrop : true,
			animate : true,
			className : null,
			closeButton : true,
			show : true
		});
	});

}(window.jQuery);
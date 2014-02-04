'use strict';
/* Directives */
angular.module('BoQ.directives', []).directive('appVersion', [ 'version', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
} ]);

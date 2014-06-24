'use strict';

angular.module('op',
	['ngAnimate', 'ui.bootstrap', 'throttle']
);

angular.module('op').directive('selectOnClick', function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			element.on('click', function () {
				angular.element('.feninput').select();
			});
		}
	};
});

angular.module('op').directive('pieceHighlight', function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			element.on('mouseenter', function() {
				angular.element('.' + attrs.pieceHighlight).addClass('move-alternative-hovered');
			});
			element.on('mouseleave', function() {
				angular.element('.' + attrs.pieceHighlight).removeClass('move-alternative-hovered');
			});
		}
	};
});

angular.module('op')
.controller('boardCtrl', [
	'$scope',
	'$http',
	'Logic',
	'throttle',
	function($scope, $http, Logic, throttle) {
		$scope.Logic = Logic;

		angular.element(document).ready(function() {
			$(window).on('resize', throttle(100, function() {
				Logic.resizeBoard();
			}));
		});
		Logic.resizeBoard();
	}
]);
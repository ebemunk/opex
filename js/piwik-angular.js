(function(angular) {
	var piwik_module = angular.module('piwik', []);

	piwik_module.factory('Piwik', [
		'$window',
		function(window) {
			window['_paq'] = window['_paq'] || [];

			return {
				push: function(array) {
					window['_paq'].push(array);
				}
			};
		}
	]);

	piwik_module.directive('piwik', [
		'$document',
		'Piwik',
		function(document, Piwik) {
			return {
				restrict: 'E',
				compile: function(element, attrs) {
					var script_elem = document[0].createElement('script');
					script_elem.type = 'text/javascript';
					script_elem.defer = true;
					script_elem.async = true;
					script_elem.src =  attrs.jsUrl;
					document[0].body.appendChild(script_elem);

					Piwik.push(['setTrackerUrl', attrs.phpUrl]);
					Piwik.push(['setSiteId', attrs.siteId]);
					Piwik.push(['trackPageView']);
					Piwik.push(['enableLinkTracking']);
				}
			};
		}
	]);

	piwik_module.directive('piwikEvent', [
		'Piwik',
		'$window',
		function(Piwik, $window) {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					var eventParams = attrs.piwikEvent.split(',');
					eventParams.unshift('trackEvent');
					element.on('click', function() {
						Piwik.push(eventParams);
					});
				}
			};
		}
	]);
})(angular);
angular.module('myApp',["ngRoute","app.controllers","app.services",'ngFileUpload'])
.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: '/templates/roll',
			controller: 'RollCtrl'
		}).when('/login', {
			templateUrl: '/templates/login',
			controller: 'LoginCtrl'
		}).when('/question', {
			templateUrl: '/templates/question',
			controller: 'QuesCtrl'
		}).when('/course', {
			templateUrl: '/templates/course',
			controller: 'CourseCtrl'
		}).when('/stdlist', {
			templateUrl: '/templates/stdlist',
			controller:'StdCtrl'
		}).when('/test', {
			templateUrl: '/templates/test',
			controller: 'TestCtrl'
		}).
		otherwise({redirectTo: '/'});
	}
]).config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);
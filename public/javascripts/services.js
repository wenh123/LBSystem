var Myapp = angular.module('app.services', []);

Myapp.factory('socket', function($rootScope) {
	var socket = io.connect('http://163.18.2.35:3000/my-namespace');
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) callback.apply(socket, args);
				});
			})
		}
	};
});
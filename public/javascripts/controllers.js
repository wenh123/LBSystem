var Myapp = angular.module('app.controllers', [])
var Mydomain = "http://163.18.2.35:3000/";

Myapp.controller('HeaderCtrl',function($scope){
	
	$scope.Exit = function(){
		location.href = "/Exit";
	}
	
})

Myapp.controller('TestCtrl', function($scope,$routeParams,socket,$http) {
	
	$scope.person = {
		TextAccount: "0224301"
	};
	
	emit = function() {
		var Loginfo = {
			"account":$scope.person.TextAccount,
			"courses":[
			{"beacons":{
				"uuid" : "b9407f30-f5f8-466e-aff9-25556b57fe6d",
				"major" : "26751",
				"minor" : "9683"
			},"status":true},
			{"beacons":{
				"uuid" : "b9407f30-f5f8-466e-aff9-25556b57fe6d",
				"major" : "1",
				"minor" : "1"
			},"status":true}
		]}
		
		socket.emit('student login',Loginfo);
	}
	
	emit2 = function() {
		socket.emit('student logout',"0224302");
	}
	
	$scope.emit3 = function(CorrectAnswer){
		socket.emit('student answer',{answer:CorrectAnswer});
		$scope.AnswerCounter = [];
	}
	
	$scope.test = function(){
		$http.post(Mydomain+'data/RollData',{}).
		success(function(data) {
			//if(data.status) $location.url('/');
		}).
		error(function(data) {
				
		});
	}
	
	socket.on('student question', function(data){
		console.log(data);
		$scope.AnswerCounter = [];
		for(var i = 0; i<data;i++){
			$scope.AnswerCounter.push(String.fromCharCode(65+i));
		}
	});
	
});

Myapp.controller('RollCtrl',function($scope,$http,socket){
	$scope.Students;
	$scope.Courses;
	$scope.LoginCount;
	$scope.myCourses;
	
	$scope.GetBasicData = function(){
		$http.post(Mydomain+'data/BasicData',{}).
		success(function(data) {
			$scope.Courses = data.courses;
		}).
		error(function(data) {
				
		});
	}
	
	$scope.GetRollData = function(myCourses){
		if(myCourses==null) id = 0;
		else id = myCourses._id;
			$http.post(Mydomain+'data/RollData',{"CourseId":id}).
			success(function(data) {
				$scope.Students = data.result;
				$scope.LoginCount = {
					"all":data.result.length,
					"yes":data.result.length - data.nologin,
					"no":data.nologin
				}
			}).
			error(function(data) {
					
			});
	}
	
	socket.on('student login', function(data){
		//if(msg === 1) window.location.href = 'http://www.google.com';
		for(i in $scope.Students)
			if(!$scope.Students[i].account.indexOf(data.account)){
				$scope.Students[i].status = data.status;
				$scope.LoginCount.yes++;
				$scope.LoginCount.no--;
			}
				
		console.log(data.account)
	});
	
	socket.on('student logout', function(data){
		//if(msg === 1) window.location.href = 'http://www.google.com';
		for(i in $scope.Students)
			if(!$scope.Students[i].account.indexOf(data.account)){
				$scope.Students[i].status = data.status;
				$scope.LoginCount.yes--;
				$scope.LoginCount.no++;
			}
		console.log(data.account)
	});
	
})

Myapp.controller('LoginCtrl', function($scope,$http,$location) {
	$scope.account = "";
	$scope.password = "";
	$scope.Login = function(){
		$http.post(Mydomain+'data/TeacherLogin',{
			act:$scope.account,
			pwd:$scope.password,
		}).
		success(function(data) {
			if(data.status){
				loginStatus = data.status;
				location.href = '/index';
			}
		}).
		error(function(data) {});
	};
	
	$scope.Redirect = function(){
		$location.url('/');
	}
	
});

Myapp.controller('CourseCtrl', function($scope,$http,$location) {
	$scope.CourseList;
	$scope.CourseNewInfo = {uuid:"b9407f30-f5f8-466e-aff9-25556b57fe6d"};
	
	$scope.GetCourseList = function () {
		$http.post(Mydomain+'data/CoursesData',{}).
		success(function(data){
			$scope.CourseList = data;
			//console.log(data[0].beacons[0].major)
		}).
		error(function(data){})
	}
	
	$scope.AddCourse = function(){
		$http.post(Mydomain+'data/AddCourse',$scope.CourseNewInfo).
		success(function(data){
			if(data.status){
				$('#Add_Modal').modal('hide')
				$scope.GetCourseList();
				$scope.CourseNewInfo = {uuid:"b9407f30-f5f8-466e-aff9-25556b57fe6d"};
			}
		}).
		error(function(data){})
	}
	
	$scope.RemoveCourse = function(index){

		$http.post(Mydomain+'data/RemoveCourse',$scope.CourseList[index]).
		success(function(data){
			if(data.status) $scope.GetCourseList();
		}).
		error(function(data){})
	}
	
	$scope.Redirect = function(){
		$location.url('/');
	}
});

Myapp.controller('StdCtrl', function($scope,Upload,$location,$http) {
	$scope.CourseList;
	
	$scope.AddStudents = function(){
		//var qq = $('#fileToUpload').val()
		$scope.upload($scope.files,$scope.CourseModel.Name);
		//console.log(qq);
	}
	
	$scope.GetCourseList = function(){
		$http.post(Mydomain+'data/CoursesData',{}).
		success(function(data){
			$scope.CourseList = data;
			$scope.CourseModel = $scope.CourseList[0];
		}).
		error(function(data){})
	}
	
	$scope.Console = function(){
		console.log($scope.CourseModel.Name)
	}
	
	$scope.upload = function (files,name) {
		console.log(files)
		if (files && files.length) {
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				Upload.upload({
					url: Mydomain+'data/AddStudentsList',
					fields: {
						'coursename': name
					},
					file: file
				}).progress(function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					//$scope.log = 'progress: ' + progressPercentage + '% ' +
					//evt.config.file.name + '\n' + $scope.log;
				}).success(function (data, status, headers, config) {
					//$scope.log = 'file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data) + '\n' + $scope.log;
					if(data.status) $location.url('/');
				});
			}
		}
	};

});

Myapp.controller('QuesCtrl', function($scope,socket) {
	
	$scope.AnswerModel = {"quantity":[1,2,3,4,5,6,7,8]}
	$scope.AnswerChart;
	
	$scope.OpenQuestion = function() {
		
		var dateObj = new Date();
		var year = dateObj.getUTCFullYear(),
			month = dateObj.getUTCMonth() + 1,
			day = dateObj.getUTCDate();
		
		$scope.QuestionNewInfo = {
			"name":"New Question "+year+"/"+month+"/"+day,
			"quantity":$scope.AnswerModel.quantity[0]
		}
	}
	
	$scope.CreateQuestion = function(){
		$('#Create_Question').modal('hide')
		socket.emit('teacher ask',$scope.QuestionNewInfo);
		$scope.Answer = [];
		for(var i = 0; i<$scope.QuestionNewInfo.quantity;i++){
			$scope.Answer.push({y:0,label:String.fromCharCode(65+i)});
		}
		console.log($scope.Answer)
		$scope.OpenChart();
	}
	
	$scope.OpenChart = function () {
		$scope.AnswerChart = new CanvasJS.Chart("chartContainer",{
			title:{
				text: $scope.QuestionNewInfo.name
			},
			animationEnabled: true,
			animationDuration: 2000,
				axisY: {
					title: "Counter"
				},
				legend: {
					verticalAlign: "bottom",
					horizontalAlign: "center"
				},
				theme: "theme2",
				data: [{
					type: "column",
					showInLegend: true,
					legendMarkerColor: "grey",
					legendText: "Answer",
					dataPoints: $scope.Answer
				}]
			});
		$scope.AnswerChart.render();
	}
	
	socket.on('teacher counter',function(data){
		for (i in $scope.AnswerChart.options.data[0].dataPoints)
			if($scope.AnswerChart.options.data[0].dataPoints[i].label == data)
				$scope.AnswerChart.options.data[0].dataPoints[i].y +=1;
		$scope.AnswerChart.render();
	})
	
});

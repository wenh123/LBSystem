var express = require('express');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var models = require('./models');
var MongoModel = new models();
var Q = require('q');


var COOKIE_SECRET = 'secret';
var COOKIE_NAME = 'sid';
/* GET home page. */
function ioModel(io,app){
	var nsp = io.of('/my-namespace');
	var AnswerCounter = false,
		AnswerNowId = false;
	nsp.use(function(socket, next) {
		try {
			var data = socket.handshake || socket.request;
			if (! data.headers.cookie)
				return next(new Error('Missing cookie headers'));
			//console.log('cookie header ( %s )', JSON.stringify(data.headers.cookie));
			socket.cookies = cookie.parse(data.headers.cookie);
			//console.log('cookies parsed ( %s )', JSON.stringify(socket.cookies));
			if (! socket.cookies[COOKIE_NAME])
				return next(new Error('Missing cookie ' + COOKIE_NAME));
			var sid = cookieParser.signedCookie(socket.cookies[COOKIE_NAME], COOKIE_SECRET);
			if (! sid)
				return next(new Error('Cookie signature is not valid'));
			//console.log('session ID ( %s )', sid);
			app.sessionStore.get(sid, function(err, session){// access to session
				if(err) console.log("session store err"+error);
				else{
					socket.session = session;
					next()
				}
			}); 
		} catch (err) {
			console.error(err.stack);
			next(new Error('Internal server error'));
		}
	});//use session and cookie

	nsp.on('connection', function (socket) {
		var StudentId,
			TeacherId = MongoModel.ConvertObject(socket.session.UserId),
			CourseId = MongoModel.ConvertObject(socket.session.CourseId);
			
		//socket.broadcast.emit('hi');

		socket.join();
		
		//nsp.to(socket.id).emit('io connected',socket.id);
		
		socket.on('disconnect', function(){
			console.log("offline");
			toTeacher = {"status":0,"account":StudentId}
			MongoModel.UpdateOnce('students',{"account":StudentId},{"status":0});
			nsp.to().emit('student logout',toTeacher);
		});
		
		socket.on('student logout',function(data){
			toTeacher = {"status":0,"account":StudentId}
			MongoModel.UpdateOnce('students',{"account":StudentId},{"status":0});
			nsp.to().emit('student logout',toTeacher);
		});//student logout event
		
		socket.on('student login', function(loginfo){
			StudentId = loginfo.account;//set the socket session students id
			
			for(var i in loginfo.courses){
				MongoModel.FindInDb('courses',loginfo.courses[i]).then(function(data){
					toTeacher = {"status":data.length,"account":loginfo.account}
					if(data.length>0){
						MongoModel.UpdateOnce('students',{"account":loginfo.account},{"status":1});
						nsp.to(socket.id).emit('io connected',socket.id);
						nsp.to().emit('student login',toTeacher);
					}
				}, function (err) {
					console.log(err)
				});
			}
			MongoModel.FindInDb('questions',{_id:AnswerNowId,OK:StudentId}).then(function(result){
				console.log(result)
				console.log(socket.id);
				if(result.length > 0) nsp.to(socket.id).emit('student question',false);
				else nsp.to(socket.id).emit('student question',AnswerCounter);
			})
		});//student login event
		
		socket.on('teacher ask',function(data){
			//console.log(data)
			AnswerCounter = data.quantity;
			
			MongoModel.InsertToDb('questions',{
				"teahcer":TeacherId,
				"courses":CourseId,
				"name":data.name,
				"quantity":AnswerCounter,
				"date":new Date()
			}).then(function(data){
				AnswerNowId = data.ops[0]._id;
			})
			
			nsp.to().emit('student question',AnswerCounter);
		})//when the teacher ask the question
		
		socket.on('student answer',function(data){
			var Answer = data.answer.toUpperCase();
			
			switch(Answer){
				case "A":
					condition = {A:StudentId,OK:StudentId};
					break;
				case "B":
					condition = {B:StudentId,OK:StudentId};
					break;
				case "C":
					condition = {C:StudentId,OK:StudentId};
					break;
				case "D":
					condition = {D:StudentId,OK:StudentId};
					break;
				case "E":
					condition = {E:StudentId,OK:StudentId};
					break;
				case "F":
					condition = {F:StudentId,OK:StudentId};
					break;
				case "G":
					condition = {G:StudentId,OK:StudentId};
					break;
				case "H":
					condition = {H:StudentId,OK:StudentId};
					break;
				default:
					condition ={};
			}
			console.log(condition);
			console.log(AnswerNowId);
			
			MongoModel.PushArray('questions',{"_id":AnswerNowId},condition).then(function(result){})
			
			nsp.to().emit('teacher counter',Answer);
		})
		
	});
	
}
module.exports = ioModel;

var express = require('express');
var router = express.Router();
var models = require('./models');
var session = require('express-session');
var MongoModel = new models();
var Q = require('q');
var fs = require("fs");

/* Transport the data */
router.post('/TeacherLogin', function (req, res){
	var user = req.body;
	MongoModel.FindInDb('teachers',{"account":user.act,"pwd":user.pwd},{"account":1})
	.then(function(data) {
		if(data.length>0){
			req.session.UserId = data[0]._id;//set the session
			res.json({"status":true})
		}
		else res.json({"status":false})
	});
});//Web登錄方法

router.post('/BasicData',function(req,res){
	TeacherId = MongoModel.ConvertObject(req.session.UserId)
	MongoModel.FindInDb('courses',{"teacher":TeacherId}).then(function(C){
		for(var i in C){
			delete C[i]['beacons'];
			delete C[i]['status'];
			delete C[i]['teacher'];
		}
		res.json({"courses":C})
	})
});//Get the Basic of Teacher's Courses data

router.post('/RollData',function(req,res){
	TeacherId = MongoModel.ConvertObject(req.session.UserId)
	CourseId = MongoModel.ConvertObject(req.body.CourseId)
	Q.all([
		MongoModel.UpdateAll('courses',{"teacher":TeacherId},{"status":false}),
		MongoModel.UpdateOnce('courses',{"_id":CourseId},{"status":true}),
		MongoModel.FindInDb('students',{"courses":CourseId}),
		MongoModel.FindInDbAndCount('students',{"courses":CourseId,"status":0})
	]).then(function(data){
		req.session.CourseId = CourseId;
		res.json({"result":data[2],"nologin":data[3]})
	})
});//Get the Roll of Students data

router.post('/CoursesData',function(req,res){
	TeacherId = MongoModel.ConvertObject(req.session.UserId)
	MongoModel.FindInDb('courses',{"teacher":TeacherId}).then(function(data){
		for(var i in data) delete data[i]['teacher']
		res.json(data)
	})
});//Get the Courses of Teacher data

router.post('/AddCourse',function(req,res){
	TeacherId = MongoModel.ConvertObject(req.session.UserId)
	var condition = {
		Name:req.body.name,
		teacher:TeacherId
	};
	var contents = {
		"beacons":[{
			"uuid":req.body.uuid,
			"major":req.body.major,
			"minor":req.body.minor
		}],"status":false
	}
	TeacherId = MongoModel.ConvertObject(req.session.UserId)
	MongoModel.UpsertOnce('courses',condition,contents).then(function(data){
		res.json({"status":true})
	})
})

router.post('/RemoveCourse',function(req,res){
	TeacherId = MongoModel.ConvertObject(req.session.UserId);
	CourseId = MongoModel.ConvertObject(req.body._id);
	condition = {"_id":CourseId,"teacher":TeacherId}
	MongoModel.RemoveInDb('courses',condition).then(function(data){
		res.json({"status":true})
	})
	
})

router.post('/AddStudentsList',function(req,res){
	TeacherId = MongoModel.ConvertObject(req.session.UserId);
	CourseName = req.body.coursename;
	fs.readFile(req.files.file.path,"UTF-8", function (err, data) {
		if (err) console.log(err);
		else{
			StdList = data.split('\r');
			MongoModel.FindInDb('courses',{"teacher":TeacherId,"Name":CourseName}).then(function(C){
				for(i in StdList){
					tempo = StdList[i].split(',');
					tempo[0] = tempo[0].replace(/\s/g,'');//remove the space
					tempo[1] = tempo[1].replace(/\s/g,'');//remove the space
					MongoModel.InsertToDb('students',{"account":tempo[0],"Name":tempo[1],"pwd":"123456","status":0}).then(function(EN){
						
					})
					MongoModel.PushArray('students',{"account":tempo[0]},{"courses":C[0]._id}).then(function(OK){
							//push新的课程
					})
				}
			})
			res.json({"status":true});
		}
	});
})

module.exports = router;
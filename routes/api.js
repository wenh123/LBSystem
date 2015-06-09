var express = require('express');
var router = express.Router();
var session = require('express-session');
var models = require('./models');
var MongoModel = new models();
var Q = require('q');

/* GET users listing. */
router.post('/login', function(req, res, next) {
	var user = req.body;
	MongoModel.FindInDb('students',{"account":user.act,"pwd":user.pwd},{"account":1})
	.then(function(data){
		if(data.length>0) res.json({"status":true})
		else res.json({"status":false})
	})
});

module.exports = router;

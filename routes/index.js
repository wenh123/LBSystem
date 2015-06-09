var express = require('express');
var router = express.Router();
var session = require('express-session');

/* GET home page. */

/* Load Templates */
router.get('/templates/login', function (req, res){
	if(req.session.UserId!=null) SetFile = 'redirect';//if session uid not null will set the redirect page
	else SetFile = 'login';
	res.render(SetFile);
});

router.get('/templates/roll', function (req, res){
	res.render('roll');
});

router.get('/templates/question',function (req, res){
	res.render('question');
})

router.get('/templates/course',function (req, res){
	if(req.session.UserId!=null) SetFile = 'course';//if session uid not null will set the redirect page
	else SetFile = 'redirect';
	res.render(SetFile);
})

router.get('/templates/stdlist',function (req, res){
	if(req.session.UserId!=null) SetFile = 'stdlist';//if session uid not null will set the redirect page
	else SetFile = 'redirect';
	res.render(SetFile);
})

router.get('/templates/test',function (req, res){
	res.render('test');
})

router.get('/Exit',function(req,res,next){
	req.session.destroy();
	res.redirect('/roll')
})

/* Main */
router.get('*', function(req, res, next) {
	//res.sendfile('views/index.html');
	res.cookie('status', 'teacher', {
		expires: new Date(Date.now() + 900000),
		maxAge: 900000
	})
	
	res.render('index', {
		title:"HI"//req.cookies.name
	});
});

/*Test modal*/
router.get('/session',function(req ,res , next){
	req.session.lastPage = 'testSession';//this is set the session value;
	res.send('ss')
})


module.exports = router;

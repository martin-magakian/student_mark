var express = require('express');
var EmailSender = require('./../EmailSender.js');
var _ = require('underscore');
var router = express.Router();
var assert = require('assert');
var config = require('../Config.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	var hbFiles = req.app.locals.hbFiles;
	var docxMaker = req.app.locals.docxMaker;

	res.render('index', {
		users: hbFiles.listUsers(),
		marks: docxMaker.getTags()
	});
});

router.post('/createDocx', function(req, res) {
	var hbFiles = req.app.locals.hbFiles;
	var docxMaker = req.app.locals.docxMaker;

	var data = req.body;
	var user = hbFiles.getUser(data.userIndex);

	docxMaker.createDocx(user, data.mark, data.marks);
    res.send("OK");
});

router.post('/sendMark', function(req, res) {
	var hbFiles = req.app.locals.hbFiles;
    var argv = req.app.locals.argv;
	var data = req.body;
	var user = hbFiles.getUser(data.userIndex);
    new EmailSender(user.email).sendMark(data.mark, data.absent, argv.subject, argv.date, function(){
    	res.send("OK");
    },function(msg){
    	res.status(500).send(msg);
    });
});

router.post('/sendMarkSummary', function(req, res) {
	var hbFiles = req.app.locals.hbFiles;
    var argv = req.app.locals.argv;
	var data = req.body;

	// fill user in data
	_.each(data, function(user){
		user.user = hbFiles.getUser(user.userIndex);
	});

	var zip = hbFiles.zipAllDocx(argv.path, argv.date, argv.subject, argv.groupe);
	var totalExam = hbFiles.listUsers().length;

	var totalStudent = data.length;
	var totalDocx = zip[0];
	assert(totalExam == totalStudent, "Different number of exam (["+totalExam+"] .zip file) and student (["+totalStudent+"] from web UI)");
	assert(totalExam == totalDocx,    "Different number of exam (["+totalExam+"] .zip file) and marks (["+totalDocx+"].docx)");

	var attachmentPath = zip[1];
	var attachmentName = zip[2].substring(2); // remove the _;
    new EmailSender(config.summary_send_to).sendMarkSummary(data, attachmentPath, attachmentName,  argv.subject, argv.date,  argv.groupe, function(){
    	res.send("OK");
    },function(msg){
    	res.status(500).send(msg);
    });

});



module.exports = router;
 
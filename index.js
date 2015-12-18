var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var HbFiles = require('./HbFiles.js');
var DocxMaker = require('./DocxMaker.js');
var assert = require('assert');
var argv = require('yargs')
    .demand(['path', 'template', 'date', 'subject', 'groupe'])
    .describe('path', 'Path to the student exam file. Eg: mmagakian@somedomain.zip for the user Martin Magakian.')
    .describe('date', 'Exam date Eg: 2016-10-03')
    .describe('template', 'Path to the docx template eg: /path/to/template.docx')
    .describe('subject', 'Subject of the exam Eg: Android')
    .describe('groupe', 'Groupe number')
    .example('$0 --path "/path/to/exam/" --date "2016-10-11" --template "/path/to/template.docx" --subject "Android" --groupe 5')
    .argv;

checkArgv(argv);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


var routes = require('./routes/index');
app.use('/', routes);

var hbFiles = new HbFiles(argv.path, argv.template);
var docxMaker = new DocxMaker(argv.path, argv.date, argv.template);
app.locals.hbFiles = hbFiles;
app.locals.docxMaker = docxMaker;
app.locals.argv = argv;


var server = app.listen(3000, function () {
  var port = server.address().port;

  console.log('listening at http://localhost:%s', port);
});


function checkArgv(argv){
	assert(argv.date != null && argv.date != "", "date '"+argv.date+"' isn't valide");
    assert(argv.date.split("-").length == 3, "date '"+argv.date+"' isn't valide. It should be yyyy-mm-dd");
}


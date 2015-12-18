var fs = require('fs');
var S = require('string');
var assert = require('assert');
var Docxtemplater = require('docxtemplater');
var _ = require('underscore');
var s = require("underscore.string");
var Archiver = require('archiver');
var Zip = require('node-7z');
var log = new (require('./Logger.js'))();
var config = require('./Config.js');


var template = "";
var dir = "";

//Public
module.exports = HbFiles;
function HbFiles(_dir, _template) {
    this.dir = _dir;
    this.template = _template;
    this.checkValidate();
}

HbFiles.prototype.checkValidate = function () {
    assert(this.isDirExist(), "directory '"+this.dir+"' don't existe");
    assert(this.isTemplateExist(), "template '"+this.template+"' don't existe");
}

HbFiles.prototype.checkUserNames = function (user) {
    assert(user.match(/^[a-z0-9]+$/i), "user named '"+user+"' isn't valide ?");
}

HbFiles.prototype.fileExist = function (file) {
    try {
        return fs.statSync(file).isFile();
    } catch (err) {
        return false;
    }
    return false;
}

HbFiles.prototype.isTemplateExist = function () {
    if(this.fileExist(this.template)){
        return s(this.template).endsWith("docx");
    }
    return false;
}

HbFiles.prototype.isDirExist = function () {
    try {
        return fs.statSync(this.dir).isDirectory();
    } catch (err) {
        return false;
    }
}

HbFiles.prototype.listUsers = function () {
    var users = [];
    var me = this;
    var files = fs.readdirSync(this.dir);
    _.each(files, function(file) {
        file = file.toLowerCase();
        var dotPos = file.lastIndexOf("@");
        if(dotPos != -1){
            var name = file.substring(0, dotPos);
            me.checkUserNames(name);
            var email = name+config.studentEmailDomain;

            var nameObj = {};
            nameObj.cutName = name.substring(0, 1);
            nameObj.cutSurname = name.substring(1);
            nameObj.name = name;
            nameObj.email = email;
            users.push(nameObj);
        }
    });
    return users;
}


HbFiles.prototype.getUser = function (index) {
    return this.listUsers()[index];
}

/*
HbFiles.prototype.zipAllDocx = function(path, date, subject, groupe) {
    var subjectClean = subject.replace(/[\W_-]/g, '');
    var zipPath = path+"/_Groupe"+groupe+"-"+date+"-"+subjectClean+".zip";
    var output = fs.createWriteStream(zipPath);
    var zip = Archiver.create('zip', {});
    zip.pipe(output);

    var files = fs.readdirSync(this.dir);
    var docxFiles = [];
    _.each(files, function(file) {
        file = file.toLowerCase();
        if(file.endsWith(".docx")) {
            var file = path+"/"+file;
            docxFiles.push(file);
        }
    });
    zip.bulk(
        {src: docxFiles, dest:'/', expand:true, flatten:true}
    );
    zip.finalize();
    return [docxFiles.length, zipPath];
}
*/

HbFiles.prototype.zipAllDocx = function(path, date, subject, groupe) {
    var subjectClean = subject.replace(/[\W_-]/g, '');
    var zipName = "/_Groupe"+groupe+"-"+date+"-"+subjectClean+".7z";
    var zipPath = path+zipName;

    var files = fs.readdirSync(this.dir);
    var docxFiles = [];
    _.each(files, function(file) {
        file = file.toLowerCase();
        if(file.endsWith(".docx")) {
            var file = path+"/"+file;
            docxFiles.push(file);
        }
    });

    assert(docxFiles.length, "There is nothing to zip");

    var archive = new Zip();
    archive.add(zipPath, docxFiles);
    log.info("create zip: "+zipName);

    return [docxFiles.length, zipPath, zipName];
}




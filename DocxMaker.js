var fs = require('fs');
var S = require('string');
var assert = require('assert');
Docxtemplater = require('docxtemplater');
var _ = require('underscore');
var s = require("underscore.string");
var log = new (require('./Logger.js'))();


var template = "";
var dir = "";

//Public
module.exports = DocxMaker;
function DocxMaker(_dir, _date, _template) {
    this.dir = _dir;
    this.date = _date;
    this.template = _template;
}

DocxMaker.prototype.getTemplateDocx = function() {
    var templateBin = fs.readFileSync(this.template,"binary");
    return new Docxtemplater(templateBin);
}
 
DocxMaker.prototype.getTags = function () {
    var list = this.getTemplateDocx().getTags();
    var tags = list[2].vars.undef;
    var marks = _.find(tags, function(k,v){
        if(v == "marks"){
            return true;
        }
    });
    var decompose = this.decompose(marks);
    return decompose;
}

DocxMaker.prototype.checkMarkExist = function (marks, markKey, markValue) {
    var keyRecompose = markKey+"_"+markValue+"_point";
    var keyExist = _.find(marks, function(k,v){
        if(v == keyRecompose)
            return true
    });
    var valueExist = _.find(marks, function(k,v){
        if(v == markKey)
            return true
    });
    assert(keyExist && valueExist, "The key "+markKey+" don't match the value "+keyRecompose);
}

DocxMaker.prototype.decompose = function (marks) {
    var me = this;
    var decompose = {};
    _.each(marks, function(k,v){
        if(s(v).endsWith("_point")){
            var replace = v.replace(/_point/g, '');
            var lastPos = replace.lastIndexOf("_");
            var markKey = replace.substring(0, lastPos);
            var markValue = replace.substring(lastPos+1);

            me.checkMarkExist(marks, markKey, markValue);

            decompose[markKey] = markValue;
        }
    });
    return decompose;
}

DocxMaker.prototype.markTemplate = function (marks){
    var tags = this.getTags();
    var all = {};
    _.each(Object.keys(marks), function(key){
        var value = marks[key];
        var total = tags[key];
        all[key] = value;
        all[key+"_"+total+"_point"] = total;
    });
    return all;
}

DocxMaker.prototype.createDocx = function (user, mark, marks) {
    var template = this.getTemplateDocx();
    template.setData({
        "name": user.cutName,
        "surname": user.cutSurname,
        "mark": mark,
        "date": this.date,
        "marks": this.markTemplate(marks)
    });
    template.render();
    var buf = template.getZip().generate({type:"nodebuffer"});

    var fileGen = this.dir+"/"+user.name+".docx";
    fs.writeFileSync(fileGen,buf);
    log.info("create "+user.name+".docx");
}



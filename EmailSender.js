var fs = require('fs');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var log = new (require('./Logger.js'))();
var config = require('./Config.js');

var sendTo = "";

//Public
module.exports = EmailSender;
function EmailSender(_sendTo) {
    this.sendTo = _sendTo;
    if(!_.isEmpty(config.mock_all_email)){
        this.sendTo = config.mock_all_email;
    }
}

EmailSender.prototype.defaultTransporter = function() {
    var transporter = nodemailer.createTransport({
        host: config.email.host, // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: config.email.port, // port for secure SMTP
        auth: {
            user: config.email.login,
            pass: config.email.password
        },
        tls: {
            ciphers:'SSLv3'
        }
    }, {
        to: this.sendTo,
        from: config.email.from,
        cc: config.cc_all_email,
    });
    return transporter;
}

EmailSender.prototype.templateMarkSummary= function(userWithMark, subject, date, groupe){
    var body = "Bonjour,\r\nVoici les notes de la dernière évaluation du groupe"+groupe+"\r\n";
    body += "En pièce jointe les docx individuel\r\n\r\n";
    body += "Date: "+date+"\r\n";
    body += "Matière: "+subject+"\r\n";
    body += "Groupe: "+groupe+"\r\n\r\n";

    _.each(userWithMark, function(user){
        var absMark = user.absent ? "Absent" : user.mark+"/20";
        body += user.user.name+" - "+ absMark +"\r\n";
    });

    body += "\r\n\r\n";
    body += "-- Martin";

    return body;
}

EmailSender.prototype.templateUserMark = function(mark, isAbsent, subject, date) {
    var absMark = isAbsent ? "Absent" : mark+"/20";
    return 'Bonjour, Voici ta note d\'évaluation.\r\n\r\n'
                +'Matière: '+subject+'\r\n'
                +'Date: '+date+'\r\n'
                +'Note: '+absMark+'\r\n\r\n\r\n'
                +'-- Martin';
}

EmailSender.prototype.failToSend = function(to, successCallback, failCallback){
    return function(error, info){
        if(error){
            var msg = "[KO] email to "+to+" not sent!";
            log.error(msg);
            console.log(error);
            console.log(info);
            failCallback(msg);
        }else{
            log.info("[OK] Email sent to "+to);
            successCallback();
        }
    }
}

EmailSender.prototype.sendMark = function(mark, isAbsent, subject, date, onSuccess, onFail) {
    var transporter = this.defaultTransporter();
    var to = this.sendTo;
    log.info("sending to "+to+"...");
    var r = transporter.sendMail({
        subject: 'Note '+subject,
        text:   this.templateUserMark(mark, isAbsent, subject, date)
    }, this.failToSend(to, onSuccess, onFail));
}

EmailSender.prototype.sendMarkSummary = function (userWithMark, attachmentPath, attachmentName, subject, date,  groupe, onSuccess, onFail) {
    var transporter = this.defaultTransporter();
    var to = this.sendTo;
    log.info("sending to "+to+"...");
    var r = transporter.sendMail({
        attachments: [{
            filename: attachmentName,
            path: attachmentPath
        }],
        subject: 'Notes '+subject+' - Groupe'+groupe,
        text:   this.templateMarkSummary(userWithMark, subject, date, groupe)
    }, this.failToSend(to, onSuccess, onFail));
}



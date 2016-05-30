var config = require('config');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
//var Courses = require('../../catalogs/courses.js');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var MyPdfStatus = require('./models/myPDFStatus.js');

function pdfStatus(){

};

//get created course for a user from courses
pdfStatus.prototype.getPdfStatus = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['userId'], error)) {
        return;
    }

    var user = {userId: params.userId};

    MyPdfStatus.find(user).populate('nodeId').populate('courseId', '-description').exec(function (err, res){
        if (err) error (err);
        else
            done(res);
    });
};

module.exports = pdfStatus;


var config = require('config');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
//var Courses = require('../../catalogs/courses.js');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var MyVideoStatus = require('./models/myVideoStatus.model.js');

function videoStatus(){
    
}

//get created course for a user from courses
videoStatus.prototype.getVideoStatus = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['userId'], error)) {
        return;
    }

    var user = {userId: params.userId};

    MyVideoStatus.find(user).populate('nodeId').populate('courseId', '-description').exec(function (err, res){
        if (err) error (err);
        else
            done(res);
    });
};

module.exports = videoStatus;
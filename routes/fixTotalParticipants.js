var express = require('express');
var config = require('config');

var appRoot = require('app-root-path');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var UserCourses = require(appRoot + '/modules/catalogs/userCourses.js');
var router = express.Router();

router.get('/fixTotalParticipants/:courseId', function (req, res, next) {
    Courses.findOne({_id: req.params.courseId}).exec(function (err, result) {
        if (result) {
            UserCourses.find({course:req.params.courseId, isEnrolled:true}).count().exec(function (err, res){
                if (res) {
                    result.totalEnrollment = res;
                    result.save();
                } else {
                    result.totalEnrollment = 0;
                    result.save();
                    console.log('no user enrolled');
                }
            });

        } else {
            console.log('Cannot find course');
        }
    });
    res.status(200).json({status: true});
});

module.exports = router;
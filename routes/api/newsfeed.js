var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var NewsfeedController = require(appRoot + '/modules/applications/newsfeed/newsfeed.controller.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

router.get('/newsfeed/:courseId', function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    /*
    var limit = 10;
    if (req.query['limit']) {
        var limitTemp = parseInt(req.query['limit']);
        if (limitTemp != NaN)
            limit = limitTemp;
    }


    var sortBy = 'dateAdded';
    if (req.query['sortBy'])
        sortBy = req.query['sortBy'];

    var lastPage = false;
    if (req.query['lastPage'])
        lastPage = parseInt(req.query['lastPage']);
     */

    userHelper.isEnrolledAsync({
        userId: mongoose.Types.ObjectId(req.user._id),
        courseId: mongoose.Types.ObjectId(req.params.courseId)
    })
        .then(function (isEnrolled) {
            if (!isEnrolled) {
                return helper.resReturn(helper.createError401(), res);
            }

            var nf = new NewsfeedController();
            nf.getNewsfeed(
                function (err) {
                    res.status(500).json({
                        result: false,
                        errors: err
                    });
                },
                // parameters
                mongoose.Types.ObjectId(req.params.courseId),

                function (newsfeeds) {
                    res.status(200).json({
                        result: true, newsfeeds: newsfeeds
                    });
                }
            );

        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

module.exports = router;
var express = require('express');
var passport = require('passport');
var config = require('config');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');


var async = require('asyncawait/async');
var await = require('asyncawait/await');

var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');

var router = express.Router();

router.get('/html-sidebar', function (req, res, next) {
    var isAuthed = false;

    if (req.user && req.query.cid) {
        userHelper.isCourseAuthorizedAsync({
                courseId: req.query.cid,
                userId: req.user._id
            })
            .then(function (isAllwd) {
                isAuthed = isAllwd;
                res.render('ui-widgets/html-sidebar/html-sidebar', {isAuthorized: isAuthed});
            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    }
    else
        res.render('ui-widgets/html-sidebar/html-sidebar', {isAuthorized: isAuthed});
});

module.exports = router;

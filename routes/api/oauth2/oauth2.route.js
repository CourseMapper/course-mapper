var oauth2Controller = require('../../../modules/oauth2/oauth2.controller.js');
var appController = require('../../../modules/oauth2/application.controller.js');
var express = require('express');
var router = express.Router();
var helper = require('../../../libs/core/generalLibs.js');
var mongoose = require('mongoose');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

// Create endpoint handlers for oauth2 authorize
router.get('/authorize', helper.ensureAuthenticated, oauth2Controller.authorization);

router.get('/apps/:mode', function (req, res, next) {
    if (!req.user) {
        return helper.resReturn(helper.createError401('Not Authorized'));
    }

    var params = {
        userId: mongoose.Types.ObjectId(req.user._id)
    };

    var op = async(
        function () {
            var oa = new appController();
            if (req.params.mode == 'created')
                return await(oa.getCreatedApps(params));
            else if (req.params.mode == 'installed')
                return await(oa.getInstalledApps(params));
        });

    op(params).then(function (apps) {
            res.status(200).json({
                result: true, apps: apps
            });
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

router.get('/app/:appId', function (req, res, next) {
    if (!req.user) {
        return helper.resReturn(helper.createError401('Not Authorized'));
    }

    var params = {
        userId: mongoose.Types.ObjectId(req.user._id),
        _id: mongoose.Types.ObjectId(req.params.appId)
    };

    var op = async(
        function () {
            var oa = new appController();
            return await(oa.getApp(params));
        });

    op(params).then(function (app) {
            res.status(200).json({
                result: true, app: app
            });
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

router.post('/authorize', helper.ensureAuthenticated, oauth2Controller.decision);

router.post('/apps', helper.ensureAuthenticated, function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    var cid = helper.uid(16);
    var secret = helper.uid(32);

    var params = {
        name: req.body.name,
        clientId: cid,
        clientSecret: secret,
        description: req.body.description,
        userId: mongoose.Types.ObjectId(req.user._id)
    };

    var op = async(
        function () {
            var oa = new appController();
            return await(oa.createApp(params));
        });

    op(params).then(function (app) {
            res.status(200).json({
                result: true, app: app
            });
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

// Create endpoint handlers for oauth2 token
router.post('/token', helper.ensureAuthenticated, oauth2Controller.token);

module.exports = router;
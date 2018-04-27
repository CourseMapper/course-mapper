var express = require('express');
var passport = require('passport');
var config = require('config');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var router = express.Router();

/*
/ Create an initial admin user with a random password
*/
router.get('/accounts/createAdmin', function (req, res, next) {
    var account = new Account();
    var password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    account.createAdmin(password);
    console.log("admin password: " + password);
    res.status(200).json({status: true});
});

router.get('/accounts', function (req, res, next) {
    if (req.user)
        res.redirect('/accounts/' + req.user.username);
    else
        res.redirect('/accounts/login');
});

router.get('/accounts/login', function (req, res, next) {
    res.render(config.get('theme') + '/login', {title: 'Log In Page'});
});

router.get('/accounts/forgot-password', function (req, res, next) {
    res.render(config.get('theme') + '/forgotPassword', {title: 'Forgot Password Page'});
});

router.get('/accounts/loginform', function (req, res, next) {
    res.render(config.get('theme') + '/modalLoginForm');
});

router.get('/accounts/nodeloginform', function (req, res, next) {
    res.render(config.get('theme') + '/modalLoginForm', {isNode: true});
});

router.post('/accounts/login', function (req, res, next) {
    var account = new Account();
    account.handleLoginPost(req, res, next);
});

router.get('/accounts/signUp', function (req, res, next) {
    res.render(config.get('theme') + '/signUp', {title: 'Sign Up Page'});
});

router.post('/accounts/signUp', function (req, res, next) {
    var account = new Account();
    account.handleRegisterPost(req, res, next);
});

router.get('/accounts/logout', function (req, res, next) {
    req.logout();
    req.flash('info', 'Logged Out');
    res.redirect('/');
});

router.get('/accounts/:username', function (req, res, next) {
    if (req.user) {
        res.render(config.get('theme') + '/profile', {title: 'My Profile', user: req.user});
    }
    else
        res.redirect('/accounts/login');
});

router.get('/settings/apps', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
    } else
        res.render(config.get('theme') + '/settings/appSettings.ejs', {user: req.user});
});

router.get('/settings/apps/:page', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
    } else
        res.render(config.get('theme') + '/settings/' + req.params.page, {user: req.user});
});

module.exports = router;

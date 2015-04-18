var express = require('express');
var passport = require('passport');
var config = require('config');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var router = express.Router();

router.get('/accounts/createAdmin/:username', function(req, res, next) {
    var account = new Account();
    account.createAdmin(req.params.username);
    res.status(200).json({status:true});
});

router.get('/accounts', function(req, res, next) {
    if(req.user)
        res.redirect('/accounts/' + req.user.username);
    else
        res.redirect('/accounts/login');
});

router.get('/api/accounts', function(req, res, next) {
    if(req.user)
        res.redirect('/api/accounts/' + req.user.username);
    else
        res.status(401).json({message: 'Not authorized'});
});

router.get('/accounts/login', function(req, res, next) {
    res.render(config.get('theme') + '/login', { title: 'Log In Page' });
});

router.post('/accounts/login', function(req, res, next){
    var account = new Account();
    account.handleLoginPost(req, res, next);
});

router.post('/api/accounts/login', passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // 'req.user' contains the authenticated user.
        res.status(200).json({
            result: true,
            username: req.user.username
        });
    }
);

router.get('/accounts/signUp', function(req, res, next){
    res.render(config.get('theme') + '/signUp', { title: 'Sign Up Page' });
});

router.post('/accounts/signUp', function(req, res, next){
    var account = new Account();
    account.handleRegisterPost(req, res, next);
});

router.post('/api/accounts/signUp', function(req, res, next){
    var account = new Account();
    account.signUp(
        function failedSignUp(err){
            res.status(500).json(err);
        },
        req.body,
        function successSignUp(user){
            res.status(201).json({user: user.username});
        }
    );
});

router.get('/api/accounts/logout', function(req, res, next) {
    req.logout();
    res.status(200).json({result:true, message: 'Logged out'});
});

router.get('/accounts/logout', function(req, res, next) {
    req.logout();
    req.flash('info', 'Logged Out');
    res.redirect('/');
});

router.get('/api/accounts/:username', function(req, res, next) {
    if(req.session.passport.user)
        res.status(200).json(req.session.passport.user);
    else
        res.status(401).json({message: 'Not authorized'});
});

router.get('/accounts/:username', function(req, res, next) {
    if(req.session.passport.user){
        res.render(config.get('theme') + '/profile', { title: 'My Profile', user: req.session.passport.user });
    }
    else
        res.redirect('/accounts/login');
});


module.exports = router;
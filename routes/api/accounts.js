/**
 * /api/accounts/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var router = express.Router();

router.post('/accounts/signUp', function(req, res, next){
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

router.get('/accounts/logout', function(req, res, next) {
    req.logout();
    res.status(200).json({result:true, message: 'Logged out'});
});


router.get('/accounts', function(req, res, next) {
    if(req.user)
        res.redirect('/api/accounts/' + req.user.username);
    else
        res.status(401).json({message: 'Not authorized'});
});

router.post('/accounts/login', passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // 'req.user' contains the authenticated user.
        res.status(200).json({
            result: true,
            username: req.user.username
        });
    }
);

router.get('/accounts/:username', function(req, res, next) {
    if(req.session.passport.user)
        res.status(200).json(req.session.passport.user);
    else
        res.status(401).json({message: 'Not authorized'});
});

module.exports = router;

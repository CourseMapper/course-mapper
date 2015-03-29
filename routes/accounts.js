var express = require('express');
var passport = require('passport');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var router = express.Router();

router.get('/accounts', function(req, res, next) {
    if(req.user)
        res.redirect('/accounts/' + req.user.username);
    else
        res.redirect('/accounts/login');
});

router.get('/accounts/login', function(req, res, next) {
    res.send("hahaha");
});

router.post('/accounts/login', function(req, res, next){
    var account = new Account();
    account.handleLoginPost(req, res, next);
});

/*
router.post('/accounts/login',
    passport.authenticate('local', {
        successRedirect: '/accounts',
        failureRedirect: '/accounts/login',
        failureFlash: true
    })
);
 */

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
    res.status(501).send("not implemented");
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

router.get('/api/accounts/:username', function(req, res, next) {
    res.status(501).json({error:"not implemented"});
});

router.get('/accounts/:username', function(req, res, next) {
    res.status(501).json({error:"not implemented"});
});

module.exports = router;
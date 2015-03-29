var express = require('express');
var passport = require('passport');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var router = express.Router();

router.get('/accounts', function(req, res, next) {
    res.send('{}');
});

router.post('/accounts/login', passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // 'req.user' contains the authenticated user.
        res.redirect('/accounts/' + req.user.username);
    }
);

router.post('/api/accounts/login', passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        res.json({
            result: true
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
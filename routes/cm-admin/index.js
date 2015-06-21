var express = require('express');
var config  = require('config');

var router = express.Router();

router.get('/', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/index', {user: req.user});
});

module.exports = router;

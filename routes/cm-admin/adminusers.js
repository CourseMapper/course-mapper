var express = require('express');
var config  = require('config');

var router = express.Router();

router.get('/adminusers', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/adminusers', {user: req.user});
});

module.exports = router;

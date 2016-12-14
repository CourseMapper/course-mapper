var express = require('express');
var config = require('config');
var router = express.Router();
var theme=config.get('theme');

router.get('/search', function (req, res, next) {
    res.render(theme + '/advanced-search', {
        req: req,
        user: req.user,
        showSidebar: true
    });
});

module.exports = router;
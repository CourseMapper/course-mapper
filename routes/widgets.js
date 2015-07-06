var express = require('express');
var config = require('config');
var router = express.Router();
var fs = require('fs');
var appRoot = require('app-root-path');

var staticFiles = fs.readdirSync(appRoot + '/views/widgets/');

router.get('/widgets/gallery', function(req, res, next) {
    res.render(config.get('theme') + '/apps/gallery', {location: req.params.location});
});

router.get('/widgets/:page', function(req, res, next) {
    var fn = req.params.page + '.ejs';

    for (var j = 0; j < staticFiles.length; j++) {
        if (staticFiles[j].match(fn)) {
            // render the static page when exists
            res.render('widgets/' + req.params.page);
            return;
        }
    }

    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = router;

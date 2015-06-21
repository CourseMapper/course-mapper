var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var AppsGallery = require(appRoot + '/modules/apps-gallery');
var router = express.Router();

router.get('/apps/gallery/:location', function(req, res, next) {
    res.render(config.get('theme') + '/apps/gallery', {location: req.params.location});
});


//Workaround for slideViewer. To be deleted if no longer neccessary (TODO)
/*router.get('/slide-viewer', function(req, res, next) {
    res.render('slide-viewer/slideViewer');
});*/

module.exports = router;

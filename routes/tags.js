var express = require('express');
var config = require('config');

var appRoot = require('app-root-path');
var Catalog = require(appRoot + '/modules/catalogs');

var router = express.Router();

router.get('/tags', function(req, res, next) {
    res.send("hhh");
});

router.get('/api/tags', function(req, res, next) {
    var cat = new Catalog();
    cat.getTags(
        function(err){
            res.status(500);
        },
        {
            // parameters
        },
        function(tags){
            res.status(200).json({tags: tags});
        }
    );
});

router.post('/api/tags', function(req, res, next) {
    res.send("eafaafafafa");
});

module.exports = router;
var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Catalog = require(appRoot + '/modules/catalogs');
var debug = require('debug')('cm:route');
var router = express.Router();

/**
 * POST - insert a new tag
 * Access: admin
 */
router.post('/tags', function(req, res, next){
    if (req.user && req.user.roles != 'admin') {
        res.status(401).send('Unauthorized');
    }
    else {
        var catalog = new Catalog();
        catalog.addTag(
            function (err) {
                res.status(500).json({result:false, errors: err});
            },

            // parameters
            req.body,

            function (tag) {
                res.status(200).json({result:true, tag: tag});
            }
        );
    }
});

/**
 * return tags
 */
router.get('/tags', function(req, res, next) {
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

module.exports = router;
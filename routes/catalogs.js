var express = require('express');
var router = express.Router();

module.exports =
{
  doRoute : function doRoute(app){
    router.get('/catalogs/', function(req, res, next) {
      res.send('respond with a resource');
    });

    router.get('/api/catalogs/', function(req, res, next) {
      res.send('{}');
    });

    app.use('/', router);
  }
};
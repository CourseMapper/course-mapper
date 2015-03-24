var express = require('express');
var config = require('config');
var router = express.Router();

module.exports =
{
  doRoute : function doRoute(app){

    /* GET home page. */
    router.get('/', function(req, res, next) {
      res.render(config.get('theme') + '/index', { title: 'Express' });
    });

    app.use('/', router);
  }
};
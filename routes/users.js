var express = require('express');
var router = express.Router();

module.exports =
{
  doRoute : function doRoute(app){
    router.get('/users', function(req, res, next) {
      res.send('respond with a resource sss');
    });

    app.use('/', router);
  }
};
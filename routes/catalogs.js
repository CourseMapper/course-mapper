var express = require('express');
var router = express.Router();

router.get('/catalogs/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/api/catalogs/', function(req, res, next) {
  res.send('{}');
});

module.exports = router;
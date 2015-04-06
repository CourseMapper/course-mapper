var express = require('express');
var config = require('config');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(config.get('theme') + '/index');
});

/* GET static page. */
router.get('/static', function(req, res, next) {
  res.render(config.get('theme') + '/static');
});

module.exports = router;
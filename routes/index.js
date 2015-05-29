var express = require('express');
var config = require('config');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(config.get('theme') + '/index', {user: req.session.passport.user});
});

/* GET static page., there is ngview inside that will be handled by static.js route file */
router.get('/static', function(req, res, next) {
  res.render(config.get('theme') + '/static');
});

module.exports = router;
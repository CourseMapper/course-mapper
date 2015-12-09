var oauth2Controller = require('../../../modules/oauth2/oauth2.controller.js');
var express = require('express');
var router = express.Router();
var helper = require('../../../libs/core/generalLibs.js');

// Create endpoint handlers for oauth2 authorize
router.get('/authorize', helper.ensureAuthenticated, oauth2Controller.authorization);
router.post('/authorize', helper.ensureAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router.post('/token', helper.ensureAuthenticated, oauth2Controller.token);

module.exports = router;
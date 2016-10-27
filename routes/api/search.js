var express = require('express');
var router = express.Router();
var searchController = require('../../modules/search/search-controller');

router.get('/search', searchController.search);
router.get('/advanced-search', searchController.advancedSearch);
router.get('/relevant-search', searchController.relevantSearch);

module.exports = router;
var express = require('express');
var router = express.Router();
var favoritesController = require('../../modules/favorites/favorites-controller');

router.get('/favorites', favoritesController.getAll);
router.post('/favorites/:cid', favoritesController.add);

module.exports = router;
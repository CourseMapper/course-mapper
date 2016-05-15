var express = require('express');
var router = express.Router();
var favoritesController = require('../../modules/favorites/favorites-controller');

router.get('/favorites', favoritesController.getAll);
router.get('/favorites/:cid', favoritesController.getByCourseId);
router.post('/favorites/:cid', favoritesController.add);
router.delete('/favorites/:cid', favoritesController.remove);

module.exports = router;
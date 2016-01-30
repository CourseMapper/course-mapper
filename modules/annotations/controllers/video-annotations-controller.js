var VideoAnnotation = require('../models/video-annotation');
var async = require('asyncawait/async');
var await = require('asyncawait/await');


exports.getAnnotationsAsync = async(function (videoId) {
  var task = VideoAnnotation
    .find({video_id: videoId})
    .sort('start').exec();

  return await(task);
});


exports.findByIdAsync = function (id) {
  return VideoAnnotation.findById(id).exec()
};
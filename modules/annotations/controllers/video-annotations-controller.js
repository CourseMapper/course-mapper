var VideoAnnotation = require('../models/video-annotation');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var checkHasRightToModify = function (model, user) {
  if (!model || !user || !user.role) {
    return false;
  }
  var isAuthor = model.authorId === user._id;
  var isAdmin = user.role === 'admin';
  return isAuthor || isAdmin;
};

var findByVideoIdAsync = async(function (videoId) {
  return await(VideoAnnotation.find({video_id: videoId}).sort('start').exec());
});

var findByIdAsync = async(function (id) {
  return await(VideoAnnotation.findById(id).exec());
});

var addAsync = async(function (model, user) {
  model.author = user.username;
  model.authorId = user._id;
  model.authorDisplayName = user.displayName;

  return await(VideoAnnotation.create(model));
});

var updateAsync = async(function (model, user) {
  var annotation = await(findByIdAsync(model._id));
  if (!checkHasRightToModify(annotation, user)) {
    return;
  }
  // Set modifiable properties
  annotation.start = model.start;
  annotation.end = model.end;
  annotation.text = model.text;
  annotation.position = model.position;
  annotation.size = model.size;
  annotation.type = model.type;
  // Update model
  await(annotation.save());
  return annotation;
});

var removeAsync = async(function (annotationId, user) {
  var annotation = await(findByIdAsync(annotationId));
  if (!checkHasRightToModify(annotation, user)) {
    return;
  }
  await(annotation.remove());
  return annotation;
});

var addCommentAsync = async(function (params, user) {
  var annotationId = params.annotation_id;
  var commentText = params.text;

  // find annotation in db
  var annotation = await(findByIdAsync(annotationId));
  if (!annotation) {
    return;
  }

  var comment = {
    text: commentText,
    author: user.username || 'Unknown',
    authorId: user._id,
    authorDisplayName: user.displayName || user.username || 'Unknown'
  };

  annotation.comments.push(comment);

  // Save annotation
  await(annotation.save());

  return annotation;
});

var removeCommentAsync = async(function (params, user) {
  var annotationId = params.annotation_id;
  var commentId = params.comment_id;
  var annotation = await(findByIdAsync(annotationId));
  if (!annotation) {
    return;
  }
  for (var i = 0; i < annotation.comments.length; i++) {
    if (annotation.comments[i]._id.toString() === commentId) {
      var comment = annotation.comments[i];
      if (checkHasRightToModify(comment, user)) {
        annotation.comments[i].remove();
      }
      break;
    }
  }
  await(annotation.save());
  return annotation;
});

module.exports = {
  findByVideoIdAsync: findByVideoIdAsync,
  findByIdAsync: findByIdAsync,
  addAsync: addAsync,
  updateAsync: updateAsync,
  removeAsync: removeAsync,
  addCommentAsync: addCommentAsync,
  removeCommentAsync: removeCommentAsync
};

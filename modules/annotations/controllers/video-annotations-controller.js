var VideoAnnotation = require('../models/video-annotation');
var async = require('asyncawait/async');
var await = require('asyncawait/await');


var findByVideoIdAsync = async(function (videoId) {
  var task = VideoAnnotation
    .find({video_id: videoId})
    .sort('start').exec();

  return await(task);
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

var checkHasModificationRights = function (annotation, user) {
  var isAuthor = annotation.author === user.username;
  var isAdmin = user.role === 'admin';
  return isAuthor || isAdmin;
};

var updateAsync = async(function (model, user) {
  var annotation = await(findByIdAsync(model._id));
  if (!annotation) {
    return;
  }
  // Do not allow other users, except
  // the author an admin to modify the annotation
  if (!checkHasModificationRights(annotation, user)) {
    return;
  }

  // Set modifiable properties
  annotation.start = model.start;
  annotation.end = model.end;
  annotation.text = model.text;
  annotation.position = model.position;
  annotation.size = model.size;
  annotation.type = model.type;

  return await(annotation.save());
});

var removeAsync = async(function (annotationId) {
  var annotation = await(findByIdAsync(annotationId));
  if (!annotation) {
    return;
  }

  await(annotation.remove());
  // return the removed annotations
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

  return true;
});

var removeCommentAsync = async(function (params, user) {

  var annotationId = params.annotation_id;
  var commentId = params.comment_id;

  var annotation = await(VAController.findByIdAsync(annotationId));
  if (!annotation) {
    return;
  }

  var isAdmin = user.role === 'admin';

  for (var i = 0; i < annotation.comments.length; i++) {
    if (annotation.comments[i]._id.toString() === commentId) {
      var isAuthor = annotation.comments[i].author === user.username;
      if (isAuthor || isAdmin) {
        //console.log('removing comment', commentId);
        annotation.comments[i].remove();
        break;
      }
    }
  }

  // Save annotation
  await(annotation.save());

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

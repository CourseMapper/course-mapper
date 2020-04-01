'use strict';

var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  date_created: { type: Date },
  date_removed: { type: Date },
  date_modified: { type: Date },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  authorDisplayName: { type: String, required: true },
  text: { type: String, required: true }
}, {
  usePushEach: true
});

CommentSchema.pre('save', function (next) {
  var now = Date.now();
  if (!this.date_created) {
    this.date_created = now;
  }
  this.date_modified = now;
  next();
});

CommentSchema.pre('update', function (next) {
  this.date_modified = Date.now();
  next();
});

var VideoAnnotationSchema = new mongoose.Schema({
  video_id: { type: String, required: true },
  date_created: { type: Date },
  date_modified: { type: Date },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  authorDisplayName: { type: String },
  text: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  type: { type: String, enum: ['embedded-note', 'note'], required: true },
  position: {
    top: { type: String },
    left: { type: String }
  },
  size: {
    width: { type: String },
    height: { type: String }
  },
  comments: [CommentSchema],
  isPrivate: { type: Boolean }
}, {
  usePushEach: true
});

// Define indexes
// VideoAnnotationSchema.index(
//     { 'text': 'text' }, {
//       'text': 'best_match_name',
//       weights: { 'text': 1 }
//     });
VideoAnnotationSchema.index({ 'text': 'text' });

VideoAnnotationSchema.pre('save', function (next) {
  var now = Date.now();
  if (!this.date_created) {
    this.date_created = now;
  }
  this.date_modified = now;
  next();
});

VideoAnnotationSchema.pre('update', function (next) {
  this.date_modified = Date.now();
  next();
});

var AnnotationsVideo = mongoose.model('VideoAnnotation', VideoAnnotationSchema);

AnnotationsVideo.ensureIndexes();
// AnnotationsVideo.on('index', function(err){
//   console.log("AnnotationsVideo: " + err);
// });

module.exports = AnnotationsVideo;
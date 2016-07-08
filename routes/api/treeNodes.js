var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Tree = require(appRoot + '/modules/trees/index.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var socketIoHelper = require(appRoot + '/libs/core/socketIoHelper.js');
var moment = require('moment');
var mongoose = require('mongoose');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var _ = require('underscore');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');
var router = express.Router();

/**
 * get all tree nodes based on course id
 */
router.get('/treeNodes/course/:courseId', helper.l2pAuth, helper.ensureAuthenticated,
  function (req, res, next) {

    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }

    var courseId = mongoose.Types.ObjectId(req.params.courseId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    userHelper.isEnrolledAsync({userId: userId, courseId: courseId})
      .then(function (isAllowd) {

        if (!isAllowd)
          return helper.resReturn(helper.createError401(), res);

        var tr = new Tree();

        var params = {
          query: {courseId: courseId},
          user: req.user
        };
        tr.getTreeNodes(function (err) {
            helper.resReturn(err, res);
          }, params, function (treeNodes) {
            res.status(200).json({result: true, treeNodes: treeNodes});
          }
        );
      })
      .catch(function (err) {
        helper.resReturn(err, res);
      });
  });

/**
 * get all tree nodes underneath a node id
 */
router.get('/treeNode/:nodeId', helper.l2pAuth, helper.ensureAuthenticated,
  function (req, res, next) {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }

    var tr = new Tree();

    tr.getTreeNode(
      function (err) {
        helper.resReturn(err, res);
      },
      {
        _id: mongoose.Types.ObjectId(req.params.nodeId),
        isDeleted: false
      },
      function (treeNode) {
        if (treeNode)
          res.status(200).json({result: true, treeNode: treeNode});
        else
          helper.resReturn(helper.createError404('Content Node'), res);
      }
    );
  });

/**
 * POST
 * create node, and allow upload
 * edit node, because multipart form data can use POST
 */
router.post('/treeNodes', multipartyMiddleware, function (req, res, next) {
  // check for user logins
  if (!req.user) {
    res.status(401).send('Unauthorized');
    return;
  }

  req.body.userId = req.user._id;
  req.body.createdBy = mongoose.Types.ObjectId(req.body.userId);
  req.body.courseId = mongoose.Types.ObjectId(req.body.courseId);

  if (req.body._id)
    req.body._id = mongoose.Types.ObjectId(req.body._id);

  if (req.body.parent)
    req.body.parent = mongoose.Types.ObjectId(req.body.parent);

  userHelper.isEnrolledAsync({userId: req.body.createdBy, courseId: req.body.courseId})
    .then(function (isAllowd) {
      if (!isAllowd)
        return helper.resReturn(helper.createError401(), res);

      var tr = new Tree();

      tr.addTreeNode(
        function (err) {
          helper.resReturn(err, res);
        },

        // parameters
        req.body,

        // files pdf and video
        req.files,

        function (tn) {
          res.status(200).json({
            result: true,
            treeNode: tn
          });
          tn = tn.toObject();
          tn.nodeId = tn._id;
          tn.userId = req.user._id;
          if (req.body._id) {
            socketIoHelper.io.to('map/' + tn.courseId).emit('nodeUpdated', tn);
          }
          else
            socketIoHelper.io.to('map/' + tn.courseId).emit('nodeCreated', tn);
        }
      );
    })
    .catch(function (err) {
      helper.resReturn(err, res);
    });
});

/**
 * GET to let the server know that the user is interacting with videoPlayer
 */
router.put('/treeNodes/watch/:courseId/:nodeId/:resourceId', helper.l2pAuth, helper.ensureAuthenticated,
  function (req, res, next) {
    if (!req.user)
      return res.status(401).send('Unauthorized');

    var cid, nid, rid, uid;
    try {
      cid = mongoose.Types.ObjectId(req.params.courseId);
      nid = mongoose.Types.ObjectId(req.params.nodeId);
      rid = mongoose.Types.ObjectId(req.params.resourceId);
      uid = mongoose.Types.ObjectId(req.user._id);
    } catch (err) {
      helper.resReturn("Ids needs to be an object id", res);
      return;
    }

    var params = {
      courseId: cid,
      nodeId: nid,
      resourceId: rid,
      userId: uid
    };

    params = _.extend(params, req.body);

    Plugin.doAction('onVideoUpdateState', params);

    res.status(200).json({
      result: true
    });
  });

/**
 * update node.positionFromRoot value
 */
router.put('/treeNodes/:nodeId/positionFromRoot', helper.l2pAuth, helper.ensureAuthenticated,
  function (req, res, next) {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }

    var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    var tr = new Tree();
    tr.isNodeAuthorized({nodeId: nodeId, userId: userId})
      .then(function (isAllwd) {
        if (!isAllwd)
          return helper.resReturn(helper.createError401(), res);

        tr.updateNodePosition(
          function (err) {
            helper.resReturn(err, res);
          },
          {
            _id: nodeId
          }
          ,
          {
            x: req.body.x,
            y: req.body.y
          },
          function (tn, updPos) {
            updPos.nodeId = tn._id;
            updPos.userId = req.user._id;
            socketIoHelper.io.to('map/' + tn.courseId).emit('positionUpdated', updPos);

            res.status(200).json({treeNode: tn});
          }
        );
      })
      .catch(function (err) {
        helper.resReturn(err, res);
      });
  });

/**
 * update node name and privacy value
 */
router.put('/treeNodes/:nodeId', helper.l2pAuth, helper.ensureAuthenticated,
  function (req, res, next) {

    // check for user rights
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }

    var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    var tr = new Tree();
    tr.isNodeAuthorized({nodeId: nodeId, userId: userId})
      .then(function (isAllwd) {
        if (!isAllwd)
          return helper.resReturn(helper.createError401(), res);

        tr.updateNode(
          function (err) {
            helper.resReturn(err, res);
          },
          {
            _id: nodeId
          },
          req.body,
          req.user,
          function (tn) {
            res.status(200).json({result: ((tn) ? true : false), treeNode: tn});
            tn = tn.toObject();
            tn.nodeId = tn._id;
            tn.userId = req.user._id;
            socketIoHelper.io.to('map/' + tn.courseId).emit('nodeUpdated', tn);
          }
        );
      })
      .catch(function (err) {
        helper.resReturn(err, res);
      });
  });

/**
 * delete a node (setting isDeleted to true)
 */
router.delete('/treeNodes/:nodeId', helper.l2pAuth, helper.ensureAuthenticated,
  function (req, res, next) {
    // check for user rights
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }

    var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    var tr = new Tree();
    tr.isNodeAuthorized({nodeId: nodeId, userId: userId})
      .then(function (isAllwd) {
        if (!isAllwd)
          return helper.resReturn(helper.createError401(), res);

        tr.deleteNode(
          function (err) {
            helper.resReturn(err, res);
          },
          {
            _id: nodeId
          },
          req.user
          ,
          function (tn) {
            res.status(200).json({result: ((tn) ? true : false), treeNode: tn});
            if (!tn.isDeletedForever) {
              tn = tn.toObject();
            }

            tn.nodeId = nodeId;
            tn.userId = req.user._id;
            socketIoHelper.io.to('map/' + tn.courseId).emit('nodeDeleted', tn);
          }
        );
      })
      .catch(function (err) {
        helper.resReturn(err, res);
      });
  });

/**
 * update node visibility
 */
router.put('/visibility/:nodeId/:isHidden', helper.l2pAuth, helper.ensureAuthenticated,
  function (req, res, next) {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }

    var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
    var userId = mongoose.Types.ObjectId(req.user._id);
    var isHidden = req.params.isHidden;

    var tree = new Tree();
    tree.toggleNodeVisibilityAsync(userId, nodeId, isHidden)
      .then(function (data) {
        res.status(204).send();
      })
      .catch(function (err) {
        helper.resReturn(err, res);
      })
  });

module.exports = router;
var config = require('config');
var mongoose = require('mongoose');
var TreeNodes = require('./treeNodes.js');
var Resources = require('./resources.js');
var NodeVisibility = require('./node-visibility');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:db');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');
var _ = require('underscore');

function catalog() {
}

/**
 *
 * @param filetype array of string
 * @param file file object of multiparty
 * @param contentNode treeNode
 * @param createdBy objectId of a user
 * @param courseId objectId of a course
 */
catalog.prototype.saveResourceFile = function (filetype, file, contentNode, createdBy, courseId) {
  var extension = file.name.split('.');
  extension = extension[extension.length - 1].toLowerCase();

  if (filetype.indexOf(extension) < 0) {
    // extension not right
    error("File extension not right, expecting " + filetype);
  }
  else {
    var fn = '/resources/' + contentNode.id + '.' + extension;
    var dest = appRoot + '/public' + fn;
    handleUpload(file, dest, true);

    var Res = new Resources({
      type: extension,
      createdBy: createdBy,
      link: fn,
      courseId: courseId,
      treeNodeId: contentNode._id
    });

    Res.save(function () {
      TreeNodes.update({ _id: contentNode._id }, {
        $addToSet: {
          resources: Res._id
        }
      },
        function () {
        });
    });
  }
};

catalog.prototype.addTreeNode = function (error, params, files, success) {
  var self = this;
  // check for at least 1 resource either it s a pdf or a video
  if (params.type == 'contentNode' && !params._id) {
    if (!files.file && !params.pdfHostLink && !params.videoHostLink) {
      error(helper.createError('need at least 1 resource', 400));
      return;
    }
  }
  if (files && files.file && files.file.constructor != Array) {
    // make it an array if it s just 1 object. (we allow multiple upload on some types of node)
    var be = [files.file];
    files.file = be;
  }
  if (!helper.checkRequiredParams(params, ['userId', 'createdBy'], function (errs) {
    error(errs)
  })) {
    return;
  }
  //options for new node
  var node = {
    type: params.type,
    name: params.name,
    createdBy: params.createdBy,
    courseId: params.courseId,
    isPrivate: params.isPrivate
  };

  if (params.parent)
    node.parent = params.parent;

  var insertNodeToParentAsync = async(function (tn) {
    if (tn.parent) {
      var parentNode = await(TreeNodes.findOne({ _id: tn.parent }).exec());
      if (parentNode) {
        parentNode.childrens.push(tn._id);
        await(parentNode.save());
        // because we have a parent, lets alter its position, relative to its parent
        tn.positionFromRoot = {
          x: parentNode.positionFromRoot.x + generateRandomPos(),
          y: parentNode.positionFromRoot.y + generateRandomPos()
        };

        await(tn.save());
        return true;
      }
    }

    return false;
  });

  var attachLinkToNodeAsync = async(function (contentNode, type, url) {
    var Res = new Resources({
      type: type,
      createdBy: contentNode.createdBy,
      link: url,
      courseId: contentNode.courseId,
      treeNodeId: contentNode._id
    });

    await(Res.save());

    var upd = await(
      TreeNodes.update({ _id: contentNode._id }, {
        $addToSet: {
          resources: Res._id
        }
      }));

    return upd;
  });

  function attachResourcesToNode(tn, files, self) {
    if (files) {
      for (var i in files.file) {
        var f = files.file[i];
        self.saveResourceFile(
          ['pdf', 'mp4', 'webm'], f,
          tn,
          tn.createdBy,
          tn.courseId
        );
      }
    }

    debug('success attaching files');
  }

  function generateRandomPos() {
    return Math.floor((Math.random() * 110) + 50);
  }

  // this is edit mode
  if (params._id) {
    node._id = params._id;
    var op = async(function () {
      var tn = await(TreeNodes.findOne({ _id: node._id }).populate('parent').exec()
      );

      // // Don't allow publishing nodes, which parent is private.
      // if (params.isPrivate == 'false' && (tn.parent.isPrivate === true)) {
      //   error(helper.createError('Cannot publish node. Parent node is private.'));
      //   return;
      // }

      if (tn) {
        tn.name = node.name;
        tn.isPrivate = node.isPrivate;
        if (params.pdfHostLink) {
          await(attachLinkToNodeAsync(tn, 'pdf', params.pdfHostLink));
        }

        if (params.videoHostLink) {
          await(attachLinkToNodeAsync(tn, 'video', params.videoHostLink));
        }

        await(attachResourcesToNode(tn, files, self));

        await(tn.save());

        var newNode = await(TreeNodes.findOne({ _id: node._id })
          .populate('resources')
          .exec());

        return newNode;
      } else {
        // 404 cant find node
        error(helper.createError404('Content Node'));
      }
    });

    op()
      .then(function (tn) {
        success(tn);

        if (params.type == 'contentNode') {
          Plugin.doAction('onAfterContentNodeEdited', tn, params);
        }

      })
      .catch(function (err) {
        error(err);
      });
  }
  else {
    ///
    // saving new node
    ///
    node.positionFromRoot = { x: generateRandomPos(), y: generateRandomPos() };

    var op = async(function () {
      var tn = new TreeNodes(node);
      await(tn.save());

      if (params.pdfHostLink)
        await(attachLinkToNodeAsync(tn, 'pdf', params.pdfHostLink));

      if (params.videoHostLink)
        await(attachLinkToNodeAsync(tn, 'video', params.videoHostLink));

      // process files
      await(attachResourcesToNode(tn, files, self));

      // put this object as the parent's child,
      await(insertNodeToParentAsync(tn));

      await(tn.save());

      return tn;
    });

    op()
      .then(function (tn) {
        if (params.type == 'contentNode') {
          Plugin.doAction('onAfterContentNodeCreated', tn);
        } else {
          Plugin.doAction('onAfterSubTopicCreated', tn);
        }

        debug('success creating node');

        TreeNodes.findById(tn._id)
          .populate('resources')
          .populate('createdBy', '_id displayName username')
          .exec(function (err, doc) {
            if (doc)
              success(doc);
            else
              error(err);
          });
      })
      .catch(function (err) {
        debug('failed adding Tree Node');
        error(err);
      });

  }
};

catalog.prototype.getTreeNode = function (error, params, success) {
  TreeNodes.findOne(params).populate('resources').exec(function (err, doc) {
    if (err) {
      error(err);
    }
    else {
      if (doc) {
        if (doc.isDeleted) {
          doc.name = "[DELETED]";
        }

        success(doc);
      } else {
        error(helper.createError404("Tree Node"));
      }
    }
  });
};

catalog.prototype.getNodeAsync = function () {
  return async(function (params) {
    var nod = await(TreeNodes.findOne(params)
      .populate('createdBy', '_id username displayName')
      .populate('courseId')
      .exec()
    );

    return nod;
  });
};

catalog.prototype.toggleNodeVisibilityAsync = function (userId, nodeId, isHidden) {
  return NodeVisibility.update({ user: userId, node: nodeId }, {
    user: userId,
    node: nodeId,
    isHidden: isHidden
  },
    { upsert: true })
    .execAsync();
};

/**
 * get all tree nodes based on params,
 * and return it in a recursived tree manners
 * @param error
 * @param params
 * @param success
 */
catalog.prototype.getTreeNodes = function (error, params, success) {

  var user = params.user;
  var isAdmin = user.role === 'admin';

  var checkAccess = function (node) {
    var isOwner = node.createdBy._id == user._id;
    // Filter private nodes
    return (node.isPrivate !== true || isOwner || isAdmin);
  };

  var getUserHiddenNodeIdsAsync = function (nodes) {
    var allIds = _(nodes).map(function (c) {
      return c._id;
    });

    var nodeVisibilities = await(NodeVisibility.find({ user: user._id }).where('node').in(allIds).exec());

    return nodeVisibilities
      .filter(function (vis) {
        return vis.isHidden;
      })
      .map(function (vis) {
        return vis.node.toString();
      });
  };

  TreeNodes.find(params.query)
    .populate('resources')
    .populate('createdBy', 'displayName _id')
    .exec(async(function (err, docs) {
      if (err) {
        return error(err);
      }
      var cats = helper.convertToDictionary(docs);

      // keys for the ref ids of parent and childrens
      var parent = 'parent';
      var children = 'childrens';
      var tree = [];

      function again(cat) {
        if (cat[children]) {
          var childrens = [];
          for (var e in cat[children]) {
            var catId = cat[children][e];
            var childCat = cats[catId];

            // Filter private nodes
            if (checkAccess(childCat)) {
              childrens.push(childCat);
              again(childCat);
            }
          }
          cat[children] = childrens;
        }
      }

      var userHiddenNodeIds = await(getUserHiddenNodeIdsAsync(cats));

      for (var i in cats) {
        // get the root
        var doc = cats[i];

        // Check if the node is hidden by the user
        doc.isHidden = userHiddenNodeIds.indexOf(doc._id.toString()) > -1;

        if (doc.isDeleted) {
          doc.name = "[DELETED]";
        }
        if (!doc[parent]) {
          again(doc);
          tree.push(doc);
        }
      }
      success(tree);
    })
    );
};

catalog.prototype.updateNodePosition = function (error, paramsWhere, paramsUpdate, success) {
  if (!helper.checkRequiredParams(paramsUpdate, ['x', 'y'], error)) {
    return;
  }

  TreeNodes.findOne(paramsWhere).exec(function (err, tn) {
    if (err) error(err);
    else {
      if (!tn) {
        return error(helper.createError404('Node'));
      }

      var updPos = {
        x: parseInt(paramsUpdate.x),
        y: parseInt(paramsUpdate.y)
      };

      tn.update({
        $set: {
          positionFromRoot: updPos
        }
      }, function (err) {
        if (err) {
          debug('failed update node position');
          error(err);
        }
        else {
          // success saved the node pos
          success(tn, updPos);
          Plugin.doAction('onAfterNodePositionEdited', tn);
        }
      });
    }
  });
};

catalog.prototype.updateNode = function (error, paramsWhere, paramsUpdate, user, success) {
  TreeNodes.findById(paramsWhere)
    .populate('parent')
    .exec(function (err, tn) {
      if (err) {
        return error(err);
      }
      if (!tn) {
        return error(helper.createError404("Node"));
      }

      // // Don't allow publishing nodes, which parent is private.
      // var isParentPrivate = paramsUpdate.isPrivate == 'false' && (tn.parent && tn.parent.isPrivate === true);
      // if (isParentPrivate) {
      //   return error(helper.createError('Cannot publish node. Parent node is private.'));
      // }
      //
      // // If node is set to private, update all children to private too
      // if (paramsUpdate.isPrivate == 'true') {
      //   // TreeNodes.findAsync({courseId: tn.courseId, isDeleted: false})
      //   //   .then(function (nodes) {
      //   //
      //   //   })
      // }

      _.extend(tn, paramsUpdate);

      tn.save(function (err) {
        if (err) {
          debug('failed update node content');
          return error(err);
        }
        success(tn);
        Plugin.doAction('onAfterSubTopicEdited', tn, user);
      });
    });
};

catalog.prototype.deleteNode = function (error, params, user, success) {
  TreeNodes.findById(params).exec(function (err, tn) {
    if (err) error(err);
    else {
      if (!tn) {
        return error(helper.createError404("Node"));
      }

      if (tn.isDeleted) {
        if (tn.childrens.length == 0) {
          // find parent,
          // remove this tn from parent's children subdocs
          TreeNodes.findOneAndUpdate({ _id: tn.parent }, { $pull: { childrens: tn._id } },
            function (err, data) {
            });

          var tempTn = tn.toObject();
          tempTn.isDeletedForever = true;

          // is already deleted, means we want to remove it forever
          tn.remove(function () {
            success(tempTn)
          });
        } else {
          error(helper.createError('Cannot delete node with childrens'));
        }

        Resources.update({
          treeNodeId: tn._id
        },
          {
            $set: { isDeleted: true }
          },
          {
            multi: true
          }).exec();

      } else {
        tn.isDeleted = true;
        tn.dateDeleted = new Date();
        tn.save(
          function (err) {
            if (err) {
              debug('failed delete node');
              error(err);
            }
            else {
              Resources.update({
                treeNodeId: tn._id
              },
                {
                  $set: { isDeleted: true }
                },
                {
                  multi: true
                }
              ).exec();

              success(tn);
              Plugin.doAction('onAfterNodeDeleted', tn, user);
            }
          }
        );
      }
    }
  });
};

/**
 * check is this user a post owner
 * @param params {userId: objectId, postId: objectId}
 */
catalog.prototype.isNodeOwner = async(function (params) {
  var po = await(TreeNodes.findOne({
    _id: params.nodeId,
    createdBy: params.userId
  }).exec());

  if (po)
    return true;

  return false;
});

/**
 * check for permission, manager, admin, post owner
 * @param params {userId: objectId, nodeId: objectId}
 */
catalog.prototype.isNodeAuthorized = async(function (params) {
  // check for admin and manager and crs owner or post owner
  var isAllowd = await(this.isNodeOwner(params));
  if (isAllowd) return true;

  var sNode = await(TreeNodes.findById(params.nodeId).exec());
  if (sNode) {
    params.courseId = sNode.courseId;
    isAllowd = await(userHelper.isCourseAuthorizedAsync(params));
    if (isAllowd) return true;
  }

  return false;
});

module.exports = catalog;
var config = require('config');
var mongoose = require('mongoose');
var TreeNodes = require('./treeNodes.js');
var Resources = require('./resources.js');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:db');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

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
            TreeNodes.update({_id: contentNode._id}, {
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
        courseId: params.courseId
    };

    if (params.parent)
        node.parent = params.parent;

    function insertNodeToParent(node, tn, success) {
        if (node.parent) {
            TreeNodes.findOne({_id: node.parent}, function (err, doc) {
                if (doc) {
                    doc.childrens.push(tn._id);
                    doc.save();
                    debug('success saving this node as children');

                    // because we have a parent, lets alter its position, relative to its parent
                    tn.positionFromRoot = {
                        x: doc.positionFromRoot.x + 40,
                        y: doc.positionFromRoot.y + 80
                    };

                    tn.save();
                    debug('success altering starting position to its parent');

                    success(tn);
                }
            });
        } else {
            success(tn);
        }
    }

    function attachLinkToNode(contentNode, type, url) {
        var Res = new Resources({
            type: type,
            createdBy: contentNode.createdBy,
            link: url,
            courseId: contentNode.courseId,
            treeNodeId: contentNode._id
        });

        Res.save(function () {
            TreeNodes.update({_id: contentNode._id}, {
                    $addToSet: {
                        resources: Res._id
                    }
                },
                function () {
                });
        });
    }

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

    function cbAfterSave(tn, files, self, node, params, success) {
        if (params.pdfHostLink) {
            attachLinkToNode(tn, 'pdf', params.pdfHostLink);
        }

        if (params.videoHostLink) {
            attachLinkToNode(tn, 'video', params.videoHostLink);
        }

        // process files
        attachResourcesToNode(tn, files, self);

        // put this object as the parent's child,
        insertNodeToParent(node, tn, success);

        if (params.type == 'contentNode') {
            Plugin.doAction('onAfterContentNodeCreated', tn);
        } else {
            Plugin.doAction('onAfterSubTopicCreated', tn);
        }

        debug('success creating node');
    }

    // this is edit mode
    if (params._id) {
        node._id = params._id;
        TreeNodes.findOne({_id: node._id, createdBy: params.createdBy}, function (err, tn) {
            if (err) {
                error(err);
            } else {
                if (tn) {
                    tn.name = node.name;
                    tn.save(function (err) {
                        if (err) {
                            debug('failed adding Tree Node');
                            error(err);
                        } else {
                            if (params.pdfHostLink) {
                                attachLinkToNode(tn, 'pdf', params.pdfHostLink);
                            }

                            if (params.videoHostLink) {
                                attachLinkToNode(tn, 'video', params.videoHostLink);
                            }

                            attachResourcesToNode(tn, files, self);

                            success(tn);

                            if (params.type == 'contentNode') {
                                Plugin.doAction('onAfterContentNodeEdited', tn);
                            } else {
                                Plugin.doAction('onAfterSubTopicEdited', tn);
                            }
                        }
                    });
                } else {
                    // 404 cant find node
                    error(helper.createError404('Content Node'));
                }
            }
        });
    }
    else {
        ///
        // saving new node
        ///
        node.positionFromRoot = {x: 40, y: 60};

        var tn = new TreeNodes(node);
        tn.save(function (err) {
            if (err) {
                debug('failed adding Tree Node');
                error(err);
            } else {
                cbAfterSave(tn, files, self, node, params, success);
            }
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

/**
 * get all tree nodes based on params,
 * and return it in a recursived tree manners
 * @param error
 * @param params
 * @param success
 */
catalog.prototype.getTreeNodes = function (error, params, success) {
    TreeNodes.find(params).populate('resources').exec(function (err, docs) {
        if (!err) {
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
                        childrens.push(childCat);
                        again(childCat);
                    }

                    cat[children] = childrens;
                }
            }

            for (var i in cats) {
                // get the root
                var doc = cats[i];

                if (doc.isDeleted) {
                    doc.name = "[DELETED]";
                }

                if (!doc[parent]) {
                    again(doc);
                    tree.push(doc);
                }
            }

            success(tree);
        } else {
            error(err);
        }
    });
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

            tn.update({
                $set: {
                    positionFromRoot: {
                        x: paramsUpdate.x,
                        y: paramsUpdate.y
                    }
                }
            }, function (err) {
                if (err) {
                    debug('failed update node position');
                    error(err);
                }
                else
                // success saved the cat
                    success(tn);
            });
        }
    });
};

catalog.prototype.updateNode = function (error, paramsWhere, paramsUpdate, success) {
    TreeNodes.findById(paramsWhere).exec(function (err, tn) {
        if (err) error(err);
        else {
            if (!tn)
                error(helper.createError404("Node"));
            else {
                if (paramsUpdate['name']) {
                    tn.name = paramsUpdate['name'];
                }

                tn.save(function (err) {
                    if (err) {
                        debug('failed update node content');
                        error(err);
                    }
                    else {
                        // success saved the cat
                        success(tn);
                    }
                });
            }
        }
    });
};

catalog.prototype.deleteNode = function (error, params, success) {
    TreeNodes.findById(params).exec(function (err, tn) {
        if (err) error(err);
        else {
            if (!tn) {
                return error(helper.createError404("Node"));
            }

            if (tn.isDeleted) {
                if(tn.childrens.length == 0){
                    // find parent,
                    // remove this tn from parent's children subdocs
                    TreeNodes.findOneAndUpdate({_id: tn.parent}, {$pull: {childrens: tn._id}},
                        function (err, data) {
                        });

                    // is already deleted, means we want to remove it forever
                    tn.remove(function () {
                        success(true)
                    });
                } else {
                    error(helper.createError('Cannot delete node with childrens'));
                }

            } else {
                tn.isDeleted = true;
                tn.dateDeleted = new Date();
                tn.save(
                    function (err) {
                        if (err) {
                            debug('failed update node position');
                            error(err);
                        }
                        else {
                            success(true);
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
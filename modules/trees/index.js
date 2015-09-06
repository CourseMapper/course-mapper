var config = require('config');
var mongoose = require('mongoose');
var TreeNodes = require('./treeNodes.js');
var Resources = require('./resources.js');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:db');

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

    //options for new node
    var node = {
        positionFromRoot: {x: 40, y: 60},
        type: params.type,
        name: params.name
    };

    // check for at least 1 resource either it s a pdf or a video
    if (params.type == 'contentNode') {
        if (!files.file) {
            error(new Error('need at least 1 resource'));
            return;
        } else if (files.file.constructor != Array) {
            // make it an array if it s just 1 object. (we allow multiple upload on some types of node)
            var be = [files.file];
            files.file = be;
        }
    }

    if (!helper.checkRequiredParams(params, ['userId', 'courseId'], function (errs) {
            error(errs)
        })) {
        return;
    }

    node.createdBy = mongoose.Types.ObjectId(params.userId);
    node.courseId = mongoose.Types.ObjectId(params.courseId);

    if (params.parent)
        node.parent = mongoose.Types.ObjectId(params.parent);

    var tn = new TreeNodes(node);

    tn.save(
        function (err) {
            if (err) {
                debug('failed adding Tree Node');
                error(err);
            } else {
                if (files) {
                    for (var i in files.file) {
                        var f = files.file[i];
                        self.saveResourceFile(
                            ['pdf', 'mp4', 'webm'], f,
                            tn,
                            node.createdBy,
                            node.courseId
                        );
                    }
                }

                if (params.type == 'contentNode') {
                    Plugin.doAction('onAfterContentNodeCreated', tn);
                } else {
                    Plugin.doAction('onAfterSubTopicCreated', tn);
                }

                debug('success added node');

                // put this object as the parent's child,
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
        });
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
            if (!tn)
                error(helper.createError404("Node"));

            else {
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

module.exports = catalog;
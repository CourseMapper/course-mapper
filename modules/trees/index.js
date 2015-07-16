var config = require('config');
var mongoose = require('mongoose');
var TreeNodes = require('./treeNodes.js');
var Resources = require('./resources.js');
var debug = require('debug')('cm:db');

function catalog(){
}

function convertToDictionary(documents){
    var ret = {};
    for(var i in documents){
        var doc = documents[i];
        ret[doc._id] = doc.toObject({ getters: true, virtuals: false });
    }

    return ret;
}

catalog.prototype.addTreeNode = function(error, params, success){
    var node = {
        positionFromRoot: {x:40, y:60},
        type: params.type,
        name: params.name
    };

    node.createdBy = mongoose.Types.ObjectId(params.userId);
    node.courseId = mongoose.Types.ObjectId(params.courseId);

    if(params.parent)
        node.parent = mongoose.Types.ObjectId(params.parent);

    var tn = new TreeNodes(node);

    tn.save(
        function (err) {
            if (err) {
                debug('failed adding Tree Node');
                error(err);
            } else {
                // put this object as the parent's child, --its oke that client dont need to wait for this.
                if(node.parent) {
                    TreeNodes.findOne({_id : node.parent}, function(err, doc){
                        if(doc){
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
                    debug('success added node');
                    success(tn);
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
catalog.prototype.getTreeNodes = function(error, params, success){
    TreeNodes.find(params, function(err, docs){
        if (!err){
            var cats = convertToDictionary(docs);

            // keys for the ref ids of parent and childrens
            var parent = 'parent';
            var children = 'childrens';

            var tree = [];

            function again(cat){
                if(cat[children]){
                    var childrens = [];
                    for(var e in cat[children]){
                        var catId = cat[children][e];
                        var childCat = cats[catId];
                        childrens.push(childCat);
                        again(childCat);
                    }

                    cat[children] = childrens;
                }
            }

            for(var i in cats){
                // get the root
                var doc = cats[i];
                if(!doc[parent]){
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

catalog.prototype.updateNodePosition = function(error, paramsWhere, paramsUpdate, success){
    TreeNodes.findOne(paramsWhere).exec(function(err, tn){
        if(err) error(err);
        else
            tn.update({
                $set: {
                    positionFromRoot: {
                        x: paramsUpdate.x,
                        y: paramsUpdate.y
                    }
                }
            }, function(err){
                if (err) {
                    debug('failed update node position');
                    error(err);
                }
                else
                // success saved the cat
                    success(tn);
            });
    });
};

module.exports = catalog;
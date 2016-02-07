var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var TN = require(appRoot + '/modules/trees/treeNodes.js');
var Links = require(appRoot + '/modules/links/models/links.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function AStat(){
}

AStat.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.nodeId);
    //console.log(this._id)
};

AStat.prototype.run = async ( function(){
    var self = this;

    var result = await( TN.findOne({
        _id: self._id
    }).exec());

    var arrResources = result.resources;
    var contentId = result._id

    var totalLinks = await(Links.find({
        contentNode: contentId
    }).count().exec());
    //var arrResourcesLength = arrResources.length;

    /*for (var i=0; i < arrResourcesLength; i++) {


    }*/

    //self.result = result;
    self.test = arrResources;
    self.tl = totalLinks;
} );


AStat.prototype.render = function(){
    return  '<div class="icon-stat" style="text-align: center">' +
                '<div class="badge bg-light-blue" style="text-align: center"><i class="fa fa-pencil-square" style="font-size: 12px"></i> '+ '-' +'</div> '+
                '<div class="badge bg-light-blue" style="text-align: center"><i class="fa fa-link" style="font-size: 12px"></i> '+ this.tl +'</div> ' +
            '</div>';
};

module.exports = AStat;
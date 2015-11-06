var appRoot = require('app-root-path');
//var mongoose = require('mongoose');
var Categories = require(appRoot + '/modules/catalogs/categories.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CatCountSubNodes(){
}

CatCountSubNodes.prototype.init = function(params){
    this.slug = params.slug;
};

CatCountSubNodes.prototype.run = async ( function(){
    var self = this;

    var result = await( Categories.findOne({
        slug: self.slug
    }).exec());

    self.result = result;
} );


CatCountSubNodes.prototype.render = function(){
    var countSubNodes = this.result.subCategories.length;


    return '<div class="countSubNodes" style="font-size:80%"> SubNodes: ' + countSubNodes + '</div>' ;
};

module.exports = CatCountSubNodes;

var appRoot = require('app-root-path');
//var mongoose = require('mongoose');
var moment = require ('moment');
var Categories = require(appRoot + '/modules/catalogs/categories.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CatCreatedDate(){
}

CatCreatedDate.prototype.init = function(params){
    this.slug = params.slug;
};

CatCreatedDate.prototype.run = async ( function(){
    var self = this;

    var result = await( Categories.findOne({
        slug: self.slug
    }).exec());

    self.result = result;
} );


CatCreatedDate.prototype.render = function(){

    var momentDate = moment(this.result.dateAdded).format('MMMM Do YYYY');


    return '<div class="dateCreated" style="font-size:80%"> <span class="badge bg-green"> Created: ' + momentDate + '</span></div>' ;
};

module.exports = CatCreatedDate;

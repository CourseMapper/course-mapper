var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CatRating(){
}

CatRating.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.nodeId);
};

CatRating.prototype.run = async ( function(){
    var self = this;
    self.result = '';
} );

CatRating.prototype.render = function(){
    return '<div class="cat-home-rating">' +
        'Rating : <i class="fa fa-star"></i>' +
        '<i class="fa fa-star"></i>' +
        '<i class="fa fa-star"></i>' +
        '<i class="fa fa-star-half-o"></i>' +
        '<i class="fa fa-star-o"></i>'+ '</div>';
};

module.exports = CatRating;
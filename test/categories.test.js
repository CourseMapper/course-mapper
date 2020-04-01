/**
 * Created by ridho on 27/03/15.
 */
var appRoot = require('app-root-path');
var assert = require('assert');
var uuid = require('uuid');

var request = require('superagent');

// connect to db
require(appRoot + '/libs/core/database.js');

// model & logic
var Account =  require(appRoot + '/modules/accounts');
var Category = require(appRoot + '/modules/catalogs/categories.js');
var catalog =  require(appRoot + '/modules/catalogs/category.controller.js');
var User = require(appRoot + '/modules/accounts/users.js');

var baseApiUrl = "http://localhost:3000/api/";

var user = {
    username: "rpl",
    role: "admin",
    email: "r@rpl.im",
    password: "1"
};

// describe('categories.test', function(){
//
//     var params = {
//         category: "rpl",
//         parentCategory: 0
//     };
//
//     before(function(done){
//         Category.collection.remove({}, function(){console.log("cleared Category db")});
//         done();
//     });
//
//     after(function(){
//         Category.collection.remove({}, function(){console.log("cleared Category db at the end")});
//     });
//
//     var fid = 0;
//
//     describe('NewCategory', function(){
//
//         it('should be able to save', function(done){
//             // create the user first
//             var cat = new catalog();
//             cat.addCategory(
//                 function failed(err) {
//                     assert.equal(2,1);
//                 },
//                 params,
//                 function success(cat) {
//                     console.log('saved cat with ' + cat.id);
//                     // log in
//                     assert.equal(cat.category, params.category);
//                     assert.notEqual(cat.id, null);
//
//                     fid = cat.id;
//
//                     done();
//                 }
//             );
//         });
//
//         it('should be able to save with subCat', function(done){
//
//             var subCat = {
//                 category: "brobro",
//                 parentCategory: fid
//             };
//
//             // create the user first
//             var sc = new catalog();
//             sc.addCategory(
//                 function failed(err) {
//                     console.log(err);
//                     done();
//                 },
//                 subCat,
//                 function success(NC) {
//                     console.log('saved NEW SUBcat with ' + NC.id);
//
//                     assert.equal(NC.category, subCat.category);
//                     assert.notEqual(NC.id, null);
//
//                     done();
//                 }
//             );
//         });
//
//
//     });
//
// });

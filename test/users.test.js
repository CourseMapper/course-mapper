/**
 * Created by ridho on 27/03/15.
 */
var appRoot = require('app-root-path');
var uuid = require('uuid');
var assert = require('assert');

var request = require('superagent');

// connect to db
require(appRoot + '/libs/core/database.js');
// model & logic
var User = require(appRoot + '/modules/accounts/users.js');
var Account = require(appRoot + '/modules/accounts');

var baseApiUrl = "http://localhost:3000/api/";

// describe('user_model', function(){
//
//     var params = {
//         username: "rpl",
//         role: "user",
//         email: "r@rpl.im",
//         password: "1"
//     };
//
//     before(function(done){
//         User.collection.remove({}, function(){console.log("cleared users db")});
//         done();
//     });
//
//     after(function(){
//         User.collection.remove({}, function(){console.log("cleared users db at the end")});
//     });
//
//     beforeEach(function(done){
//         params = {
//             username: "rpl",
//             role: "user",
//             email: "r@rpl.im",
//             password: "1"
//         };
//
//         done();
//     });
//
//     describe('login', function(){
//
//         beforeEach(function(done){
//             // clear db first
//             User.collection.remove({}, function(){console.log("cleared users db")});
//             done();
//         });
//
//         it('should be able to login', function(done){
//             // create the user first
//             var account = new Account();
//             account.signUp(
//                 function failedSignUp(err) {
//                     assert.equal(2,1);
//                 },
//                 params,
//                 function successSignUp(user) {
//                     // log in
//                     request.post(baseApiUrl + "accounts/login",
//                         {
//                             username: params.username,
//                             password: params.password
//                         },function(res){
//                             assert.equal(res.status, 200);
//                             assert.equal(res.body.result, true);
//                         }
//                     );
//                 }
//             );
//
//             done();
//         });
//
//         it('should be failed to login', function(done){
//             // create the user first
//             var account = new Account();
//             account.signUp(
//                 function failedSignUp(err) {
//                     assert.equal(2,1);
//                 },
//                 params,
//                 function successSignUp(user) {
//                     // log in
//                     request.post(baseApiUrl + "accounts/login",
//                         {
//                             username: "lol",
//                             password: "kol"
//                         },function(res){
//                             assert.equal(res.status, 401);
//                             //assert.equal(res.body.result, true);
//                             console.log(res.body);
//                         }
//                     );
//                 }
//             );
//
//             done();
//         });
//     });
//
//     describe('create a user', function(){
//         beforeEach(function(done){
//             params = {
//                 username: "rpl2",
//                 role: "user",
//                 email: "r@rpl.im",
//                 password: "1"
//             };
//
//             done();
//         });
//
//         it('should create a user by posting', function(done){
//             params.username += uuid.v1({msecs: new Date().getTime()});
//
//             // initial post with this username
//             var account = new Account();
//             account.signUp(
//                 function failedSignUp(err) {
//                     assert.equal(2,1);
//                     done();
//                 },
//                 params,
//                 function successSignUp(user) {
//                     assert.equal(1,1);
//                     done();
//                 }
//             );
//         });
//
//         it('should failed because incomplete param', function(done){
//             params.username += uuid.v1({msecs: new Date().getTime()});
//             params.email = null;
//
//             var account = new Account();
//             account.signUp(
//                 function failedSignUp(err) {
//                     assert.equal(1,1);
//                     done();
//                 },
//                 params,
//                 function successSignUp(user) {
//                     assert.equal(1,2);
//                     done();
//                 }
//             );
//         });
//
//         it('should failed because incomplete param', function(done){
//             params.username = null;
//             params.email = "r@rpl.im";
//
//             var account = new Account();
//             account.signUp(
//                 function failedSignUp(err) {
//                     assert.equal(1,1);
//                     done();
//                 },
//                 params,
//                 function successSignUp(user) {
//                     assert.equal(1,2);
//                     done();
//                 }
//             );
//         });
//
//         it('should failed because there is already the same username', function(done){
//             params.username += "rere_" + uuid.v1({msecs: new Date().getTime()});
//             params.email = "r@rpl.im";
//
//             // initial post with this username
//             var account = new Account();
//             account.signUp(
//                 function failedSignUp(err) {
//                     assert.equal(1, 2);
//                     done();
//                 },
//                 params,
//                 function successSignUp(user) {
//                     var account = new Account();
//                     account.signUp(
//                         function failedSignUp(err) {
//                             assert.equal(1,1);
//                             done();
//                         },
//                         params,
//                         function successSignUp(user) {
//                             assert.equal(2,1);
//                             done();
//                         }
//                     );
//                 }
//             );
//         });
//     });
// });


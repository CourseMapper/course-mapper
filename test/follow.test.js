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
var Course = require(appRoot + '/modules/catalogs/courses.js');
var User = require(appRoot + '/modules/accounts/users.js');
var UserCourse = require(appRoot + '/modules/catalogs/userCourses.js');

var catalog =  require(appRoot + '/modules/catalogs/category.controller.js');

var baseApiUrl = "http://localhost:3000/api/";

var paramsUser = {
    username: "rpl",
    role: "admin",
    email: "r@rpl.im",
    password: "1"
};

var paramsCourse = {
    course: "COURSE-101"
};

function fail(err, done) {
    console.log(err);
    assert.equal(2,1);

    if(done)
        done();
}

function success(){
    assert.equal(1,1);
}

// describe('follow.test', function(){
//
//     before(function(done){
//         Category.collection.remove({}, function(){console.log("cleared Category db")});
//         Course.collection.remove({}, function(){console.log("cleared Course db")});
//         User.collection.remove({}, function(){console.log("cleared User db")});
//         UserCourse.collection.remove({}, function(){console.log("cleared UserCourse db")});
//
//         done();
//     });
//
//     after(function(){
//         Category.collection.remove({}, function(){console.log("cleared Category db End")});
//         Course.collection.remove({}, function(){console.log("cleared Course db End")});
//         User.collection.remove({}, function(){console.log("cleared User db End")});
//         UserCourse.collection.remove({}, function(){console.log("cleared UserCourse db End")});
//     });
//
//     describe('Following a course', function(){
//
//         it('should be able to follow', function(done){
//             // create the user first
//             var account = new Account();
//             account.signUp(function(){
//                     if (err) fail(err, done);
//                 },
//                 paramsUser,
//                 function (user) {
//                     // create course first
//                     var c = new Course(paramsCourse);
//                     c.save(function (err) {
//                         if (err) fail(err, done);
//                         else {
//                             // lets test the follow procedure
//                             account.follow(fail,
//                                 {id: user.id}, {id: c.id},
//                                 function(followed){
//                                     console.log(followed);
//                                     assert.equal(1,1);
//                                     done();
//                                 });
//                         }
//                     });
//                 }
//             );
//         });
//
//     });
//
// });

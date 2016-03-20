var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var CourseController = require(appRoot + '/modules/catalogs/course.controller.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var CategoryController = require(appRoot + '/modules/catalogs/category.controller.js');
var TabsController = require(appRoot + '/modules/tabs/tabs.controller.js');
var Account = require(appRoot + '/modules/accounts/index.js');
var User = require(appRoot + '/modules/accounts/users.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var l2phelper = require(appRoot +'/libs/core/l2pHelper.js');
var debug = require('debug')('cm:route');
var moment = require('moment');
var mongoose = require('mongoose');
var router = express.Router();
var theme = config.get('theme');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('underscore');

// set a cookie
router.use(function (req, res, next) {
    var isInIframe = false;
    var setCookie = false;
    if (req.query.iframe === 'true') {
        isInIframe = true;
        setCookie = true;
    }
    else if (req.query.iframe === 'false') {
        isInIframe = false;
        setCookie = true;
    }

    // check if client sent cookie
    var cookie = req.cookies.isInIframe;

    // set if not set
    if (setCookie || cookie === undefined) {
        res.cookie('isInIframe', isInIframe, {maxAge: 900000, httpOnly: true});
    }

    next();
});

/**
 * get courses based on category slug
 * return: html view
 */
router.get('/courses', function (req, res, next) {
    res.render(theme + '/catalogs/courses', {
        req: req,
        title: 'Browse for Courses',
        user: req.user,
        showSidebar: true
    });
});

/**
  * Rendering function for courseDetail
  */

function courseDetailRender(req,res,next, courseId){
  console.log(courseId);
  var TC = new TabsController();
  var crs = new CourseController();
  var cid = mongoose.Types.ObjectId(courseId);

  var op = async(function () {
      var tabs = await(TC.getActiveTabs('course')());
      var cr = await(crs.getCourseAsync({_id: cid})());

      return {tabs: tabs, course: cr, tabsActive: cr.tabsActive};
  });

  var isInIframe = (req.cookies.isInIframe === 'true');
  if (!isInIframe)
      if (req.query.iframe === 'true') {
          isInIframe = true;
      } else if (req.query.iframe === 'false') {
          isInIframe = false;
      }

  op()
      .then(function (ret) {
          var activeTabs = [];

          if (!ret.tabsActive)
              ret.tabsActive = {};

          for (var i = 0; i < ret.tabs.length; i++) {
              var isActive = ret.tabs[i].isActive;
              if (!isActive) {
                  continue;
              }

              if (typeof(ret.tabsActive[ret.tabs[i].name]) != "undefined") {
                  if (!ret.tabsActive[ret.tabs[i].name]) {
                      continue;
                  }
              }

              activeTabs.push(ret.tabs[i]);
          }

          res.render(theme + '/catalogs/courseDetail', {
              tabs: ret.tabs, tabsActive: ret.tabsActive, _: _,
              course: ret.course, activeTabs: activeTabs,
              isInIframe: isInIframe
          });
      })
      .catch(function (err) {
          helper.resReturn(err, res)
      });
};

/**
  * Helper function to login l2p users
  */
function loginL2PUser(req, res, next, l2pUserExists, currL2pUserId,callback){
  if(!l2pUserExists){
    console.log("Error: L2P user does not exist and could not be created");
    callback(false,{});
  }
  else {
    //req.user = l2pUserName;
    //res.render(config.get('theme') + '/profile', {title: 'My Profile', user: l2pUserName});
    console.log("Logging in L2PUser");
    User.findOne({
        l2pUserId: currL2pUserId
    },function(err,user){
      if(!user){
        console.log("Login Attempt failed");
        callback(false,{});
      }
      else{
        //passport.authenticate('custom',{})(req,res,next);
        req.login(user,function(data){
          console.log("Login successful");
          req.user = user.displayName;
          callback(true,user);

        },function error(data){
          if(data.errors){
            console.log("GOT ERRORS");
          }
          callback(false,{});
        });
      }
    });
    //TODO: login l2p user into coursemapper
  }
}

/**
  * Function to create L2P Courses
  * Currently not in use
  */

function createL2PCourse(req,res,next,userId,callback){
  console.log("Should not display");
  var crs = new CourseController();
  var courseId;
  crs.getCourse(function(err){
    var cat = new CategoryController();

    console.log("Error: Could not find course");

    cat.getCategory(function(err){
      console.log(err);
    },{},function(data){
      var params = {
        'category': data._id,
        'name': req.query.l2pCourse,
        'userId': userId
      };

      crs.addCourse(function(erro){
          console.log("Error: Could not create course"); //TODO
          console.log(erro);
      }, params, function(data){
        courseId = data._id;
        callback(courseId);
      });


    });
  },{name: req.query.l2pCourse}, function(data){
    console.log("Found One");
    courseId = data._id;
    callback(courseId);
  });
}


router.get('/course/courseDetail/:courseId', function (req, res, next) {
  var courseId = req.params.courseId;
  //courseDetailRender(req,res,next,courseId);


  l2pPrep(req,res,next,courseId,function(success){
    courseDetailRender(req,res,next,courseId);
  });

  /*if(!req.query.l2pToken)
    courseDetailRender(req,res,next,courseId);
  else{
    l2phelper.getContext(req.query.l2pToken, function(context){
      if(!context.Success){
        console.log("Error: Invalid L2P Token");
        //TODO: return when error
      }
      console.log("context:");
      console.log(context);
      l2pContext = context;
      var roleStringArray = context.UserRoles.split(" ");
      l2pRole = roleStringArray[roleStringArray.length-1];

      var currL2pUserId = l2pContext.UserId;

      var l2pUserExists = false;
      var l2pUserName = l2pContext.Details.filter(function(x) {return x.Key=='User.DisplayName';})[0].Value;
      l2pUserName= "Joh Kloe";
      console.log("Display Name: ");
      console.log(l2pUserName);
      var roleArray = ["admins","managers","students"];
      var roleIsValid = (roleArray.indexOf(l2pRole) != -1);
      if(roleIsValid){
        var account = new Account();
        User.findOne({
            l2pUserId: currL2pUserId
        },function(err,user){
          if(!user){
            var params = {
              username: l2pUserName,
              role: l2pRole,
              l2pUserId: currL2pUserId,
              password: req.query.l2pToken + "RaNdOmStRiNg"
            };
            account.signUp(function(err){
                console.log("Error: Error during L2P user creation");
                l2pUserExists = false;
                courseDetailRender(req,res,next,courseId);
            }, params, function(){
              console.log("Created l2p account");

              l2pUserExists = true;
              loginL2PUser(req, res,next, l2pUserExists, currL2pUserId,courseId,function(success){courseDetailRender(req,res,next,courseId);});
            });
          }
          else{
            if(l2pUserName == user.username){
              l2pUserExists = true;
              loginL2PUser(req, res, next, l2pUserExists, currL2pUserId,courseId,function(success){courseDetailRender(req,res,next,courseId);});
            }
            else {
              l2pUserExists = false;
              courseDetailRender(req,res,next,courseId);
            }
          }
        });
      }

    });
  }*/



});


/*router.get('/course/courseDetail/l2pCourse', function (req, res, next) {
  console.log("accessToken:");
  console.log(req.query.l2pToken);
  console.log("courseId:");
  console.log(req.query.l2pCourse);

  var crs = new CourseController();
  var courseId;

  l2phelper.getContext(req.query.l2pToken, function(context){
    if(!context.Success){
      console.log("Error: Invalid L2P Token");
      //TODO: return when error
    }
    console.log("GOT HEREEE");
    crs.getCourse(function(err){
      console.log("Error: Could not find course");
      function error(err){
          console.log("Error: Could not create course");
      };

      var params = {
        userId: context.userId,
        name: req.query.l2pCourse,
        category: "56252978845c284c1110e02e"
      };

      crs.addCourse(error, params, function(data){
        console.log(data);
        courseId = data._id;
      });


    },{name: req.query.l2pCourse}, function(data){
      courseId = data._id;
    });
  });
});*/

/**
 * partials related to tab and actionbars
 */
router.get('/course/tab/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.tabName);
});

router.get('/course/actionBar/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.tabName + 'ActionBar');
});

/**
 * partial for add new course modal form accessed from top menu in course list page
 */
router.get('/course/create', function (req, res, next) {
    res.render(theme + '/catalogs/newCourseModal');
});

/**
 * partial for editCourseModal in course detail page
 */
router.get('/course/edit', function (req, res, next) {
    res.render(theme + '/catalogs/editCourseModal');
});

/**
 * partial for modals in course related to map actions
 */
router.get('/course/addSubTopic', function (req, res, next) {
    res.render(theme + '/course/map/addSubTopicModal');
});
router.get('/course/editSubTopic', function (req, res, next) {
    res.render(theme + '/course/map/editSubTopicModal');
});
router.get('/course/addContentNode', function (req, res, next) {
    res.render(theme + '/course/map/addContentNodeModal');
});
router.get('/course/editContentNode', function (req, res, next) {
    res.render(theme + '/course/map/editContentNodeModal');
});

/**
  * L2P Prep
  */

function l2pPrep(req,res,next,courseId,callback){
  var crs = new CourseController();

  if(!req.query.accessToken)
    callback(false);
  else{
    l2phelper.getContext(req.query.accessToken, function(context){
      if(!context.Success){
        console.log("Error: Invalid L2P Token");
        //TODO: return when error
      }
      console.log("context:");
      console.log(context);
      l2pContext = context;
      var roleStringArray = context.UserRoles.split(" ");
      l2pRole = roleStringArray[roleStringArray.length-1];

      var currL2pUserId = l2pContext.UserId;

      var userIsManager = false;
      var l2pUserExists = false;
      var l2pUserName = l2pContext.Details.filter(function(x) {return x.Key=='User.FirstName';})[0].Value;
      console.log("l2pUserName: ");
      console.log(l2pUserName);
      var roleArray = ["admins","managers","students"];
      var roleIsValid = (roleArray.indexOf(l2pRole) != -1);
      if(roleIsValid){
        switch(l2pRole){
            case "admins":
              l2pRole = "admin";
            break;
            case "managers":
              l2pRole = "user";
              userIsManager = true;
            break;
            default:
              l2pRole = "user";
            break;
        }
        var account = new Account();
        User.findOne({
            l2pUserId: currL2pUserId
        },function(err,user){
          if(!user){
            var params = {
              username: l2pUserName,
              role: l2pRole,
              l2pUserId: currL2pUserId,
              password: req.query.accessToken + "RaNdOmStRiNg"
            };
            account.signUp(function(err){
                console.log("Error: Error during L2P user creation");
                l2pUserExists = false;
                callback(false);
            }, params, function(signedUpUser){
              console.log("Created l2p account");

              l2pUserExists = true;


              //if(userIsManager){
                crs.addManager(signedUpUser._id,courseId);
              //}

              loginL2PUser(req, res,next, l2pUserExists, currL2pUserId,function(success,logInUser){
                crs.enroll(function(err){
                  callback(false);
                }, {id: logInUser._id},
                {id: courseId},
                function(followed){
                  console.log("Getting Materials");
                  l2phelper.getLearningMaterials(req.query.accessToken,context.CourseId,function(dataSet){
                    
                    l2phelper.downloadLearningMaterials(req.query.accessToken,context.CourseId,courseId,dataSet, function(){

                      callback(true);
                    });
                  });
                }, true);
              });

            });
          }
          else{
            if(l2pUserName == user.username){
              l2pUserExists = true;

              crs.addManager(user._id,courseId);

              loginL2PUser(req, res,next, l2pUserExists, currL2pUserId,function(success,logInUser){
                crs.enroll(function(err){
                  callback(false);
                }, {id: logInUser._id},
                {id: courseId},
                function(followed){
                  console.log("Getting Materials");
                  l2phelper.getLearningMaterials(req.query.accessToken,context.CourseId,function(dataSet){

                    
                    l2phelper.downloadLearningMaterials(req.query.accessToken,context.CourseId,courseId,dataSet, function(){

                      callback(true);
                    });
                  });
                }, true);
              });
            }
            else {
              l2pUserExists = false;
              callback(false);
            }
          }
        });
      }
    });
  }
}



/**
 * full page for displaying course detail page
 */
router.get('/course/:slug', function (req, res, next) {
    /*l2pPrep(req,res,next,function(success){

    });*/

    if (!helper.checkRequiredParams(req.params, ['slug'],
            function (err) {
                helper.resReturn(err, res);
            }
        )) return;

    var params = {
        slug: req.params.slug
    };

    var isInIframe = (req.cookies.isInIframe === 'true');
    if (!isInIframe)
        if (req.query.iframe === 'true') {
            isInIframe = true;
        } else if (req.query.iframe === 'false') {
            isInIframe = false;
        }

    var c = new CourseController();
    c.getCourse(
        function (err) {
            helper.resReturn(err, res);
        },

        params,

        function (cours) {
            if (!cours)
                res.send(404);

            else {
                var TC = new TabsController();

                var op = async(function () {
                    var tabs = await(TC.getActiveTabs('course')());
                    return {tabs: tabs, tabsActive: cours.tabsActive};
                });

                op()
                    .then(function (ret) {
                        var activeTabs = [];
                        if (!ret.tabsActive)
                            ret.tabsActive = {};

                        for (var i = 0; i < ret.tabs.length; i++) {
                            var isActive = ret.tabs[i].isActive;
                            if (!isActive) {
                                continue;
                            }

                            if (typeof(ret.tabsActive[ret.tabs[i].name]) != "undefined") {
                                if (!ret.tabsActive[ret.tabs[i].name]) {
                                    continue;
                                }
                            }

                            activeTabs.push(ret.tabs[i]);
                        }

                        res.render(theme + '/catalogs/course', {
                            title: cours.name,
                            course: cours,
                            user: req.user,
                            moment: moment,
                            isInNodeDetailPage: false,
                            activeTabs: activeTabs,
                            isInIframe: isInIframe
                        });
                    })
                    .catch(function (err) {
                        helper.resReturn(err, res)
                    });
            }
        }
    );

});

module.exports = router;

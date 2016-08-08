var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var CourseController = require(appRoot + '/modules/catalogs/course.controller.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var CategoryController = require(appRoot + '/modules/catalogs/category.controller.js');
var Category = require(appRoot + '/modules/catalogs/categories.js');
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

router.get('/createl2pCourse/:courseId/:courseName' , function (req, res, next) {
  createL2PCourse(req,res,next,req.params.courseId,req.params.courseName,function(courseData,err,salvage){
    var urlPre = "https://lanzarote.informatik.rwth-aachen.de:8449";
    if(courseData){
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({result: true, url: urlPre+"/course/"+courseData.slug+"/#/cid/"+courseData._id+"?iframe=true&tab=map"}));
    }
    else {
      if(salvage){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({result: false, error: err, url: urlPre+"/course/"+salvage.slug+"/#/cid/"+salvage._id+"?iframe=true&tab=map"}));
      }
      else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({result: false, error: err}));
      }
    }
  });
});

/**
  * Rendering function for courseDetail
  */

function courseDetailRender(req,res,next, courseId){
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
function loginL2PUser(req, res, next, currL2pUserId,callback){
  User.findOne({
      l2pUserId: currL2pUserId
  },function(err,user){
    if(!user){
      callback(false,{});
    }
    else{
      //passport.authenticate('custom',{})(req,res,next);
      req.login(user,function(data){
        req.user = user.displayName;
        callback(true,user);

      },function error(data){
        if(data.errors){
          ;
        }
        callback(false,{});
      });
    }
  });
}

/**
  * Function to create L2P Courses
  * Currently not in use
  */

function createL2PCourse(req,res,next,l2pCourseId,l2pCourseName,callback){
  var crs = new CourseController();
  var courseId;
  crs.getCourse(function(err){
    var cat = new CategoryController();



    var func2 = function(cate,uid){
      var params = {
        'category': cate._id,
        'name': l2pCourseName,
        'userId': uid,
        l2pCourseId: l2pCourseId,
        settings: {disableControls: false, disableTop: true}
      };



      crs.addCourse(function(erro){
          callback(undefined,"Error: Unable to create course. Possibly duplicate name?");
      }, params, function(data){
        courseId = data._id;
        callback(data);
      });
    };


    var catParams = {
      name: "L2PCourses",
      positionFromRoot: {
        x: -200,
        y: -140
      }
    };


    var func = function(uid){
      cat.categoryExists(function (err){
        callback(undefined,"Error: Was unable to determine existence of category.");
      },
      {name: "L2PCourses"},
      function (data) {
        if(!data){
          cat.addCategory(function(err){
            callback(undefined,"Error: Did not find category L2PCourses and was unable to create it.");
          }, catParams, function(data){
            func2(data,uid);
          });
        }
        else {
          func2(data,uid);
        }



      });
    };

    var account = new Account();
    account.getUser(function(){
      var params = {
        username: "L2PCourseCreator",
        role: "user",
        password: ranString(10)
      };
      account.signUp(function(err){
          callback(undefined,"Error: Unable to signUp L2PCourseCreator");
      }, params, function(signedUpUser){
          func(signedUpUser._id);
      });
    },
    {username: "L2PCourseCreator"},
    function(data){
      func(data._id);
    }
  );
},{l2pCourseId: l2pCourseId}, function(data){
    callback(undefined,"Error: Course already exists",data);
  });
}

function ranString(num)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < num; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


router.get('/course/courseDetail/:courseId', function (req, res, next) {
  var courseId = req.params.courseId;

  l2pPrep(req,res,next,courseId,function(success){
    /*console.log("USER");
    console.log(req.user);
    if(req.user){
      var account = new Account();
      account.getUser(function(){

      },
      {_id: req.user._id},
      function(data){
        func(data._id);
      });
    }*/

    courseDetailRender(req,res,next,courseId);
  });

});


/*router.get('/createl2pCourse/:courseId/:courseName', function (req, res, next) {
  createL2PCourse(req,res,next,req.params.courseId,req.params.courseName,function(courseData){
    req.courseCreation = true;
    if(courseData)
      //res.status(200).json({result: true, url: "http://lanzarote.informatik.rwth-aachen.de:3000/course/"+courseData.slug+"/#/cid/"+courseData._id+"?iframe=true"});
      res.send(JSON.stringify({result: true, url: "http://lanzarote.informatik.rwth-aachen.de:3000/course/"+courseData.slug+"/#/cid/"+courseData._id+"?iframe=true"}));
    else {
      res.status(200).json({result: false, url:""});
    }
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
 * partials related to tab and actionbars for peer Assesment
 */
router.get('/course/tab/:tabName/:fileName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.fileName);
});

router.get('/course/actionBar/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.fileName + 'ActionBar');
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
        callback(false);
        return;
      }
      l2pContext = context;


      crs.getCourse(function(err){
        callback(false);
      },{l2pCourseId: context.CourseId}, function(data){
        if(data._id != courseId){
          callback(false);
        }
        else {
          var roleStringArray = context.UserRoles.split(" ");
          l2pRole = roleStringArray[roleStringArray.length-1];

          var currL2pUserId = l2pContext.UserId;

          var userIsManager = false;
          var l2pUserExists = false;
           var l2pUserName = l2pContext.Details.filter(function(x) {return x.Key=='User.FirstName';})[0].Value;

          var roleArray = ["admins","managers","students", "extra", "tutors"];
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
                case "students":
                  l2pRole = "user";
                break;
                case "extra":
                   l2pRole = "user";
                break;
                case "tutors":
                    l2pRole = "user";
                break;
                default:
                  l2pRole = "user";
                break;
            }

            var signUpCallback = function(signedUpUser){
              if(userIsManager){
                crs.addManager(signedUpUser._id,courseId, function(success){
                  if(!success){
                    callback(false);
                  }
                  else {
                    loginL2PUser(req, res,next, currL2pUserId,function(success,logInUser,err){
                      if(success){
                        crs.enroll(function(err){
                          callback(false);
                        },
                        {id: logInUser._id},
                        {id: courseId},
                        function(followed){
                          l2phelper.getLearningMaterials(req.query.accessToken,context.CourseId,function(dataSet){
                            l2phelper.downloadLearningMaterials(req.query.accessToken,context.CourseId,courseId,dataSet, logInUser._id, function(){
                              callback(true);
                            });
                          });
                        }, true);
                      }
                      else {
                        callback(false);
                      }
                    });
                  }
                });
              }else{
                loginL2PUser(req, res,next, currL2pUserId,function(success,logInUser,err){
                  if(success){
                    crs.enroll(function(err){
                      callback(false);
                    },
                    {id: logInUser._id},
                    {id: courseId}, function(followed){console.log("");callback(true)},true);
                  }
                  else {
                    callback(false);
                  }
                });
              }
            };



            var account = new Account();
            User.findOne({
                l2pUserId: currL2pUserId
            },function(err,user){
              if(!user){
                var params = {
                  username: l2pUserName,
                  role: l2pRole,
                  l2pUserId: currL2pUserId,
                  password: req.query.accessToken + ranString(10)
                };




                account.signUp(function(err){
                    l2pUserExists = false;
                    callback(false);
                }, params, function(signedUpUser){

                  signUpCallback(signedUpUser);
                });
              }
              else{
                if(l2pUserName == user.username){
                  signUpCallback(user);
                }
                else {
                  l2pUserExists = false;
                  callback(false);
                }
              }
              });
            }
            else {
              l2pUserExists = false;
              callback(false);
            }
          }
      });
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
            else if (cours.isDeleted === true)
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

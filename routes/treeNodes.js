var express = require('express');
var passport = require('passport');
var config = require('config');
var appRoot = require('app-root-path');
var CourseController = require(appRoot + '/modules/catalogs/course.controller.js');
var NodeController = require(appRoot + '/modules/trees/index.js');
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
 * partials related to tab and actionbars
 */
router.get('/treeNode/tab/:tabName', function (req, res, next) {


    res.render(theme + '/treeNode/' + req.params.tabName + '/' + req.params.tabName);
});

router.get('/treeNode/actionBar/:tabName', function (req, res, next) {

    res.render(theme + '/treeNode/' + req.params.tabName + '/' + req.params.tabName + 'ActionBar');
});


/**
  * Node detail rendering helper function
  */

function nodeDetailRender(req,res,next){
  var TC = new TabsController();
  var nod = new NodeController();
  var nid = mongoose.Types.ObjectId(req.params.nid);

  var op = async(function () {
      var ta = await(TC.getActiveTabs('contentNode')());
      var nd = await(nod.getNodeAsync()({_id: nid}));

      return {tabs: ta, tabsActive: nd.tabsActive, course: nd.courseId, treeNode: nd};
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
              var tap = ret.tabs[i];
              var isActive = tap.isActive;
              if (!isActive) {
                  continue;
              }

              if (typeof(ret.tabsActive[tap.name]) != "undefined") {
                  if (!ret.tabsActive[tap.name]) {
                      continue;
                  }
              }

              activeTabs.push(tap);
          }

          var le = _.extend(ret, {activeTabs: activeTabs, isInIframe: isInIframe});
          res.render(theme + '/catalogs/nodeDetail', le);
          console.log("ALREADY GOT HERE");
      })
      .catch(function (err) {
          helper.resReturn(err, res);
      });
}

/**
  * Helper function to login l2p users
  */
function loginL2PUser(req, res, next, l2pUserExists, currL2pUserId){
  if(!l2pUserExists){
    console.log("Error: L2P user does not exist and could not be created");
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
      }
      else{
        //passport.authenticate('custom',{})(req,res,next);
        req.login(user,function(data){
          console.log(data);
          console.log("Login successful");
          //req.user = user.displayName;
          console.log(req.user);
          //res.render(config.get('theme') + '/profile', {title: 'My Profile', user: user.displayName});
          /*req.enroll(user,function(data){
            console.log("Successfully enrolled");
            nodeDetailRender(req,res,next);

          },function error(err){
            console.log("Error: Could not enroll");
            nodeDetailRender(req,res,next);

          });*/
          //req.enroll();
          nodeDetailRender(req,res,next);

        },function error(data){
          if(data.errors){
            console.log("GOT ERRORS");
          }
        });
      }
    });
    //TODO: login l2p user into coursemapper
  }
}



/**
 * partial for nodeDetail, (accessed by course detail page)
 */
router.get('/treeNode/:cid/nodeDetail/:nid', function (req, res, next) {
    console.log("accessToken:");
    console.log(req.query.l2pToken);
    console.log("courseId:");
    console.log(req.query.l2pCourse);

    var l2pRole;
    var l2pContext;

    /*l2phelper.getUserRole(req.query.l2pToken, req.query.l2pCourse, function(role){
      console.log("role:");
      console.log(role);
      l2pRole = role;
    });*/



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

      //Create L2P User if it does not exist

      var l2pUserExists = false;
      var l2pUserName = l2pContext.Details.filter(function(x) {return x.Key=='User.FirstName';})[0].Value;
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
                nodeDetailRender(req,res,next);
            }, params, function(){
              console.log("Created l2p account");

              l2pUserExists = true;
              loginL2PUser(req, res,next, l2pUserExists, currL2pUserId);
            });
          }
          else{
            if(l2pUserName == user.username){
              l2pUserExists = true;
              loginL2PUser(req, res, next, l2pUserExists, currL2pUserId);
            }
            else {
              l2pUserExists = false;
              nodeDetailRender(req,res,next);
            }
          }
        });
      }
    });


});

/**
 * full page for displaying course detail page
 */
router.get('/treeNode/:nid', function (req, res, next) {

    var TC = new TabsController();
    var nod = new NodeController();
    var nid = mongoose.Types.ObjectId(req.params.nid);

    var op = async(function () {
        var ta = await(TC.getActiveTabs('contentNode')());
        var nd = await(nod.getNodeAsync()({_id: nid}));

        return {tabs: ta, tabsActive: nd.tabsActive, course: nd.courseId};
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
                var tap = ret.tabs[i];
                var isActive = tap.isActive;
                if (!isActive) {
                    continue;
                }

                if (typeof(ret.tabsActive[tap.name]) != "undefined") {
                    if (!ret.tabsActive[tap.name]) {
                        continue;
                    }
                }

                activeTabs.push(tap);
            }

            res.render(theme + '/catalogs/course', {
                title: ret.course.name,
                course: ret.course,
                user: req.user,
                moment: moment,
                isInNodeDetailPage: true,
                activeTabs: activeTabs,
                isInIframe: isInIframe
            });
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });

});

module.exports = router;

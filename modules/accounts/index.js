var User = require('./users.js');
var UserCourse = require('./userCourses.js');
var Course = require('../catalogs/courses.js');
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');

function account(){
}

/**
 * just a demo code to create an admin user
 */
account.prototype.createAdmin = function(){
    var param = {
        username: "rpl",
        roles: "admin",
        email: "r@rpl.im",
        password: "1"
    };
    this.signUp(
        function(e){console.log(e)},
        param,
        function(u){console.log(u)}
    );
};

/**
 * wrap up add user and check user process
 *
 * @param err
 * @param params
 * @param done
 */
account.prototype.signUp = function(err, params, done){
    var self = this;

    this.userExist(params.username,
        function isExist(){
            //user is exist, so cannot register now
            err(new Error("user is exist"));
            console.log("user is exist");
        },
        function isNotExist(){
            //user does not exist, so cool, add to our DB
            self.addUser(err, params, done);
        });
};

/**
 * addUser into the system.
 * use the signUp() instead of this for existing user check
 *
 * @param error
 * @param params
 * @param done
 */
account.prototype.addUser = function(errorCallback, params, done){
    var self = this;

    var user = new User({
        username: params.username,
        email: params.email,
        roles: params.roles
    });

    // hash the password first
    user.setPassword(params.password);

    // check whether need activation, if yes, generate new code, and default to deactivated
    if(config.get('signUp.needActivation')){
        user.setActivationCode();
        user.deactivate();
    }

    // save it to db
    user.save(function (err) {
        if (err) {
            console.log('registration error');
            // call error callback
            errorCallback(err);
        } else {
            // call success callback
            done(user);

            // send email to the new user
            self.sendEmail(params.email);
        }
    });
};

account.prototype.sendEmail = function(email){
    // todo: send email properly
    return;
    //var message = view.get(email.ejs)
    if(config.get('signUp.needActivation')){

    }
};

/**
 * check whether user exist or not
 *
 * @param username
 * @param exist
 * @param notExist
 */
account.prototype.userExist = function(username, exist , notExist) {
    User.count({
        username: username
    }, function (err, count) {
        if (count === 0) {
            notExist();
        } else {
            exist();
        }
    });
};

/**
 * Handle login post request from browser/client
 *
 * @param req
 * @param res
 * @param next
 */
account.prototype.handleLoginPost = function(req, res, next) {
    // ask passport to authenticate
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            // if error happens
            return next(err);
        }

        if (!user) {
            // if authentication fail, get the error message that we set
            // from previous (info.message) step, assign it into to
            // req.session and redirect to the login page again to display
            req.session.messages = info.message;
            return res.redirect('/accounts/login');
        }

        // if everything is OK
        req.logIn(user, function(err) {
            if (err) {
                req.session.messages = "Error";
                return next(err);
            }

            // remember me box is checked
            if (req.body.rememberMe) {
                req.session.cookie.maxAge = config.get('session.maxAge');
                req.session._garbage = Date();
                req.session.touch();
            } else {
                // it means when the browser is closed, the cookie will expire
                req.session.cookie.expires = false;
            }

            // set the message and redirect
            req.session.messages = "Login successfully";
            return res.redirect('/accounts/' + user.username);
        });
    })(req, res, next);
};

/**
 * Handle register post request from browser/client
 *
 * @param req
 * @param res
 * @param next
 */
account.prototype.handleRegisterPost = function(req, res, next) {
    this.signUp(
        function error(err){
            return next(err);
        },
        req.body,
        function done(user) {
            // todo: implement flash
            return res.redirect('/accounts/login/#' + user.username);
        }
    );
};

account.prototype.follow = function(err, userParam, courseParam, done){
    var user = null;
    var course = null;

    /* find user first see if it exist */
    var userPromise = User.findById(mongoose.Types.ObjectId(userParam.id)).exec();
    userPromise.then(function(u){
        user = u;
        return Course.findOne({_id:courseParam.id}).exec();

        }).then(function(c){
            /* find course see if it exist */
            course = c;
            return UserCourse.find({userId: user._id, courseId: course._id}).exec();

            }).then(function(uc){
                /* user has not follow this course */
                if(!uc.length){
                    var follow = new UserCourse({
                        userId: user._id,
                        courseId: course._id
                    });

                    follow.save(function(error, f){
                        if (error) err(error);
                        else
                            done(f);
                    });
                } else {
                    err(new Error('This user has followed this course already'));
                }
            });
};

account.prototype.getUserCourses = function(err, params, done){
    var course = null;

    /* find course see if it exist */
    var coursePromise = Course.findOne({_id:params.courseId}).exec();
    coursePromise.then(function(c){
        course = c;

        /* has this user followed? */
        return UserCourse.findOne({userId: mongoose.Types.ObjectId(params.userId), courseId: course.id}).exec();

    }).then(function(uc){
        console.log(uc);
        /* user has followed this course */
        if(uc){
            done(course, uc);
        } else
            done(course, null);
    });
};

module.exports = account;
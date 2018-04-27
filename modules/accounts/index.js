var User = require('./users.js');
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var debug = require('debug')('cm:server');

var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var crypto = require('crypto');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function hash(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
}

function account() {
}

/**
 * Create the initial admin user
 */
account.prototype.createAdmin = function (password) {
    var param = {
      role:     "admin",
      username: "admin",
      email:    "admin@example.org",
      password: "admin"
    };
    if (password) {
      param.password = password;
    }

    this.signUp(
        function (e) {
            console.error(e)
        },
        param,
        function (u) {
            console.log(u)
        }
    );
};

/**
 * wrap up add user and check user process
 *
 * @param err
 * @param params
 * @param done
 */
account.prototype.signUp = function (err, params, done) {
    var self = this;

    this.userExist(params.username,
        function isExist() {
            //user is exist, so cannot register now
            debug("user is exist");
            err(new Error("user is exist"));
        },
        function isNotExist() {
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
account.prototype.addUser = function (errorCallback, params, done) {
    var self = this;

    var user = new User({
        username: params.username,
        email: params.email
    });

    user.displayName = user.username;

    if (params.role)
        user.role = params.role;

    // hash the password first
    user.setPassword(params.password);

    // generate gravater image url
    user.setImage(params.email);

    // check whether need activation, if yes, generate new code, and default to deactivated
    if (config.get('signUp.needActivation')) {
        user.setActivationCode();
        user.deactivate();
    }

    // save it to db
    user.save(function (err) {
        if (err) {
            debug(err.message);
            // call error callback
            errorCallback(err);
        } else {
            // call success callback
            done(user);

            // send email to the new user
            self.sendEmail(params.email);

            Plugin.doAction('onAfterUserCreated', user);
        }
    });
};

account.prototype.sendEmail = function (email) {
    // todo: send email properly
    return;
    //var message = view.get(email.ejs)
    if (config.get('signUp.needActivation')) {

    }
};

/**
 * check whether user exist or not
 *
 * @param username
 * @param exist
 * @param notExist
 */
account.prototype.userExist = function (username, exist, notExist) {
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
account.prototype.handleLoginPost = function (req, res, next) {
    // ask passport to authenticate
    passport.authenticate('local', function (err, user, info) {
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
        req.logIn(user, function (err) {
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

/*account.prototype.changePassword = function (error, params, success) {
    if (params.password == params.passwordConfirm) {
        User.findOne({_id: params.userId})
            .exec(function (err, doc) {
                if (err) {
                    error(err);
                } else {
                    var hashedPwd = hash(params.oldPassword, doc.salt);
                    // check old pwd d
                    if (hashedPwd == doc.password) {
                        doc.setPassword(params.password);
                        doc.save(function () {
                            success();
                        });
                    } else {
                        error(new Error("old password is not correct"));
                    }
                }
            });
    }
};*/

account.prototype.editAccount = function (error, params, success) {
    User.findOne({_id: params.userId})
        .exec(function (err, doc) {
            if (err) {
                error(err);
            }

            if (doc) {
                if (params.password) {
                    if (params.password == params.passwordConfirm) {
                        var hashedPwd = hash(params.oldPassword, doc.salt);
                        if (hashedPwd == doc.password)
                            doc.setPassword(params.password);
                        else {
                            return error(new Error("Old password is not correct."));
                        }
                    } else {
                        return error(new Error("Password and password confirmation does not match."));
                    }
                }

                if (params.displayName) {
                    doc.displayName = params.displayName;
                    debug('edit displayname');
                }

                // generate gravater image url
                doc.setImage(doc.email);

                doc.save(function (err) {
                    if (err)
                        error(err);

                    success(doc);
                    Plugin.doAction('onAfterUserEdited', doc);
                });

            } else {
                error(new Error("old password is not correct"));
            }

        });
};

/**
 * Handle register post request from browser/client
 *
 * @param req
 * @param res
 * @param next
 */
account.prototype.handleRegisterPost = function (req, res, next) {
    this.signUp(
        function error(err) {
            return next(err);
        },
        req.body,
        function done(user) {
            return res.redirect('/accounts/login/#' + user.username);
        }
    );
};

account.prototype.getUser = function (error, params, success) {
    User.findOne(params)
        .select('-password -salt -activationCode -__v -isActivated -dateUpdated')
        .exec(function (err, doc) {
            if (err)
                error(err);
            else {
                if (doc) {
                    if (!doc.displayName)
                        doc.displayName = doc.username;

                    if (!doc.image) {
                        // generate gravater image url
                        doc.setImage(doc.email);
                        doc.save();
                    }

                    success(doc);
                }
                else {
                    error(helper.createError404('User'));
                }
            }
        });
};

module.exports = account;

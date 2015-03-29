var User = require('./users.js');
var config = require('config');
var passport = require('passport');

function account(){
}

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
 *
 * @param error
 * @param params
 * @param done
 */
account.prototype.addUser = function(error_callback, params, done){
    var self = this;

    var user = new User({
        username: params.username,
        email: params.email,
        role: params.role
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
            error_callback(err);
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
            return res.redirect('/login');
        }

        // if everything is OK
        req.logIn(user, function(err) {
            if (err) {
                req.session.messages = "Error";
                return next(err);
            }

            // set the message
            req.session.messages = "Login successfully";
            return res.redirect('/accounts/' + user.username);
        });
    })(req, res, next);
};

module.exports = account;
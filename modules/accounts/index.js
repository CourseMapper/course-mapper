var User = require('./Users.js');

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
    var user = new User({
        username: params.username,
        email: params.email,
        role: params.role
    });

    // hash the password first
    user.setPassword(params.password);

    // save it to db
    user.save(function (err) {
        if (err) {
            console.log('registration error');
            console.log(err);
            // call error callback
            error_callback(err);
        } else {
            // call success callback
            done(user);
        }
    });
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

module.exports = account;
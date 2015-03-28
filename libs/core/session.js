/**
 *  creates session, and deals with it
 */
var config = require('config');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var appRoot = require('app-root-path');
var accounts = require(appRoot + '/modules/accounts');

function session(app, db){
    var params = {
        saveUninitialized: true, // saved new sessions
        resave: false, // do not automatically write to the session store
        secret: config.get('session.secret'),
        cookie : {
            httpOnly: true,
            maxAge: config.get('session.maxAge')
        },
        store: new mongoStore({ mongooseConnection: db.connection })
    };

    //use express-session
    app.use(expressSession(params));

    //use passport as session authenticator
    app.use(passport.initialize());
    app.use(passport.session());

    // use local strategy, this matching the sent data to our db
    passport.use(new localStrategy(function(username, password, done) {
        accounts.Users.findOne({ username : username},function(err,user){
            // mongo error
            if(err) { return done(err); }

            // cannot found user
            if(!user){
                return done(null, false, { message: 'Incorrect username.' });
            }

            if (user.isValidPassword(password))
                return done(null, user);

            return done(null, false, { message: 'Incorrect password.' });
        });
    }));

    passport.serializeUser(function(user, done) {
        var sessionUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles
        };

        done(null, sessionUser);
    });

    passport.deserializeUser(function(sessionUser, done) {
        done(null, sessionUser);
    });
}

module.exports = session;

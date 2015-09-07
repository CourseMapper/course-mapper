/**
 *  creates session, and deal with it
 */

var config = require('config');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy
var appRoot = require('app-root-path');
var User = require(appRoot + '/modules/accounts/users.js');
var flash = require('flash');
var debug = require('debug')('cm:server');

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
    app.use(flash());

    /**
     * use local strategy, this matching the sent data to our db
      */
    passport.use(new localStrategy(function(username, password, done) {
        User.findOne({ username : username},function(err,user){
            // mongo error
            if(err) { return done(err); }

            // cannot found user
            if(!user){
                return done(null, false, { message: 'Incorrect username.' });
            }

            if(config.get('signUp.needActivation') && !user.isActivated){
                return done(null, false, { message: 'Your username is not activated yet.' });
            }

            // username found, password matched
            if (user.isValidPassword(password)) {
                return done(null, user);
            }

            return done(null, false, { message: 'Incorrect password.' });
        });
    }));

    // facebook will send back the token and profile
    var facebookSession = function (token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    newUser.facebook = {};

                    // set all of the facebook information in our user model
                    newUser.facebook.id = profile.id; // set the users facebook id
                    newUser.username = 'fb_' + newUser.facebook.id;
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user
                    newUser.facebook.displayName = profile.displayName; // we will save the token that facebook provides to the user
                    if(newUser.facebook.name){
                        newUser.facebook.name = "";
                        if(profile.name.givenName)
                            newUser.facebook.name = profile.name.givenName;
                        if(profile.name.familyName)
                            newUser.facebook.name += " " + profile.name.familyName;
                    }

                    if(profile.emails && profile.emails.length > 0) {
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.email = newUser.facebook.email; // facebook can return multiple emails so we'll take the first
                    } else {
                        newUser.email = newUser.facebook.id + '@fb.com';
                    }

                    newUser.setPassword(token);

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err) {
                            debug(err);
                            done(err, null);
                        }

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
            });
        });
    };

    /**
     * facebook strategy
     */
    passport.use(new FacebookStrategy({
        // pull in our app id and secret from our auth.js file
        clientID : config.get('facebookAuth.clientID'),
        clientSecret : config.get('facebookAuth.clientSecret'),
        callbackURL : config.get('facebookAuth.callbackURL'),
        profileFields : ['id', 'emails', 'name']
    }, facebookSession));

    passport.serializeUser(function(user, done) {
        var sessionUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            displayName: user.displayName
        };

        done(null, sessionUser);
    });

    passport.deserializeUser(function(sessionUser, done) {
        done(null, sessionUser);
    });
}

module.exports = session;

/*jslint node: true */
'use strict';

/**
 *  creates session, and deal with it
 */
var config = require('config');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var localStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var appRoot = require('app-root-path');
var User = require(appRoot + '/modules/accounts/users.js');
var flash = require('flash');
var debug = require('debug')('cm:server');

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    accept(null, true);
    // OR
    // If you use socket.io@1.X the callback looks different
    accept();
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) {
        throw new Error(message);
    }
    console.log('failed connection to socket.io:', message);
    // We use this callback to log all of our failed connections.
    accept(null, false);
    // OR
    // If you use socket.io@1.X the callback looks different
    // If you don't want to accept the connection
    if (error) {
        accept(new Error(message));
    }
    // this error will be sent to the user as a special error-package
    // see: http://socket.io/docs/client-api/#socket > error-object
}

function session(app, db, io) {
    var sessionStore = new mongoStore({
        mongooseConnection: db.connection
    });

    app.use(expressSession({
        saveUninitialized: true, // saved new sessions
        resave: false, // do not automatically write to the session store
        secret: config.get('session.secret'),
        cookie: {
            httpOnly: true,
            maxAge: config.get('session.maxAge')
        },
        store: sessionStore
    }));

    //use passport as session authenticator
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    //With Socket.io >= 1.0
    io.use(passportSocketIo.authorize({
        cookieParser: require('cookie-parser'), // the same middleware you register in express
        key: 'connect.sid', // the name of the cookie where express/connect stores its session_id
        secret: config.get('session.secret'), // the session_secret to parse the cookie
        store: sessionStore, // we NEED to use a sessionstore. no memorystore please
        success: onAuthorizeSuccess, // *optional* callback on success - read more below
        fail: onAuthorizeFail // *optional* callback on fail/error - read more below
    }));

    /**
     * use local strategy, this matching the sent data to our db
     */
    passport.use(new localStrategy(function(username, password, done) {
        User.findOne({
            username: username
        }, function(err, user) {
            // mongo error
            if (err) {
                return done(err);
            }

            // cannot found user
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }

            if (config.get('signUp.needActivation') && !user.isActivated) {
                return done(null, false, {
                    message: 'Your username is not activated yet.'
                });
            }

            // username found, password matched
            if (user.isValidPassword(password)) {
                return done(null, user);
            }

            return done(null, false, {
                message: 'Incorrect password.'
            });
        });
    }));

    // facebook will send back the token and profile
    var facebookSession = function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({
                'facebook.id': profile.id
            }, function(err, user) {

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
                    if (newUser.facebook.name) {
                        newUser.facebook.name = "";
                        if (profile.name.givenName)
                            newUser.facebook.name = profile.name.givenName;
                        if (profile.name.familyName)
                            newUser.facebook.name += " " + profile.name.familyName;
                    }

                    if (profile.emails && profile.emails.length > 0) {
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
        clientID: config.get('facebookAuth.clientID'),
        clientSecret: config.get('facebookAuth.clientSecret'),
        callbackURL: config.get('facebookAuth.callbackURL'),
        profileFields: ['id', 'emails', 'name']
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

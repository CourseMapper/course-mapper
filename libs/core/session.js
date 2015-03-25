/**
 *  creates session, and deals with it
 */
var config = require('config');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var passport = require('passport');

function session(app, db){
    var params = {
        saveUninitialized: true, // saved new sessions
        resave: false, // do not automatically write to the session store
        secret: config.get('session.secret'),
        cookie : {
            httpOnly: true,
            maxAge: config.get('session.maxAge')
        },
        store: new MongoStore({ mongooseConnection: db.connection })
    };

    app.use(expressSession(params));

    //use passport as session authenticator
    app.use(passport.initialize());
    app.use(passport.session());
}

module.exports = session;

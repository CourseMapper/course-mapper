var passport = require('passport');
var crypto = require('crypto');

var cmLibraries = {
  /**
   * do validation of required parameters before sending them to query
   * or get processed
   *
   * only accepting 1 level deep of array
   *
   * @param params
   * @param neededKeys
   * @param errorCallback
   */
  checkRequiredParams: function (params, neededKeys, errorCallback) {
    var errors = [];
    for (var i in neededKeys) {
      var nKey = neededKeys[i];
      if (typeof(params[nKey]) == 'undefined' || typeof(params[nKey]) === null) {
        errors.push(nKey);
      }
      else if (params[nKey] == "") {
        errors.push(nKey);
      }
    }

    if (errors.length > 0) {
      var msg = 'Missing required parameters ' + errors.join(', ');
      if (errorCallback) {
        errorCallback(cmLibraries.createError(msg, 400));
        return false;
      }
      else
        throw (cmLibraries.createError(msg, 400));
    }

    return true;
  },

  createError: function (errorMesage, httpCode) {
    var error = new Error(errorMesage);
    if (httpCode)
      error.httpCode = httpCode;

    return error;
  },

  createError404: function (objectName) {
    var error = new Error('Cannot find ' + objectName);
    error.httpCode = 404;

    return error;
  },

  createError401: function (msg) {
    if (!msg) {
      msg = 'Not Authorized';
    }

    var error = new Error(msg);
    error.httpCode = 401;

    return error;
  },

  convertToDictionary: function (documents) {
    var ret = {};
    for (var i in documents) {
      var doc = documents[i];
      ret[doc._id] = doc.toObject({getters: true, virtuals: false});
    }
    return ret;
  },

  /**
   * formatting res return
   *
   * @param err Error Object
   * @param res
   */
  resReturn: function (err, res) {
    var httpCode = 500;
    if (err.httpCode) {
      httpCode = err.httpCode;
    }

    var errMsg = [];
    if (err.errors) {
      for (var i in err.errors) {
        var ek = err.errors[i];
        errMsg.push(i + ':' + ek.message);
      }
    } else if (typeof err == 'string') {
      errMsg.push(err);
    } else if (err.message) {
      errMsg.push(err.message);
    } else {
      try {
        errMsg.push(JSON.stringify(err));
      } catch (exc) {
        errMsg.push(exc);
      }
    }

    res.status(httpCode).json({
      result: false,
      errors: errMsg
    });
  },

  l2pAuth: function (req, res, next) {
    if (req.query.accessToken != undefined) {
      passport.authenticate('custom', function (err, user, info) {
        if (err) {
          return next(err);
        }

        if (user) {
          req.logIn(user, function (err) {
            if (err) {
              return next(err);
            }

            return next();
          });
        } else
          next();
      })(req, res, next);
    } else
      next();
  },

  ensureAuthenticated: function (req, res, next) {
    // local strategy
    if (req.isAuthenticated()) {
      return next();
    } else {
      // basic strategy
      passport.authenticate(['basic', 'bearer'], {session: false}, function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          cmLibraries.resReturn(cmLibraries.createError401(), res);
        }
        else {
          if (req.user == undefined) {
            req.user = user;
          }
          return next();
        }
      })(req, res, next);
    }
  },

  ensureAuthenticatedWithCallback: function (req, res, next) {
    // local strategy
    if (req.isAuthenticated()) {
      return next();
    } else {
      // basic strategy
      passport.authenticate(['basic', 'bearer'], {session: false}, function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(new Error('401'));
        }
        else {
          req.logIn(user, function (err) {
            if (err) {
              return next(err);
            }

            return next();
          });
        }
      })(req, res, next);
    }
  },

  uid: function (len) {
    var buf = []
      , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
      buf.push(chars[cmLibraries.getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
  },

  getRandomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  hash: function (passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
  }

};

module.exports = cmLibraries;
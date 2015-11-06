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
            errorCallback(cmLibraries.createError(msg, 400));
            return false;
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
        } else if(typeof err == 'string'){
            errMsg.push(err);
        } else if(err.message){
            errMsg.push(err.message);
        } else {
            try {
                errMsg.push(JSON.stringify(err));
            } catch(exc){
                errMsg.push(exc);
            }
        }

        res.status(httpCode).json({
            result: false,
            errors: errMsg
        });
    }
};

module.exports = cmLibraries;
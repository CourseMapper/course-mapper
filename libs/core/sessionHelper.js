var sessionHelper = {
    /**
     * check for user logged in for API uses
     *
     * only accepting 1 level deep of array
     *
     * @param req
     * @param res
     * @param next
     */
    requireAuthentication: function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
        }
        else {
            next();
        }
    }
};

module.exports = sessionHelper;
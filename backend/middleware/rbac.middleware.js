const apiResponse = require('../../utils/apiResponse.js');

function rbac (...roles) {

    return function(req, res, next) {
        if (roles.includes(req.user.role)) {
            return next();
        }
        return apiResponse.error(res, 403, 'Action not authorize', null);
    }
}

module.exports = rbac;
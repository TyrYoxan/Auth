const apiResponse = require('../../utils/apiResponse.js');
const config = require('../../config/env.js');
const jwt = require('jsonwebtoken');


function auth (req, res, next) {

    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return apiResponse.error(res, 401, 'Token is missing', {error: 'Token is missing'});
        }

        req.user = jwt.verify(token, config.JWT_SECRET);
        next();

    } catch (err) {
        return apiResponse.error(res, 401, 'Token is invalid or expire', {error: err});
    }
}

module.exports = auth;
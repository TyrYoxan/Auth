const apiResponses = require('../../utils/apiResponse.js');
const logger = require('../../utils/logger.js');



async function login(req, res, client) {
    if (!req.body.email || !req.body.password) {
        return apiResponses.error(422, 'Incomplete information' ,'Email and password is required');
    }

    const email = req.body.email;
    const password = req.body.password;

    try{


        return apiResponses.success(200, null, 'Successfully logged in');
    }catch(err){
        return apiResponses.error(500, 'Error with data base', err.message);
    }

}
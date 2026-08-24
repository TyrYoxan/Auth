const { Pool } = require('pg');
const config = require("../../config/env");


const client = new Pool({connectionString: config.DATABASE_TYPE+config.DATABASE_PASS+'@'+config.DATABASE_USER+':'+
        config.DATA_PORT+'/'+config.DATABASE_NAME});

async function createToken(userId, token, expiresAt){
    try {
        const query = 'insert into refresh_token (user_id, token, date_expiration) values ($1,$2,$3) returning *';

        const response = await client.query(query, [userId, token, expiresAt]);

        if (response.rowCount !== 1) {
            throw new Error('Error creating refresh token');
        }


    }catch(err){
        throw new Error(err.message);
    }
}

async function findByToken(token){
    try{
        const query = 'select * from refresh_token where token = $1';

        const response = await client.query(query, [token]);
        if (!response.rows) {
            throw new Error('Error finding refresh token');
        }

        return response.rows;
    }catch (err){
        throw new Error(err.message);
    }
}

async function revokedToken(token){
    try {
        const query = 'update refresh_token set status = \'revoked\' where token = $1';

        const response = await client.query(query, [token]);
        if (response.rowCount === 0){
            return 'Error finding refresh token';
        }

        return 'Successfully revoked';
    }catch(err){
        return err.message;
    }
}

async function revokeAllUserTokens(userId){
    try{
        const query = 'update refresh_token set status = \'revoked\' where user_id = $1';

        const response = await client.query(query, [userId]);
        if (response.rowCount === 0){
            return 'Error finding userId';
        }
        return 'Successfully revoked';
    }catch (err){
        return err.message;
    }
}

module.exports = {createToken, revokeAllUserTokens, findByToken, revokedToken};
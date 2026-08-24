/**
 * USER
 * @type {{uuid: string, name: string, email: string, password: string, role: number, status: [actif / innactif / ban],
 * createdAt: Date, updatedAt: Date}}
 */

const { Pool } = require('pg');
const config = require("../../config/env");


const client = new Pool({connectionString: config.DATABASE_TYPE+config.DATABASE_PASS+'@'+config.DATABASE_USER+':'+
        config.DATA_PORT+'/'+config.DATABASE_NAME})

async function createUser(user){
    try {
        const query = 'insert into users (name, email, password) values ($1,$2,$3) returning *';

        const response = await client.query(query, [user.name, user.email, user.password]);

        if (response.rowCount !== 1) {
            return 'Invalid email or password';
        }

        return 'Successfully logged in';
    }catch(err){
        return err.message;
    }
}

async function findByEmail(email){
    try {

        const query = 'select id, name, email, role, status from users where email=$1';
        const response = await client.query(query, [email]);

        return response.rows;
    }catch (err){
        return err.message;
    }
}

async function findById(id){
    try {

        const query = 'select * from users where id=$1';
        const response = await client.query(query, [id]);

        return response.rows;
    }catch (err){
        return err.message;
    }
}

module.exports = {createUser, findByEmail, findById};
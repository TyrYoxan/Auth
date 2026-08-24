const userModel = require('../model/user.model.js');
const refreshTokenModel = require('../model/refreshToken.model.js');
const config = require('../../config/env');
const bcrypt = require("bcrypt");
const z = require("zod");
const jwt = require("jsonwebtoken");


const userCreateParse = z.object({
    name: z.string().min(1).max(64),
    email: z.email(),
    password: z.string().min(8).max(128)
});
const userParse = z.object({
    email: z.email(),
    password: z.string().min(8).max(128)
});

/**
 * Generate Token
 * @param user
 * @returns {{access: *, refresh: *, expiresAt: Date}}
 */
function generateToken(user) {
    const payload = {
        id: user["id"],
        role: user["role"]
    };

    const timeExpiration = parseInt(config.JWT_EXPIRES.match(/\d+/)[0]);
    return {
        access: jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m', algorithm: 'HS256'}),
        refresh: jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES, algorithm: 'HS256'}),
        expiresAt: new Date(Date.now() + timeExpiration * 24 * 60 * 60 * 1000),
    };
}

/**
 *
 * @param user
 * @returns {Promise<*|string|undefined>}
 */
async function register(user){
    try {
        user = userCreateParse.parse(user)
        user.password = await bcrypt.hash(user.password, 12);

        return await userModel.createUser(user);

    }catch(err){
        throw err;
    }
}

/**
 *
 * @param user
 * @returns {Promise<*|{accessToken: *, refreshToken: *}>}
 */
async function login(user){
    try {
        user = userParse.parse(user);

        const users = await userModel.findByEmail(user.email);
        if (!users || !await bcrypt.compare(user.password, users['password'])){
            throw new Error('Identifiants invalides');
        }

        const Token = generateToken(users);
        await refreshTokenModel.createToken(users['id'],Token.refresh, Token.expiresAt);

        return {
            accessToken: Token.access,
            refreshToken: Token.refresh,
        };
    }catch (err){
        throw err;
    }
}

/**
 *
 * @param refreshToken
 * @returns {Promise<*>}
 */
async function logout(refreshToken){
    try{
        await refreshTokenModel.revokedToken(refreshToken);
    }catch(err){
        throw err;
    }
}

/**
 *
 * @param refreshToken
 * @returns {Promise<*|{accessToken: *, refreshToken: *}>}
 */
async function refresh(refreshToken){
    try{
        const storedToken = await refreshTokenModel.findByToken(refreshToken);
        if (!storedToken || storedToken.status === 'revoked') {
            throw new Error('Token invalide ou révoqué');
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        const Token = generateToken(decoded);

        await refreshTokenModel.revokedToken(refreshToken);
        await refreshTokenModel.createToken(decoded.id, Token.refresh, Token.expiresAt);

        return {
            accessToken: Token.access,
            refreshToken: Token.refresh,
        };
    }catch(err){
        throw err;
    }
}

module.exports = {login, register, logout, refresh};
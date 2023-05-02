const JWT = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
    generateTokens(payload){
        const accessToken = JWT.sign(payload, process.env.SECRET_JWT_ACCESS_KEY, {expiresIn:'10m'});
        const refreshToken = JWT.sign(payload, process.env.SECRET_JWT_REFRESH_KEY, {expiresIn:'30d'});
        return {
            accessToken,
            refreshToken
        }
    }
    
    async saveToken(id, refreshToken) {
        const tokenData = await tokenModel.findOne({user: id})
        if(tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenModel.create({user: id, refreshToken});
        return token;
    }
    async removeToken(refreshToken){
        const token = await tokenModel.deleteOne({refreshToken});
        return token;
    }
    validateAccessToken(token){
        try{
            const userData = JWT.verify(token, process.env.SECRET_JWT_ACCESS_KEY);
            return userData;
        }catch(e){
            return null;
        }
    }
    validateRefreshToken(token){
        try{
            const userData = JWT.verify(token, process.env.SECRET_JWT_REFRESH_KEY);
            return userData;
        }catch(e){
            return null;
        }
    }
    async findToken(refreshToken){
        const token = await tokenModel.findOne({refreshToken});
        return token;
    }
}

module.exports = new TokenService();
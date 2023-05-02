const UserModel = require('../models/user-model.js');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service.js');
const tokenService = require('./token-service.js');
const DTO = require('../dtos/user-dto.js');
const ApiError = require('../exceptions/api-error.js');

class UserService {
    async registration(email, password){
        try {
            const candidate = await UserModel.findOne({email})
            if(candidate){
                throw ApiError.BadRequest('пользователь с данным email уже существует');
            }
            if(!password){
                throw ApiError.BadRequest('password is null or undefined');
            }
            const hashPassword = await bcrypt.hash(password, 3);
            const activationLink = uuid.v4();
            const user = await UserModel.create({email, password: hashPassword, activationLink});
            await mailService.sendActivationMail(email, activationLink);
            const userDTO = new DTO(user);
            const tokens = tokenService.generateTokens({...userDTO});
            await tokenService.saveToken(userDTO.id, tokens.refreshToken);

            return {
                ...tokens,
                user: userDTO
            }
        } catch(e){
            throw e;
        }
        
    }
    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink});
        if(!user){
            throw ApiError.BadRequest("Некоректная активационная ссылка");
        }
        user.isActivated = true;
        await user.save();
    }
    async login(email, password){
        const user = await UserModel.findOne({email});
        if(!user){
            throw ApiError.BadRequest('Пользователь не найден');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if(!isPassEquals){
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new DTO(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }
    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDataBase = await tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDataBase){
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new DTO(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
        
    }
    async getAllUsers(){
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService();
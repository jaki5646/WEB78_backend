import fs from 'fs'
import cloudinaryService from '../service/cloudinary.service.js';
import kryptoService from '../utils/hashing.js';
import userService from '../service/user.service.js';
import tokenService from '../service/token.service.js';
import refreshTokenService from '../service/refreshToken.service.js';
import { userModel } from '../models/user.model.js';
import { tokenModel } from '../models/token.model.js';



const filePath = fs.realpathSync('./')

class userHandler {
    async register(req, res, next) {
        try {
            const { email, username, password } = req.body;

            // avatar creating can be null
            let avatar
            if (req.file) {
                const avatarData = await cloudinaryService.postImg(`${filePath}\\images\\avatar\\${req.file.filename}`)
                avatar = avatarData.url
                // delete file after upload to cloudinary
                fs.unlinkSync(`${filePath}\\images\\avatar\\${req.file.filename}`)
            }
            else {
                avatar = 'https://freesvg.org/img/abstract-user-flat-4.png'
            }

            // encrypt password, salt and save in database
            const [newPassword, salt] = kryptoService.encrypt(password)

            // save information of user in database, with new password as encrypted and their salt
            const newUser = await userService.createUser(email, username, newPassword, salt, avatar)

            // create token and refresh token with new user as payload
            const token = tokenService.signToken({ username: newUser.username, password: newUser.password, role: newUser.ROLE, profile_picture: newUser.profile_picture, id: newUser.GLOBAL_ID })
            const refreshToken = await refreshTokenService.createNew(token, newUser.email);


            return res.status(201).json({
                message: "Register Successfully",
                status: 201,
                data: {
                    user: {
                        username: newUser.username,
                        role: newUser.ROLE,
                        profile_picture: newUser.profile_picture,
                    },
                    token,
                    refreshToken,
                },
            });
        }
        catch (e) {
            next(e)
        }
    };
    async login(req, res, next) {
        try {
            const { email } = req.body;
            const user = await userModel.findOne({ email })
            const token = tokenService.signToken({ username: user.username, password: user.password, role: user.ROLE, profile_picture: user.profile_picture, id: user.GLOBAL_ID })
            const refreshToken = await refreshTokenService.refreshNew(token, user.GLOBAL_ID);

            return res.status(200).json({
                message: "Login Successfully",
                status: 200,
                data: {
                    user: {
                        username: user.username,
                        role: user.ROLE,
                        profile_picture: user.profile_picture,
                    },
                    token,
                    refreshToken,
                },
            });
        }
        catch (e) {
            next(e)
        }
    }
    async updateProfile(req, res, next) {
        const { username } = req.body;
        const token = req.headers.authorization.split(' ')[1]
        const user = await tokenService.infoToken(token)
        let avatar;

        try {
            if (req.file) {
                const avatarData = await cloudinaryService.postImg(`${filePath}\\images\\avatar\\${req.file.filename}`)
                fs.unlinkSync(`${filePath}\\images\\avatar\\${req.file.filename}`)
                avatar = avatarData.url
            }
            else {
                avatar = false
            }


            const updatedUser = await userService.updateUser(user, { username, profile_picture: avatar ? avatar : user.profile_picture, __v: user.__v + 1 })

            return res.status(201).json({
                message: "Update Successfully",
                status: 201,
                data: {
                    user: {
                        username: updatedUser.username,
                        role: updatedUser.ROLE,
                        profile_picture: updatedUser.profile_picture,
                    }
                },
            });
        }
        catch (e) {
            next(e)
        }
    }
    async updatePassword(req, res, next) {
        const { newPassword } = req.body;
        const token = req.headers.authorization.split(' ')[1];
        const user = await tokenService.infoToken(token);
        const [updatePassword, updateSalt] = kryptoService.encrypt(newPassword)
        const newUser = await userService.updateUser(user, { password: updatePassword, salt: updateSalt })

        const newToken = tokenService.signToken({ username: newUser.username, password: newUser.password, role: newUser.ROLE, profile_picture: newUser.profile_picture, id: newUser.GLOBAL_ID })
        const refreshToken = await refreshTokenService.refreshNew(newToken, newUser.GLOBAL_ID);

        return res.status(200).json(
            {
                message: "Updated password sucessfully",
                status: 200,
                data: {
                    user: {
                        user: newUser.username,
                        role: newUser.ROLE,
                        profile_picture: newUser.profile_picture
                    },
                    token: newToken,
                    refreshToken
                }
            }
        )
    }
}

const userController = new userHandler();
export default userController;
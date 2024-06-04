import { itemModel } from "../models/item.model.js";
import { userModel } from "../models/user.model.js";

class userHandler {
    async createUser(email, username, password, salt, avatar) {
        try {
            const newUser = await userModel.create({
                email,
                username,
                password,
                salt,
                GLOBAL_ID: Math.ceil((Math.random() * 10) + Date.now()),
                ROLE: "user",
                profile_picture: avatar
            })

            return newUser
        }
        catch (e) {
            throw (
                {
                    message: e.message || e,
                    status: 500,
                    data: null
                }
            )
        }
    }
    async updateUser(user, payload) {
        try {
            const updatedUser = await userModel.findOneAndUpdate(user, payload, { new: true })
            return updatedUser
        }
        catch (e) {
            throw (
                {
                    message: e.message,
                    status: 500,
                    data: null
                }
            )
        }
    }
}

const userService = new userHandler();
export default userService;
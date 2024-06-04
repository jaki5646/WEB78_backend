import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, require: true },
    username: { type: String, require: true },
    password: { type: String, require: true },
    salt: { type: String, require: true },
    GLOBAL_ID: { type: String, require: true },
    ROLE: {type: String, require: true},
    profile_picture: String
});

export const userModel = mongoose.model('user', userSchema)

import fs from "fs";
import Joi from "joi";
import { userModel } from "../models/user.model.js";
import kryptoService from "../utils/hashing.js";
import tokenService from "../service/token.service.js";
import userService from "../service/user.service.js";

const filePath = fs.realpathSync("./");

class userHandler {
  async register(req, res, next) {
    const { email, username, password } = req.body;
    const schema = Joi.object().keys({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      username: Joi.string().min(3).max(30).required(),

      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
        .required(),
    });

    try {
      const existedUser = await userModel.findOne({ email });
      if (existedUser) {
        throw {
          message: "Email đã tồn tại",
          statusCode: 403,
          stack: "MongoDB conflict",
        };
      }

      await schema.validateAsync({
        email,
        username,
        password,
      });
      next();
    } catch (e) {
      // delete file if something went wrong
      if (req.file) {
        fs.unlinkSync(`${filePath}\\images\\avatar\\${req.file.filename}`);
      }
      next(e);
    }
  }
  async login(req, res, next) {
    const { email, password } = req.body;
    const schema = Joi.object().keys({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
        .required(),
    });
    try {
      await schema.validateAsync({
        email,
        password,
      });
      const existedUser = await userModel.findOne({ email });
      if (!existedUser) {
        throw {
          message: "Sai tài khoản hoặc mật khẩu",
          statusCode: 403,
          stack: "User input",
        };
      }
      const decryptedPassword = kryptoService.decrypt(
        password,
        existedUser.salt
      );

      if (existedUser.password != decryptedPassword) {
        throw {
          message: "Sai tài khoản hoặc mật khẩu",
          statusCode: 403,
          data: null,
        };
      }

      next();
    } catch (e) {
      next(e);
    }
  }
  async updateProfile(req, res, next) {
    const { username } = req.body;
    const schema = Joi.object().keys({
      username: Joi.string().min(3).max(30).required(),
    });
    try {
      if (!req.headers.authorization) {
        throw { message: "No credentials sent!", status: 403, data: null };
      }

      const token = req.headers.authorization.split(" ")[1] || undefined;

      tokenService.verifyToken(token);

      await schema.validateAsync({
        username,
      });
      next();
    } catch (e) {
      if (req.file) {
        fs.unlinkSync(`${filePath}\\images\\avatar\\${req.file.filename}`);
      }
      next(e);
    }
  }
  async updatePassword(req, res, next) {
    const { password, newPassword } = req.body;
    const schema = Joi.object().keys({
      newPassword: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{8,30}$"))
        .required(),
    });
    try {
      if (!req.headers.authorization) {
        throw { message: "No credentials sent!", status: 403, data: null };
      }
      const token = req.headers.authorization.split(" ")[1];

      tokenService.verifyToken(token);

      const user = await tokenService.infoToken(token);

      const decryptedPassword = kryptoService.decrypt(password, user.salt);

      if (user.password != decryptedPassword) {
        throw {
          message: "Sai mật khẩu",
          statusCode: 403,
          data: null,
        };
      }
      await schema.validateAsync({
        newPassword,
      });
      next();
    } catch (e) {
      next(e);
    }
  }
}
const userMiddleware = new userHandler();
export default userMiddleware;

import Joi from "joi";
import fs from "fs";

const filePath = fs.realpathSync("./");

class itemHandler {
  async getItem(req, res, next) {}
  async createItem(req, res, next) {
    const { name, time, year, introduce } = req.body;
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      time: Joi.number().required(),
      year: Joi.number().required(),
      introduce: Joi.string().required(),
    });
    try {
      if (!req.file) {
        throw {
          message: "Cần ít nhất một ảnh cho bộ phim của bạn!",
          status: 403,
          data: null,
        };
      }
      await schema.validateAsync({
        name,
        time,
        year,
        introduce,
      });
      next();
    } catch (e) {
      if (req.file) {
        fs.unlinkSync(`${filePath}\\images\\item\\${req.file.filename}`);
      }
      next(e);
    }
  }
  async updateItem(req, res, next) {
    const { name, time, year, introduce } = req.body;
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      time: Joi.number().required(),
      year: Joi.number().required(),
      introduce: Joi.string().required(),
      ID: Joi.number().required(),
    });
    const ID = req.params.id
    console.log(ID)
    try {
      await schema.validateAsync({
        ...req.body, ID
      });
      next()
    } catch (e) {
      next(e);
    }
  }
}

const itemMiddleware = new itemHandler();
export default itemMiddleware;

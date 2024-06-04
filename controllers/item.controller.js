import { itemModel } from "../models/item.model.js";
import cloudinaryService from "../service/cloudinary.service.js";
import fs from "fs";

const filePath = fs.realpathSync("./");

class itemHandler {
  async getAllItem(req, res, next) {
    const data = await itemModel.find({ isDeleted: false });
    res.status(200).json({
      message: "Tìm kiếm thành công",
      status: 200,
      data: {
        data,
      },
    });
  }
  async getSingleItem(req, res, next) {
    const params = req.params.name;
    const results = await itemModel.find({ name: params, isDeleted: false });
    if (results) {
      res.status(200).json({
        message: "Tìm kiếm thành công",
        status: 200,
        data: {
          data: results,
        },
      });
    } else {
      res.status(404).json({
        message: "Không có kết quả",
        status: 404,
        data: null,
      });
    }
  }
  async createItem(req, res, next) {
    try {
      const { name, time, year, introduce } = req.body;
      const itemURL = await cloudinaryService.postImg(
        `${filePath}\\images\\item\\${req.file.filename}`
      );
      fs.unlinkSync(`${filePath}\\images\\item\\${req.file.filename}`);

      const image = itemURL.url;
      const ID = await itemModel.countDocuments();
      const newItem = await itemModel.create({
        ID: ID + 1,
        name,
        time,
        year,
        image,
        introduce,
        isDeleted: false,
      });

      res.status(201).json({
        message: "Đã thêm một bộ phim mới",
        status: 201,
        data: {
          film: newItem,
        },
      });
    } catch (e) {
      next(e);
    }
  }
  async deleteItem(req, res, next) {
    const params = req.params.id;
    try {
      const data = await itemModel.findOneAndUpdate(
        { ID: params },
        { isDeleted: true }
      );
      if (data !== null) {
        res.status(200).json({
          message: "Thành công xóa phim",
          status: 202,
          data: {
            data,
          },
        });
      } else
        throw {
          message: "Phim bạn cần xóa không khớp",
          status: 404,
          data: null,
        };
    } catch (e) {
      next(e);
    }
  }
  async updateItem(req, res, next) {
    const ID = req.params.id
    try {
      let data
      if(req.file) {
        const itemURL = await cloudinaryService.postImg(
          `${filePath}\\images\\item\\${req.file.filename}`
        );
        const image = itemURL.url
        fs.unlinkSync(`${filePath}\\images\\item\\${req.file.filename}`);
        data = await itemModel.findOneAndUpdate({ID}, {...req.body, image})
      }
      else {
        data = await itemModel.findOneAndUpdate({ID}, ...req.body)
      }
      res.status(201).json({
        message: "Cập nhật phim thành công",
        status: 201,
        data: {
          film: data
        }
      })
    }
    catch(e) {
      next(e)
    }
  }
}

const itemController = new itemHandler();
export default itemController;

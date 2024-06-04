import { Router } from "express"
import { imageService } from "../service/image.service.js";
import itemMiddleware from "../middlewares/item.middleware.js";
import itemController from "../controllers/item.controller.js";

const itemRouter = Router();

itemRouter.get('/get/all', itemController.getAllItem)
itemRouter.get('/get/film/:name', itemController.getSingleItem)
itemRouter.post('/create', imageService.saveSingleImg('item'), itemMiddleware.createItem, itemController.createItem)
itemRouter.put('/update/:id', imageService.saveSingleImg('item'), itemMiddleware.updateItem, itemController.updateItem)
itemRouter.delete('/delete/:id', itemController.deleteItem)

export default itemRouter
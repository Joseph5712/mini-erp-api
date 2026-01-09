const express = require("express");
const ordersController = require("../controllers/orders.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {createOrderValidator,addItemValidator,updateItemValidator} = require("../validators/orders.validator");

const router = express.Router();

router.use(requireAuth);

// Orders
router.post("/", createOrderValidator, validate, ordersController.create);
router.get("/", ordersController.list);
router.get("/:id", ordersController.getById);

// Items
router.post("/:id/items", addItemValidator, validate, ordersController.addItem);
router.patch("/:id/items/:itemId", updateItemValidator, validate, ordersController.updateItem);
router.delete("/:id/items/:itemId", ordersController.removeItem);

// Actions
router.post("/:id/confirm", ordersController.confirm);
router.post("/:id/cancel", ordersController.cancel);

module.exports = router;

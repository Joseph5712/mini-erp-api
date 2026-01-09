// src/routes/products.routes.js
const express = require("express");
const productsController = require("../controllers/products.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {createProductValidator, updateProductValidator} = require("../validators/products.validator");

const router = express.Router();

router.use(requireAuth);

router.post("/", createProductValidator, validate, productsController.create);
router.get("/", productsController.list);
router.get("/:id", productsController.getById);
router.patch("/:id", updateProductValidator, validate, productsController.update);
router.delete("/:id", productsController.remove);

module.exports = router;

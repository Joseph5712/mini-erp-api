const express = require("express");
const customersController = require("../controllers/customers.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {createCustomerValidator, updateCustomerValidator,} = require("../validators/customers.validator");

const router = express.Router();

// Todas requieren login
router.use(requireAuth);

router.post("/", createCustomerValidator, validate, customersController.create);
router.get("/", customersController.list);
router.get("/:id", customersController.getById);
router.patch("/:id", updateCustomerValidator, validate, customersController.update);
router.delete("/:id", customersController.remove);

module.exports = router;

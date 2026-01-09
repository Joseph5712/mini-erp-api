const { body } = require("express-validator");

const createOrderValidator = [
    body("customer_id")
        .notEmpty()
        .withMessage("customer_id is required")
        .isUUID()
        .withMessage("customer_id must be a valid UUID"),

    body("notes")
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("notes must be <= 1000 chars"),
];

const addItemValidator = [
    body("product_id")
        .notEmpty()
        .withMessage("product_id is required")
        .isUUID()
        .withMessage("product_id must be a valid UUID"),

    body("quantity")
        .notEmpty()
        .withMessage("quantity is required")
        .isInt({ min: 1 })
        .withMessage("quantity must be >= 1"),
];

const updateItemValidator = [
    body("quantity")
        .notEmpty()
        .withMessage("quantity is required")
        .isInt({ min: 1 })
        .withMessage("quantity must be >= 1"),
];

module.exports = { createOrderValidator, addItemValidator, updateItemValidator };

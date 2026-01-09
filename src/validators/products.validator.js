// src/validators/products.validator.js
const { body } = require("express-validator");

const createProductValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("name is required")
        .isLength({ max: 120 })
        .withMessage("name must be <= 120 chars"),

    body("sku")
        .trim()
        .notEmpty()
        .withMessage("sku is required")
        .isLength({ max: 80 })
        .withMessage("sku must be <= 80 chars"),

    body("price")
        .notEmpty()
        .withMessage("price is required")
        .isFloat({ min: 0 })
        .withMessage("price must be >= 0"),

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("stock must be >= 0"),

    body("description")
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("description must be <= 1000 chars"),

    body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be boolean"),
];

const updateProductValidator = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("name cannot be empty")
        .isLength({ max: 120 })
        .withMessage("name must be <= 120 chars"),

    body("sku")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("sku cannot be empty")
        .isLength({ max: 80 })
        .withMessage("sku must be <= 80 chars"),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("price must be >= 0"),

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("stock must be >= 0"),

    body("description")
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("description must be <= 1000 chars"),

    body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active must be boolean"),
];

module.exports = { createProductValidator, updateProductValidator };

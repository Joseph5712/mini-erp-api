const { body } = require("express-validator");

const createCustomerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("name is required")
        .isLength({ max: 120 })
        .withMessage("name must be <= 120 chars"),

    body("email")
        .optional({ nullable: true })
        .isEmail()
        .withMessage("email must be valid")
        .normalizeEmail(),

    body("phone")
        .optional({ nullable: true })
        .isLength({ max: 30 })
        .withMessage("phone must be <= 30 chars"),

    body("identification")
        .optional({ nullable: true })
        .isLength({ max: 50 })
        .withMessage("identification must be <= 50 chars"),

    body("address")
        .optional({ nullable: true })
        .isLength({ max: 500 })
        .withMessage("address must be <= 500 chars"),
];

const updateCustomerValidator = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("name cannot be empty")
        .isLength({ max: 120 })
        .withMessage("name must be <= 120 chars"),

    body("email")
        .optional({ nullable: true })
        .isEmail()
        .withMessage("email must be valid")
        .normalizeEmail(),

    body("phone")
        .optional({ nullable: true })
        .isLength({ max: 30 })
        .withMessage("phone must be <= 30 chars"),

    body("identification")
        .optional({ nullable: true })
        .isLength({ max: 50 })
        .withMessage("identification must be <= 50 chars"),

    body("address")
        .optional({ nullable: true })
        .isLength({ max: 500 })
        .withMessage("address must be <= 500 chars"),
];

module.exports = { createCustomerValidator, updateCustomerValidator };

const { body } = require("express-validator");


// id
// name
// email
// password
// role
// is_active

// Validaciones para REGISTER
const registerValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 60 })
        .withMessage("Name must be between 2 and 60 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email must be valid")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
];

// Validaciones para LOGIN
const loginValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email must be valid"),

    body("password")
        .notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidator, loginValidator };
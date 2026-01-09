// src/middlewares/validate.middleware.js
const { validationResult } = require("express-validator");

function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const err = new Error("Validation error");
        err.statusCode = 400;
        err.details = errors.array();
        return next(err);
    }

    next();
}

module.exports = { validate };

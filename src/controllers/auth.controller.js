const { registeruser, loginUser } = require("../services/auth.service");

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        const result = await registeruser({ name, email, password });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const result = await loginUser({ email, password });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login };
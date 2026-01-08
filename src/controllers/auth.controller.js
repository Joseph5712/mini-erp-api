const authService = require("../services/auth.service");

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        const data = await authService.registerUser(name, email, password);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        //console.log("email: "+email);
        const { email, password } = req.body;
        const data = await authService.loginUser(email, password);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

async function me(req, res, next) {
    try {
        const user = await authService.getMe(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, me };
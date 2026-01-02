const bcrypt = require('bcrypt');
const { User} =require('pg');
const { signToken } = require("../utils/jwt");

async function registeruser(name, email, password) {
    const existing = await User.findOne({ email });

    if (existing) {
        const err = new Error('Email already in use');
        err.statusCode = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = signToken({ id: user.id, role: user.role });

    return {
        token,
        user: {
            id: user._id,
            name: user.name},
    };
}



async function loginUser(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    const token = signToken({ id: user.id, role: user.role });

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

module.exports = { registeruser, loginUser };
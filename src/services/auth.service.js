const bcrypt = require('bcrypt');
const pool = require("../config/db");
const { signToken } = require("../utils/jwt");

async function registerUser(name, email, password) {
    if (!name || !email || !password) {
        console.log("BODY:", name, email, password);
        const err = new Error("Name, email and password are required");
        err.statusCode = 400;
        throw err;
    }

    const emailLower = email.toLowerCase().trim();

    const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [emailLower]
    );

    if (existing.rows.length > 0) {
        const err = new Error("Email already in use");
        err.statusCode = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
        [name.trim(), emailLower, passwordHash, "STAFF"]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, role: user.role });

    return { token, user };
}



async function loginUser(email, password) {
    // console.log("Login attempt:", email);
    // console.log("Password provided:", password);
    if (!email || !password) {
        const err = new Error("Email and password are required");
        err.statusCode = 400;
        throw err;
    }

    const emailLower = email.toLowerCase().trim();

    const result = await pool.query(
        `SELECT id, name, email, role, password_hash, is_active
     FROM users
     WHERE email = $1
     LIMIT 1`,
        [emailLower]
    );

    if (result.rows.length === 0) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        throw err;
    }

    const row = result.rows[0];

    if (row.is_active === false) {
        const err = new Error("User is inactive");
        err.statusCode = 403;
        throw err;
    }

    const ok = await bcrypt.compare(password, row.password_hash);

    if (!ok) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        throw err;
    }

    const token = signToken({ id: row.id, role: row.role });

    const user = {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
    };

    return { token, user };
}

async function getMe(userId) {
    const result = await pool.query(
        `SELECT id, name, email, role, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
        [userId]
    );

    if (result.rows.length === 0) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    return result.rows[0];
}

module.exports = { registerUser, loginUser, getMe };
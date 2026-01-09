const pool = require("../config/db");

async function createProduct({ name, sku, description, price, stock, is_active }) {
    const result = await pool.query(
        `INSERT INTO products (name, sku, description, price, stock, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, sku, description, price, stock, is_active, created_at, updated_at`,
        [
            name.trim(),
            sku.trim(),
            description || null,
            Number(price),
            stock !== undefined ? Number(stock) : 0,
            is_active !== undefined ? Boolean(is_active) : true,
        ]
    );

    return result.rows[0];
}

async function listProducts({ page = 1, limit = 10, search = "" }) {
    const offset = (page - 1) * limit;

    const where = [];
    const values = [];

    // Solo activos por defecto (igual que customers)
    where.push(`is_active = true`);

    if (search) {
        values.push(`%${search.toLowerCase()}%`);
        where.push(`(LOWER(name) LIKE $${values.length} OR LOWER(sku) LIKE $${values.length})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total
     FROM products
     ${whereSql}`,
        values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    values.push(limit);
    values.push(offset);

    const dataResult = await pool.query(
        `SELECT id, name, sku, description, price, stock, is_active, created_at, updated_at
     FROM products
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values
    );

    return {
        meta: { page, limit, total, totalPages },
        data: dataResult.rows,
    };
}

async function getProductById(id) {
    const result = await pool.query(
        `SELECT id, name, sku, description, price, stock, is_active, created_at, updated_at
     FROM products
     WHERE id = $1
     LIMIT 1`,
        [id]
    );

    return result.rows[0] || null;
}

async function updateProduct(id, fields) {
    const allowed = ["name", "sku", "description", "price", "stock", "is_active"];
    const setParts = [];
    const values = [];

    for (const key of allowed) {
        if (fields[key] !== undefined) {
            let value = fields[key];

            if (key === "name" || key === "sku") value = String(value).trim();
            if (key === "price") value = Number(value);
            if (key === "stock") value = Number(value);
            if (key === "is_active") value = Boolean(value);

            values.push(value);
            setParts.push(`${key} = $${values.length}`);
        }
    }

    if (setParts.length === 0) {
        const err = new Error("No fields to update");
        err.statusCode = 400;
        throw err;
    }

    values.push(id);

    const result = await pool.query(
        `UPDATE products
     SET ${setParts.join(", ")}
     WHERE id = $${values.length}
     RETURNING id, name, sku, description, price, stock, is_active, created_at, updated_at`,
        values
    );

    return result.rows[0] || null;
}

async function deactivateProduct(id) {
    const result = await pool.query(
        `UPDATE products
     SET is_active = false
     WHERE id = $1
     RETURNING id, name, sku, is_active`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    createProduct,
    listProducts,
    getProductById,
    updateProduct,
    deactivateProduct,
};

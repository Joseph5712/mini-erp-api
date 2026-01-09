const pool = require("../config/db");

// Crear customer
async function createCustomer({ name, email, phone, identification, address }) {
    const result = await pool.query(
        `INSERT INTO customers (name, email, phone, identification, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, identification, address, is_active, created_at, updated_at`,
        [
            name.trim(),
            email ? email.toLowerCase().trim() : null,
            phone || null,
            identification || null,
            address || null,
        ]
    );

    return result.rows[0];
}

// Listar con paginación + búsqueda
async function listCustomers({ page = 1, limit = 10, search = "" }) {
    const offset = (page - 1) * limit;

    // Búsqueda simple por name/email
    const where = [];
    const values = [];

    // Solo activos por defecto
    where.push(`is_active = true`);

    if (search) {
        values.push(`%${search.toLowerCase()}%`);
        where.push(`(LOWER(name) LIKE $${values.length} OR LOWER(email) LIKE $${values.length})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total
    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total
     FROM customers
     ${whereSql}`,
        values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Data
    values.push(limit);
    values.push(offset);

    const dataResult = await pool.query(
        `SELECT id, name, email, phone, identification, address, is_active, created_at, updated_at
     FROM customers
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

// Detalle
async function getCustomerById(id) {
    const result = await pool.query(
        `SELECT id, name, email, phone, identification, address, is_active, created_at, updated_at
     FROM customers
     WHERE id = $1
     LIMIT 1`,
        [id]
    );

    return result.rows[0] || null;
}

// Update
async function updateCustomer(id, fields) {
    // Armamos update dinámico solo con campos enviados
    const allowed = ["name", "email", "phone", "identification", "address"];
    const setParts = [];
    const values = [];

    for (const key of allowed) {
        if (fields[key] !== undefined) {
            values.push(
                key === "name"
                    ? fields[key].trim()
                    : key === "email"
                        ? fields[key]?.toLowerCase().trim()
                        : fields[key]
            );

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
        `UPDATE customers
     SET ${setParts.join(", ")}
     WHERE id = $${values.length}
     RETURNING id, name, email, phone, identification, address, is_active, created_at, updated_at`,
        values
    );

    return result.rows[0] || null;
}

// Soft delete (is_active=false)
async function deactivateCustomer(id) {
    const result = await pool.query(
        `UPDATE customers
     SET is_active = false
     WHERE id = $1
     RETURNING id, name, email, is_active`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    createCustomer,
    listCustomers,
    getCustomerById,
    updateCustomer,
    deactivateCustomer,
};

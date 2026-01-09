const pool = require("../config/db");

// Helper: convertir from/to (YYYY-MM-DD) a rango usable
function buildDateRange(from, to) {
    // Si no mandan fechas, por defecto no filtra
    if (!from || !to) return { where: "", values: [] };

    const values = [from, to];
    const where = `AND o.confirmed_at::date BETWEEN $1::date AND $2::date`;
    return { where, values };
}

async function salesSummary({ from, to }) {
    const { where, values } = buildDateRange(from, to);

    const res = await pool.query(
        `SELECT
        COUNT(*)::int AS orders_count,
        COALESCE(SUM(o.total), 0)::numeric(12,2) AS total_sales
     FROM orders o
     WHERE o.status = 'CONFIRMED'
     ${where}`,
        values
    );

    return res.rows[0];
}

async function topProducts({ from, to, limit = 10 }) {
    const { where, values } = buildDateRange(from, to);

    values.push(limit);

    const res = await pool.query(
        `SELECT
        p.id,
        p.name,
        p.sku,
        COALESCE(SUM(oi.quantity), 0)::int AS qty_sold,
        COALESCE(SUM(oi.line_total), 0)::numeric(12,2) AS revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'CONFIRMED'
     ${where}
     GROUP BY p.id, p.name, p.sku
     ORDER BY qty_sold DESC
     LIMIT $${values.length}`,
        values
    );

    return res.rows;
}

async function topCustomers({ from, to, limit = 10 }) {
    const { where, values } = buildDateRange(from, to);

    values.push(limit);

    const res = await pool.query(
        `SELECT
        c.id,
        c.name,
        c.email,
        COUNT(o.id)::int AS orders_count,
        COALESCE(SUM(o.total), 0)::numeric(12,2) AS total_spent
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.status = 'CONFIRMED'
     ${where}
     GROUP BY c.id, c.name, c.email
     ORDER BY total_spent DESC
     LIMIT $${values.length}`,
        values
    );

    return res.rows;
}

module.exports = { salesSummary, topProducts, topCustomers };

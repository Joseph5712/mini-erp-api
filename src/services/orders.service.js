const pool = require("../config/db");

function calcTotals(items, taxRate = 0.13) {
    // subtotal = suma line_total
    const subtotal = items.reduce((acc, it) => acc + Number(it.line_total), 0);

    // impuesto simple (puedes hacerlo configurable)
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    return { subtotal, tax, total };
}

async function createOrder({ customer_id, notes }, createdBy) {
    const result = await pool.query(
        `INSERT INTO orders (customer_id, created_by, status, notes)
     VALUES ($1, $2, 'DRAFT', $3)
     RETURNING id, customer_id, created_by, status, notes, subtotal, tax, total, created_at, updated_at`,
        [customer_id, createdBy, notes || null]
    );

    return result.rows[0];
}

async function getOrderById(orderId) {
    const orderRes = await pool.query(
        `SELECT o.*, c.name AS customer_name, c.email AS customer_email
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.id = $1
     LIMIT 1`,
        [orderId]
    );

    const order = orderRes.rows[0];
    if (!order) return null;

    const itemsRes = await pool.query(
        `SELECT oi.*, p.name AS product_name, p.sku AS product_sku
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.created_at ASC`,
        [orderId]
    );

    return { order, items: itemsRes.rows };
}

async function listOrders({ page = 1, limit = 10, status, search }) {
    const offset = (page - 1) * limit;

    const where = [];
    const values = [];

    if (status) {
        values.push(status);
        where.push(`o.status = $${values.length}`);
    }

    if (search) {
        values.push(`%${search.toLowerCase()}%`);
        where.push(`(LOWER(c.name) LIKE $${values.length} OR LOWER(c.email) LIKE $${values.length})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRes = await pool.query(
        `SELECT COUNT(*)::int AS total
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ${whereSql}`,
        values
    );

    const total = countRes.rows[0].total;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    values.push(limit);
    values.push(offset);

    const dataRes = await pool.query(
        `SELECT o.id, o.status, o.subtotal, o.tax, o.total, o.created_at, o.confirmed_at,
            c.name AS customer_name, c.email AS customer_email
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ${whereSql}
     ORDER BY o.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values
    );

    return { meta: { page, limit, total, totalPages }, data: dataRes.rows };
}

async function assertOrderIsDraft(orderId) {
    const res = await pool.query(`SELECT status FROM orders WHERE id = $1 LIMIT 1`, [orderId]);
    if (res.rows.length === 0) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }
    if (res.rows[0].status !== "DRAFT") {
        const err = new Error("Order is not editable (must be DRAFT)");
        err.statusCode = 409;
        throw err;
    }
}

async function addItem(orderId, { product_id, quantity }) {
    await assertOrderIsDraft(orderId);

    // Traer precio actual del producto y validar activo
    const pRes = await pool.query(
        `SELECT id, price, is_active FROM products WHERE id = $1 LIMIT 1`,
        [product_id]
    );
    if (pRes.rows.length === 0) {
        const err = new Error("Product not found");
        err.statusCode = 404;
        throw err;
    }
    if (!pRes.rows[0].is_active) {
        const err = new Error("Product is inactive");
        err.statusCode = 409;
        throw err;
    }

    const unitPrice = Number(pRes.rows[0].price);
    const qty = Number(quantity);
    const lineTotal = Number((unitPrice * qty).toFixed(2));

    // Insert item (si ya existe el mismo product en la orden, por el unique index fallará)
    try {
        const result = await pool.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, order_id, product_id, quantity, unit_price, line_total, created_at, updated_at`,
            [orderId, product_id, qty, unitPrice, lineTotal]
        );

        return result.rows[0];
    } catch (err) {
        // 23505 => unique violation (order_id, product_id)
        if (err.code === "23505") {
            const e = new Error("Product already added to this order");
            e.statusCode = 409;
            throw e;
        }
        throw err;
    }
}

async function updateItemQuantity(orderId, itemId, quantity) {
    await assertOrderIsDraft(orderId);

    // Obtener el item (para recalcular)
    const itemRes = await pool.query(
        `SELECT id, unit_price FROM order_items WHERE id = $1 AND order_id = $2 LIMIT 1`,
        [itemId, orderId]
    );

    if (itemRes.rows.length === 0) {
        const err = new Error("Item not found");
        err.statusCode = 404;
        throw err;
    }

    const unitPrice = Number(itemRes.rows[0].unit_price);
    const qty = Number(quantity);
    const lineTotal = Number((unitPrice * qty).toFixed(2));

    const result = await pool.query(
        `UPDATE order_items
     SET quantity = $1, line_total = $2
     WHERE id = $3 AND order_id = $4
     RETURNING id, order_id, product_id, quantity, unit_price, line_total, created_at, updated_at`,
        [qty, lineTotal, itemId, orderId]
    );

    return result.rows[0];
}

async function removeItem(orderId, itemId) {
    await assertOrderIsDraft(orderId);

    const result = await pool.query(
        `DELETE FROM order_items
     WHERE id = $1 AND order_id = $2
     RETURNING id`,
        [itemId, orderId]
    );

    if (result.rows.length === 0) {
        const err = new Error("Item not found");
        err.statusCode = 404;
        throw err;
    }

    return true;
}

async function recalcAndSaveTotals(orderId) {
    const itemsRes = await pool.query(
        `SELECT line_total FROM order_items WHERE order_id = $1`,
        [orderId]
    );

    const items = itemsRes.rows;
    const { subtotal, tax, total } = calcTotals(items);

    const upd = await pool.query(
        `UPDATE orders
     SET subtotal = $1, tax = $2, total = $3
     WHERE id = $4
     RETURNING subtotal, tax, total`,
        [subtotal, tax, total, orderId]
    );

    return upd.rows[0];
}

async function confirmOrder(orderId) {
    // Transacción: o se hace todo o nada
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // bloquear la orden para evitar confirmaciones simultáneas
        const oRes = await client.query(
            `SELECT status FROM orders WHERE id = $1 FOR UPDATE`,
            [orderId]
        );

        if (oRes.rows.length === 0) {
            const err = new Error("Order not found");
            err.statusCode = 404;
            throw err;
        }

        if (oRes.rows[0].status !== "DRAFT") {
            const err = new Error("Only DRAFT orders can be confirmed");
            err.statusCode = 409;
            throw err;
        }

        // items
        const itemsRes = await client.query(
            `SELECT product_id, quantity, unit_price, line_total
       FROM order_items
       WHERE order_id = $1`,
            [orderId]
        );

        const items = itemsRes.rows;
        if (items.length === 0) {
            const err = new Error("Cannot confirm an order with no items");
            err.statusCode = 400;
            throw err;
        }

        // validar stock por cada item
        for (const it of items) {
            const pRes = await client.query(
                `SELECT stock, is_active FROM products WHERE id = $1 FOR UPDATE`,
                [it.product_id]
            );

            if (pRes.rows.length === 0) {
                const err = new Error("Product not found in order items");
                err.statusCode = 404;
                throw err;
            }

            if (!pRes.rows[0].is_active) {
                const err = new Error("Order contains inactive product");
                err.statusCode = 409;
                throw err;
            }

            const stock = Number(pRes.rows[0].stock);
            const qty = Number(it.quantity);

            if (stock < qty) {
                const err = new Error(`Insufficient stock for product ${it.product_id}`);
                err.statusCode = 409;
                throw err;
            }
        }

        // descontar stock
        for (const it of items) {
            await client.query(
                `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
                [it.quantity, it.product_id]
            );
        }

        // calcular totales
        const { subtotal, tax, total } = calcTotals(items);

        // actualizar order
        const updRes = await client.query(
            `UPDATE orders
       SET status = 'CONFIRMED',
           subtotal = $1,
           tax = $2,
           total = $3,
           confirmed_at = NOW()
       WHERE id = $4
       RETURNING id, status, subtotal, tax, total, confirmed_at`,
            [subtotal, tax, total, orderId]
        );

        await client.query("COMMIT");

        return updRes.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function cancelOrder(orderId) {
    const res = await pool.query(
        `UPDATE orders
     SET status = 'CANCELLED'
     WHERE id = $1 AND status != 'CANCELLED'
     RETURNING id, status`,
        [orderId]
    );

    if (res.rows.length === 0) {
        const err = new Error("Order not found or already cancelled");
        err.statusCode = 404;
        throw err;
    }

    return res.rows[0];
}

module.exports = {
    createOrder,
    getOrderById,
    listOrders,
    addItem,
    updateItemQuantity,
    removeItem,
    recalcAndSaveTotals,
    confirmOrder,
    cancelOrder,
};

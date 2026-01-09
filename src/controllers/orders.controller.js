// src/controllers/orders.controller.js
const ordersService = require("../services/orders.service");

async function create(req, res, next) {
    try {
        const order = await ordersService.createOrder(req.body, req.user.id);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
}

async function list(req, res, next) {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);
        const status = req.query.status ? String(req.query.status).trim() : undefined;
        const search = req.query.search ? String(req.query.search).trim() : undefined;

        const result = await ordersService.listOrders({ page, limit, status, search });
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const result = await ordersService.getOrderById(req.params.id);
        if (!result) {
            const err = new Error("Order not found");
            err.statusCode = 404;
            throw err;
        }
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

async function addItem(req, res, next) {
    try {
        const item = await ordersService.addItem(req.params.id, req.body);
        // opcional: recalcular totales en draft cada vez que cambias items
        const totals = await ordersService.recalcAndSaveTotals(req.params.id);
        res.status(201).json({ success: true, data: { item, totals } });
    } catch (err) {
        next(err);
    }
}

async function updateItem(req, res, next) {
    try {
        const item = await ordersService.updateItemQuantity(
            req.params.id,
            req.params.itemId,
            req.body.quantity
        );
        const totals = await ordersService.recalcAndSaveTotals(req.params.id);
        res.json({ success: true, data: { item, totals } });
    } catch (err) {
        next(err);
    }
}

async function removeItem(req, res, next) {
    try {
        await ordersService.removeItem(req.params.id, req.params.itemId);
        const totals = await ordersService.recalcAndSaveTotals(req.params.id);
        res.json({ success: true, data: { ok: true, totals } });
    } catch (err) {
        next(err);
    }
}

async function confirm(req, res, next) {
    try {
        const confirmed = await ordersService.confirmOrder(req.params.id);
        res.json({ success: true, data: confirmed });
    } catch (err) {
        next(err);
    }
}

async function cancel(req, res, next) {
    try {
        const cancelled = await ordersService.cancelOrder(req.params.id);
        res.json({ success: true, data: cancelled });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    create,
    list,
    getById,
    addItem,
    updateItem,
    removeItem,
    confirm,
    cancel,
};

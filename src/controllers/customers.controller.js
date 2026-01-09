const customersService = require("../services/customers.service");

async function create(req, res, next) {
    try {
        const customer = await customersService.createCustomer(req.body);
        res.status(201).json({ success: true, data: customer });
    } catch (err) {
        // email unique puede explotar aquí
        if (err.code === "23505") {
            err.statusCode = 409;
            err.message = "Email already exists";
        }
        next(err);
    }
}

async function list(req, res, next) {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);
        const search = (req.query.search || "").trim();

        const result = await customersService.listCustomers({ page, limit, search });
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const customer = await customersService.getCustomerById(req.params.id);

        if (!customer) {
            const err = new Error("Customer not found");
            err.statusCode = 404;
            throw err;
        }

        res.json({ success: true, data: customer });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const updated = await customersService.updateCustomer(req.params.id, req.body);

        if (!updated) {
            const err = new Error("Customer not found");
            err.statusCode = 404;
            throw err;
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        if (err.code === "23505") {
            err.statusCode = 409;
            err.message = "Email already exists";
        }
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const updated = await customersService.deactivateCustomer(req.params.id);

        if (!updated) {
            const err = new Error("Customer not found");
            err.statusCode = 404;
            throw err;
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
}

module.exports = { create, list, getById, update, remove };

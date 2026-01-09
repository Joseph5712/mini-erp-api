const productsService = require("../services/products.service");

async function create(req, res, next) {
    try {
        const product = await productsService.createProduct(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        if (err.code === "23505") {
            err.statusCode = 409;
            err.message = "SKU already exists";
        }
        next(err);
    }
}

async function list(req, res, next) {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);
        const search = (req.query.search || "").trim();

        const result = await productsService.listProducts({ page, limit, search });
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const product = await productsService.getProductById(req.params.id);

        if (!product) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const updated = await productsService.updateProduct(req.params.id, req.body);

        if (!updated) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        if (err.code === "23505") {
            err.statusCode = 409;
            err.message = "SKU already exists";
        }
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const updated = await productsService.deactivateProduct(req.params.id);

        if (!updated) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
}

module.exports = { create, list, getById, update, remove };

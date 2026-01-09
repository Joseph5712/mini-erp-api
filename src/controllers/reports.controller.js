const reportsService = require("../services/reports.service");

async function sales(req, res, next) {
    try {
        const from = req.query.from;
        const to = req.query.to;

        const data = await reportsService.salesSummary({ from, to });

        res.json({ success: true, data: { from, to, ...data } });
    } catch (err) {
        next(err);
    }
}

async function topProducts(req, res, next) {
    try {
        const from = req.query.from;
        const to = req.query.to;
        const limit = Number(req.query.limit || 10);

        const data = await reportsService.topProducts({ from, to, limit });

        res.json({ success: true, data: { from, to, limit, rows: data } });
    } catch (err) {
        next(err);
    }
}

async function topCustomers(req, res, next) {
    try {
        const from = req.query.from;
        const to = req.query.to;
        const limit = Number(req.query.limit || 10);

        const data = await reportsService.topCustomers({ from, to, limit });

        res.json({ success: true, data: { from, to, limit, rows: data } });
    } catch (err) {
        next(err);
    }
}

module.exports = { sales, topProducts, topCustomers };

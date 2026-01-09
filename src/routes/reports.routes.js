// src/routes/reports.routes.js
const express = require("express");
const reportsController = require("../controllers/reports.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/sales", reportsController.sales);
router.get("/top-products", reportsController.topProducts);
router.get("/top-customers", reportsController.topCustomers);

module.exports = router;

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const customersRoutes = require("./routes/customers.routes");
const productsRoutes = require("./routes/products.routes");
const ordersRoutes = require("./routes/orders.routes");




const app = express();

app.use(cors());
app.use(express.json());



app.get("/health", (req, res) => {
    res.status(200).json({ ok: true, message: "API is running" });
});

app.use("/api/customers", customersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

app.use("/api/auth", authRoutes);
//app.use("/api/users", usersRoutes);



module.exports = app;
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");



const app = express();

app.use(cors());
app.use(express.json());



app.get("/health", (req, res) => {
    res.status(200).json({ ok: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
//app.use("/api/users", usersRoutes);



module.exports = app;
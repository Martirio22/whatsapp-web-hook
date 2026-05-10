const express = require("express");
const cors = require("cors");

const registerWhatsappModule = require("./lib/Whatsapp/Infraestructura/http");

function buildApp() {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: "25mb" }));
    app.use(express.urlencoded({ extended: true, limit: "25mb" }));

    app.get("/", (req, res) => {
        return res.status(200).json({
            status: "success",
            message: "Webhook WhatsApp Hexagonal funcionando correctamente"
        });
    });

    registerWhatsappModule(app);

    app.use((req, res) => {
        return res.status(404).json({
            status: "error",
            message: "Ruta no encontrada"
        });
    });

    app.use((err, req, res, next) => {
        console.error("Error no controlado:", err);

        return res.status(err.statusCode || 500).json({
            status: "error",
            message: err.message || "Error interno del servidor"
        });
    });

    return app;
}

module.exports = buildApp;
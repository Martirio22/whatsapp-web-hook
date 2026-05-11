const express = require("express");
const router = express.Router();

module.exports = (controller) => {
    router.post("/lineas", controller.crearLinea);

    router.get("/lineas", controller.listarLineas);

    router.get("/lineas/:lineaId/estado", controller.obtenerEstado);

    router.get("/lineas/:lineaId/qr", controller.obtenerQr);

    router.get("/lineas/:lineaId/chats", controller.obtenerChats);

    router.post("/mensajes/texto", controller.enviarTexto);

    router.post("/mensajes/media-url", controller.enviarMediaUrl);

    router.post("/mensajes/ubicacion", controller.enviarUbicacion);

    router.post("/chats/marcar-leido", controller.marcarLeido);

    router.delete("/lineas/:lineaId", controller.desconectarLinea);

    return router;
};
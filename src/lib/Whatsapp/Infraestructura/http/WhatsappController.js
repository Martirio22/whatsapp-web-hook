class WhatsappController {
    constructor({
        crearLineaWhatsapp,
        listarLineasWhatsapp,
        obtenerEstadoLinea,
        obtenerQrLinea,
        obtenerChatsLinea,
        enviarMensajeTexto,
        enviarMediaUrl,
        enviarUbicacion,
        marcarChatComoLeido,
        desconectarLinea
    }) {
        this.crearLineaWhatsapp = crearLineaWhatsapp;
        this.listarLineasWhatsapp = listarLineasWhatsapp;
        this.obtenerEstadoLinea = obtenerEstadoLinea;
        this.obtenerQrLinea = obtenerQrLinea;
        this.obtenerChatsLinea = obtenerChatsLinea;
        this.enviarMensajeTexto = enviarMensajeTexto;
        this.enviarMediaUrl = enviarMediaUrl;
        this.enviarUbicacion = enviarUbicacion;
        this.marcarChatComoLeido = marcarChatComoLeido;
        this.desconectarLinea = desconectarLinea;
    }

    crearLinea = async (req, res) => {
        try {
            const linea = await this.crearLineaWhatsapp.ejecutar(req.body);

            return res.status(201).json({
                status: "success",
                message: "Línea de WhatsApp creada correctamente",
                data: linea
            });
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    };

    listarLineas = async (req, res) => {
        try {
            const lineas = await this.listarLineasWhatsapp.ejecutar();

            return res.status(200).json({
                status: "success",
                total: lineas.length,
                data: lineas
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    };

    obtenerEstado = async (req, res) => {
        try {
            const estado = await this.obtenerEstadoLinea.ejecutar(req.params.lineaId);

            return res.status(200).json({
                status: "success",
                data: estado
            });
        } catch (error) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
    };

    obtenerQr = async (req, res) => {
        try {
            const qr = await this.obtenerQrLinea.ejecutar(req.params.lineaId);

            return res.status(200).json({
                status: "success",
                data: qr
            });
        } catch (error) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
    };

    obtenerChats = async (req, res) => {
        try {
            const chats = await this.obtenerChatsLinea.ejecutar(req.params.lineaId);

            return res.status(200).json({
                status: "success",
                total: chats.length,
                data: chats
            });
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    };

    enviarTexto = async (req, res) => {
        try {
            const response = await this.enviarMensajeTexto.ejecutar(req.body);

            return res.status(200).json({
                status: "success",
                message: "Mensaje enviado correctamente",
                data: response
            });
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    };

    enviarMediaUrl = async (req, res) => {
        try {
            const response = await this.enviarMediaUrl.ejecutar(req.body);

            return res.status(200).json({
                status: "success",
                message: "Media enviada correctamente",
                data: response
            });
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    };

    enviarUbicacion = async (req, res) => {
        try {
            const response = await this.enviarUbicacion.ejecutar(req.body);

            return res.status(200).json({
                status: "success",
                message: "Ubicación enviada correctamente",
                data: response
            });
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    };

    marcarLeido = async (req, res) => {
        try {
            const response = await this.marcarChatComoLeido.ejecutar(req.body);

            return res.status(200).json({
                status: "success",
                message: "Chat marcado como leído",
                data: response
            });
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    };

    desconectarLinea = async (req, res) => {
        try {
            const response = await this.desconectarLinea.ejecutar(req.params.lineaId);

            return res.status(200).json({
                status: "success",
                message: "Línea desconectada correctamente",
                data: response
            });
        } catch (error) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    };
}

module.exports = WhatsappController;
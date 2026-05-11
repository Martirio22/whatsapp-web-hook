const WhatsappRoutes = require("./WhatsappRoutes");
const WhatsappController = require("./WhatsappController");

const WhatsappClientRepositoryWebJs = require("../WhatsappClientRepositoryWebJs");
const BackendWebhookPublisherHttp = require("../../../../Infraestructura/backend/BackendWebhookPublisherHttp");

const CrearLineaWhatsapp = require("../../Aplicacion/CrearLineaWhatsapp");
const ListarLineasWhatsapp = require("../../Aplicacion/ListarLineasWhatsapp");
const ObtenerEstadoLinea = require("../../Aplicacion/ObtenerEstadoLinea");
const ObtenerQrLinea = require("../../Aplicacion/ObtenerQrLinea");
const ObtenerChatsLinea = require("../../Aplicacion/ObtenerChatsLinea");
const EnviarMensajeTexto = require("../../Aplicacion/EnviarMensajeTexto");
const EnviarMediaUrl = require("../../Aplicacion/EnviarMediaUrl");
const EnviarUbicacion = require("../../Aplicacion/EnviarUbicacion");
const MarcarChatComoLeido = require("../../Aplicacion/MarcarChatComoLeido");
const DesconectarLinea = require("../../Aplicacion/DesconectarLinea");

const backendWebhookPublisher = new BackendWebhookPublisherHttp();

const whatsappRepository = new WhatsappClientRepositoryWebJs({
    backendWebhookPublisher
});

module.exports = function registerWhatsappModule(app) {
    const controller = new WhatsappController({
        crearLineaWhatsapp: new CrearLineaWhatsapp(whatsappRepository),
        listarLineasWhatsapp: new ListarLineasWhatsapp(whatsappRepository),
        obtenerEstadoLinea: new ObtenerEstadoLinea(whatsappRepository),
        obtenerQrLinea: new ObtenerQrLinea(whatsappRepository),
        obtenerChatsLinea: new ObtenerChatsLinea(whatsappRepository),
        enviarMensajeTexto: new EnviarMensajeTexto(whatsappRepository),
        enviarMediaUrl: new EnviarMediaUrl(whatsappRepository),
        enviarUbicacion: new EnviarUbicacion(whatsappRepository),
        marcarChatComoLeido: new MarcarChatComoLeido(whatsappRepository),
        desconectarLinea: new DesconectarLinea(whatsappRepository)
    });

    app.use("/api/whatsapp", WhatsappRoutes(controller));
};
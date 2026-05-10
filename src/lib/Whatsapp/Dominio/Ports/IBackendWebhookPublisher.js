class IBackendWebhookPublisher {
    async publicar(evento, payload) {
        throw new Error("Método publicar no implementado");
    }
}

module.exports = IBackendWebhookPublisher;
class IWhatsappClientRepository {
    async crearLinea(data) {
        throw new Error("Método crearLinea no implementado");
    }

    async listarLineas() {
        throw new Error("Método listarLineas no implementado");
    }

    async obtenerEstado(lineaId) {
        throw new Error("Método obtenerEstado no implementado");
    }

    async obtenerQr(lineaId) {
        throw new Error("Método obtenerQr no implementado");
    }

    async obtenerChats(lineaId) {
        throw new Error("Método obtenerChats no implementado");
    }

    async enviarMensajeTexto(lineaId, telefono, mensaje) {
        throw new Error("Método enviarMensajeTexto no implementado");
    }

    async enviarMediaUrl(lineaId, telefono, url, caption) {
        throw new Error("Método enviarMediaUrl no implementado");
    }

    async enviarUbicacion(lineaId, telefono, latitud, longitud, descripcion) {
        throw new Error("Método enviarUbicacion no implementado");
    }

    async marcarChatComoLeido(lineaId, telefono) {
        throw new Error("Método marcarChatComoLeido no implementado");
    }

    async desconectarLinea(lineaId) {
        throw new Error("Método desconectarLinea no implementado");
    }
}

module.exports = IWhatsappClientRepository;
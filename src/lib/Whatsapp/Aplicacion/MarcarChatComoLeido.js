class MarcarChatComoLeido {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar(data) {
        const { lineaId, telefono } = data;

        if (!lineaId) throw new Error("lineaId requerido");
        if (!telefono) throw new Error("telefono requerido");

        return await this.whatsappRepository.marcarChatComoLeido(lineaId, telefono);
    }
}

module.exports = MarcarChatComoLeido;
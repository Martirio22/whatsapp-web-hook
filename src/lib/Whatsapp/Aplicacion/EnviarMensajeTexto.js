class EnviarMensajeTexto {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar(data) {
        const { lineaId, telefono, mensaje } = data;

        if (!lineaId) throw new Error("lineaId requerido");
        if (!telefono) throw new Error("telefono requerido");
        if (!mensaje) throw new Error("mensaje requerido");

        return await this.whatsappRepository.enviarMensajeTexto(
            lineaId,
            telefono,
            mensaje
        );
    }
}

module.exports = EnviarMensajeTexto;
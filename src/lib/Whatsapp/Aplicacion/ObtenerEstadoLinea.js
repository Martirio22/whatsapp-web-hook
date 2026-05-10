class ObtenerEstadoLinea {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar(lineaId) {
        if (!lineaId) throw new Error("lineaId requerido");

        return await this.whatsappRepository.obtenerEstado(lineaId);
    }
}

module.exports = ObtenerEstadoLinea;
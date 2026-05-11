class DesconectarLinea {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar(lineaId) {
        if (!lineaId) throw new Error("lineaId requerido");

        return await this.whatsappRepository.desconectarLinea(lineaId);
    }
}

module.exports = DesconectarLinea;
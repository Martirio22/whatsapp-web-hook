class ListarLineasWhatsapp {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar() {
        return await this.whatsappRepository.listarLineas();
    }
}

module.exports = ListarLineasWhatsapp;
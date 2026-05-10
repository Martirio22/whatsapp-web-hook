class CrearLineaWhatsapp {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar(data) {
        return await this.whatsappRepository.crearLinea(data);
    }
}

module.exports = CrearLineaWhatsapp;
class EnviarMediaUrl {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar(data) {
        const { lineaId, telefono, url, caption } = data;

        if (!lineaId) throw new Error("lineaId requerido");
        if (!telefono) throw new Error("telefono requerido");
        if (!url) throw new Error("url requerida");

        return await this.whatsappRepository.enviarMediaUrl(
            lineaId,
            telefono,
            url,
            caption
        );
    }
}

module.exports = EnviarMediaUrl;
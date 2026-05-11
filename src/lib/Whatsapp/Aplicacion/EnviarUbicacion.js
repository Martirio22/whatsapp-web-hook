class EnviarUbicacion {
    constructor(whatsappRepository) {
        this.whatsappRepository = whatsappRepository;
    }

    async ejecutar(data) {
        const { lineaId, telefono, latitud, longitud, descripcion } = data;

        if (!lineaId) throw new Error("lineaId requerido");
        if (!telefono) throw new Error("telefono requerido");
        if (latitud === undefined || latitud === null) {
            throw new Error("latitud requerida");
        }
        if (longitud === undefined || longitud === null) {
            throw new Error("longitud requerida");
        }

        return await this.whatsappRepository.enviarUbicacion(
            lineaId,
            telefono,
            latitud,
            longitud,
            descripcion
        );
    }
}

module.exports = EnviarUbicacion;
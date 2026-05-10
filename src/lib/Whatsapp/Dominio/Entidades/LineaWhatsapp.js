class LineaWhatsapp {
    constructor({
        id,
        nombre,
        estado = "CREADA",
        qr = null,
        telefono = null,
        pushname = null,
        plataforma = null,
        fechaCreacion = new Date()
    }) {
        if (!id) throw new Error("El id de la línea es requerido");
        if (!nombre) throw new Error("El nombre de la línea es requerido");

        this.id = String(id).trim();
        this.nombre = String(nombre).trim();
        this.estado = estado;
        this.qr = qr;
        this.telefono = telefono;
        this.pushname = pushname;
        this.plataforma = plataforma;
        this.fechaCreacion = fechaCreacion;
    }
}

module.exports = LineaWhatsapp;
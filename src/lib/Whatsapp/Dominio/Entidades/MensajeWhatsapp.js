class MensajeWhatsapp {
    constructor({
        lineaId,
        messageId = null,
        telefono,
        nombreContacto = null,
        mensaje = "",
        tipo = "text",
        fromMe = false,
        tieneMedia = false,
        ack = null,
        estado = "DESCONOCIDO",
        timestamp = null,
        fecha = new Date()
    }) {
        if (!lineaId) throw new Error("lineaId requerido");
        if (!telefono) throw new Error("telefono requerido");

        this.lineaId = lineaId;
        this.messageId = messageId;
        this.telefono = telefono;
        this.nombreContacto = nombreContacto;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.fromMe = Boolean(fromMe);
        this.tieneMedia = Boolean(tieneMedia);
        this.ack = ack;
        this.estado = estado;
        this.timestamp = timestamp;
        this.fecha = fecha;
    }
}

module.exports = MensajeWhatsapp;
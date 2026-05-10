class ChatWhatsapp {
    constructor({
        lineaId,
        telefono,
        nombre = null,
        ultimoMensaje = "",
        fechaUltimoMensaje = null,
        unreadCount = 0
    }) {
        if (!lineaId) throw new Error("lineaId requerido");
        if (!telefono) throw new Error("telefono requerido");

        this.lineaId = lineaId;
        this.telefono = telefono;
        this.nombre = nombre;
        this.ultimoMensaje = ultimoMensaje;
        this.fechaUltimoMensaje = fechaUltimoMensaje;
        this.unreadCount = unreadCount;
    }
}

module.exports = ChatWhatsapp;
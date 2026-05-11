const {
    Client,
    LocalAuth,
    MessageMedia,
    Location
} = require("whatsapp-web.js");

const qrcodeTerminal = require("qrcode-terminal");
const qrcode = require("qrcode");

const LineaWhatsapp = require("../Dominio/Entidades/LineaWhatsapp");
const ChatWhatsapp = require("../Dominio/Entidades/ChatWhatsapp");

const {
    emitToAll,
    emitToLinea,
    emitToChat
} = require("../../../Infraestructura/websocket/SocketServer");

class WhatsappClientRepositoryWebJs {
    constructor({ backendWebhookPublisher }) {
        this.lineas = new Map();
        this.backendWebhookPublisher = backendWebhookPublisher;
    }

    async crearLinea(data) {
        const { lineaId, nombre } = data;

        if (!lineaId) throw new Error("lineaId requerido");
        if (!nombre) throw new Error("nombre requerido");

        if (this.lineas.has(lineaId)) {
            return this._toLineaResponse(lineaId);
        }

        const linea = new LineaWhatsapp({
            id: lineaId,
            nombre,
            estado: "INICIALIZANDO"
        });

        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: lineaId,
                dataPath: process.env.WA_AUTH_PATH || ".wwebjs_auth"
            }),
            puppeteer: {
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--disable-gpu"
                ]
            }
        });

        const registro = {
            linea,
            client,
            qrTexto: null,
            qrBase64: null,
            conectado: false,
            inicializado: false,
            chatsCache: new Map(),
            mensajesCache: new Map()
        };

        this.lineas.set(lineaId, registro);

        this._registrarEventosCliente(lineaId, nombre, client, registro);

        client.initialize();

        return this._toLineaResponse(lineaId);
    }

    async listarLineas() {
        return Array.from(this.lineas.keys()).map((lineaId) =>
            this._toLineaResponse(lineaId)
        );
    }

    async obtenerEstado(lineaId) {
        this._validarLineaExiste(lineaId);

        return this._toLineaResponse(lineaId);
    }

    async obtenerQr(lineaId) {
        this._validarLineaExiste(lineaId);

        const registro = this.lineas.get(lineaId);

        return {
            lineaId,
            estado: registro.linea.estado,
            qr: registro.qrBase64,
            tieneQr: Boolean(registro.qrBase64)
        };
    }

    async obtenerChats(lineaId) {
        const registro = this._obtenerRegistroConectado(lineaId);

        const chats = await registro.client.getChats();

        const chatsDirectos = chats.filter((chat) => {
            if (!chat) return false;
            if (chat.isGroup) return false;
            if (!chat.id || !chat.id._serialized) return false;
            if (chat.id._serialized.includes("@g.us")) return false;
            if (chat.id._serialized === "status@broadcast") return false;

            return true;
        });

        const resultado = chatsDirectos.map((chat) => {
            const telefono = this._extraerTelefono(chat.id._serialized);

            return new ChatWhatsapp({
                lineaId,
                telefono,
                nombre: chat.name || telefono,
                ultimoMensaje: chat.lastMessage?.body || "",
                fechaUltimoMensaje: chat.timestamp
                    ? new Date(chat.timestamp * 1000)
                    : null,
                unreadCount: chat.unreadCount || 0
            });
        });

        return resultado;
    }

    async enviarMensajeTexto(lineaId, telefono, mensaje) {
        const registro = this._obtenerRegistroConectado(lineaId);

        const chatId = this._crearChatId(telefono);

        const response = await registro.client.sendMessage(chatId, mensaje);

        const mensajeNormalizado = await this._normalizarMensaje(lineaId, response);

        if (mensajeNormalizado) {
            this._guardarMensajeCache(registro, mensajeNormalizado);

            await this._emitirEventoChat(
                "whatsapp:message_sent",
                lineaId,
                mensajeNormalizado.telefono,
                mensajeNormalizado
            );

            await this._publicarBackend("whatsapp.message.sent", mensajeNormalizado);
        }

        return {
            enviado: true,
            data: mensajeNormalizado
        };
    }

    async enviarMediaUrl(lineaId, telefono, url, caption = "") {
        const registro = this._obtenerRegistroConectado(lineaId);

        const chatId = this._crearChatId(telefono);

        const media = await MessageMedia.fromUrl(url);

        const response = await registro.client.sendMessage(chatId, media, {
            caption
        });

        const mensajeNormalizado = await this._normalizarMensaje(lineaId, response);

        if (mensajeNormalizado) {
            this._guardarMensajeCache(registro, mensajeNormalizado);

            await this._emitirEventoChat(
                "whatsapp:message_sent",
                lineaId,
                mensajeNormalizado.telefono,
                mensajeNormalizado
            );

            await this._publicarBackend("whatsapp.message.sent", mensajeNormalizado);
        }

        return {
            enviado: true,
            data: mensajeNormalizado
        };
    }

    async enviarUbicacion(lineaId, telefono, latitud, longitud, descripcion = "") {
        const registro = this._obtenerRegistroConectado(lineaId);

        const chatId = this._crearChatId(telefono);

        const location = new Location(
            Number(latitud),
            Number(longitud),
            descripcion
        );

        const response = await registro.client.sendMessage(chatId, location);

        const mensajeNormalizado = await this._normalizarMensaje(lineaId, response);

        if (mensajeNormalizado) {
            this._guardarMensajeCache(registro, mensajeNormalizado);

            await this._emitirEventoChat(
                "whatsapp:message_sent",
                lineaId,
                mensajeNormalizado.telefono,
                mensajeNormalizado
            );

            await this._publicarBackend("whatsapp.message.sent", mensajeNormalizado);
        }

        return {
            enviado: true,
            data: mensajeNormalizado
        };
    }

    async marcarChatComoLeido(lineaId, telefono) {
        const registro = this._obtenerRegistroConectado(lineaId);

        const chatId = this._crearChatId(telefono);
        const chat = await registro.client.getChatById(chatId);

        await chat.sendSeen();

        const payload = {
            lineaId,
            telefono: this._extraerTelefono(chatId),
            leido: true,
            fecha: new Date()
        };

        await this._emitirEventoChat(
            "whatsapp:chat_read",
            lineaId,
            payload.telefono,
            payload
        );

        await this._publicarBackend("whatsapp.chat.read", payload);

        return payload;
    }

    async desconectarLinea(lineaId) {
        this._validarLineaExiste(lineaId);

        const registro = this.lineas.get(lineaId);

        await registro.client.destroy();

        registro.conectado = false;
        registro.linea.estado = "DESCONECTADO";

        const payload = this._toLineaResponse(lineaId);

        await this._emitirEventoLinea("whatsapp:disconnected", lineaId, payload);
        await this._publicarBackend("whatsapp.line.disconnected", payload);

        return payload;
    }

    _registrarEventosCliente(lineaId, nombre, client, registro) {
        client.on("qr", async (qr) => {
            console.log(`QR generado para línea: ${lineaId}`);

            qrcodeTerminal.generate(qr, { small: true });

            const qrBase64 = await qrcode.toDataURL(qr);

            registro.qrTexto = qr;
            registro.qrBase64 = qrBase64;
            registro.linea.qr = qrBase64;
            registro.linea.estado = "QR_GENERADO";

            const payload = {
                lineaId,
                nombre,
                estado: "QR_GENERADO",
                qr: qrBase64,
                fecha: new Date()
            };

            await this._emitirEventoLinea("whatsapp:qr", lineaId, payload);
            await this._publicarBackend("whatsapp.line.qr", payload);
        });

        client.on("authenticated", async () => {
            console.log(`WhatsApp autenticado para línea: ${lineaId}`);

            registro.linea.estado = "AUTENTICADO";

            const payload = {
                lineaId,
                estado: "AUTENTICADO",
                fecha: new Date()
            };

            await this._emitirEventoLinea("whatsapp:authenticated", lineaId, payload);
            await this._publicarBackend("whatsapp.line.authenticated", payload);
        });

        client.on("ready", async () => {
            console.log(`WhatsApp listo para línea: ${lineaId}`);

            registro.conectado = true;
            registro.inicializado = true;
            registro.linea.estado = "CONECTADO";
            registro.linea.qr = null;
            registro.qrBase64 = null;
            registro.qrTexto = null;

            const info = client.info;

            if (info) {
                registro.linea.telefono = info.wid?.user || null;
                registro.linea.pushname = info.pushname || null;
                registro.linea.plataforma = info.platform || null;
            }

            const payload = this._toLineaResponse(lineaId);

            await this._emitirEventoLinea("whatsapp:ready", lineaId, payload);
            await this._publicarBackend("whatsapp.line.ready", payload);
        });

        client.on("auth_failure", async (message) => {
            console.error(`Fallo de autenticación en línea ${lineaId}:`, message);

            registro.conectado = false;
            registro.linea.estado = "ERROR_AUTH";

            const payload = {
                lineaId,
                estado: "ERROR_AUTH",
                error: message,
                fecha: new Date()
            };

            await this._emitirEventoLinea("whatsapp:auth_failure", lineaId, payload);
            await this._publicarBackend("whatsapp.line.auth_failure", payload);
        });

        client.on("disconnected", async (reason) => {
            console.warn(`WhatsApp desconectado línea ${lineaId}:`, reason);

            registro.conectado = false;
            registro.linea.estado = "DESCONECTADO";

            const payload = {
                lineaId,
                estado: "DESCONECTADO",
                reason,
                fecha: new Date()
            };

            await this._emitirEventoLinea("whatsapp:disconnected", lineaId, payload);
            await this._publicarBackend("whatsapp.line.disconnected", payload);
        });

        client.on("message", async (message) => {
            try {
                const mensajeNormalizado = await this._normalizarMensaje(
                    lineaId,
                    message
                );

                if (!mensajeNormalizado) return;

                if (mensajeNormalizado.fromMe) return;

                this._guardarMensajeCache(registro, mensajeNormalizado);
                this._actualizarChatCache(registro, mensajeNormalizado);

                await this._emitirEventoChat(
                    "whatsapp:message_received",
                    lineaId,
                    mensajeNormalizado.telefono,
                    mensajeNormalizado
                );

                await this._publicarBackend(
                    "whatsapp.message.received",
                    mensajeNormalizado
                );

                console.log("Mensaje entrante recibido:", mensajeNormalizado);
            } catch (error) {
                console.error("Error procesando evento message:", error);
            }
        });

        client.on("message_create", async (message) => {
            try {
                const mensajeNormalizado = await this._normalizarMensaje(
                    lineaId,
                    message
                );

                if (!mensajeNormalizado) return;

                this._guardarMensajeCache(registro, mensajeNormalizado);
                this._actualizarChatCache(registro, mensajeNormalizado);

                if (mensajeNormalizado.fromMe) {
                    await this._emitirEventoChat(
                        "whatsapp:message_created",
                        lineaId,
                        mensajeNormalizado.telefono,
                        mensajeNormalizado
                    );

                    await this._publicarBackend(
                        "whatsapp.message.created",
                        mensajeNormalizado
                    );

                    console.log("Mensaje saliente creado:", mensajeNormalizado);
                }
            } catch (error) {
                console.error("Error procesando evento message_create:", error);
            }
        });

        client.on("message_ack", async (message, ack) => {
            try {
                const mensajeNormalizado = await this._normalizarMensaje(
                    lineaId,
                    message
                );

                if (!mensajeNormalizado) return;

                const estado = this._mapearAck(ack);

                const payload = {
                    lineaId,
                    messageId: mensajeNormalizado.messageId,
                    telefono: mensajeNormalizado.telefono,
                    ack,
                    estado,
                    fromMe: mensajeNormalizado.fromMe,
                    fecha: new Date()
                };

                this._actualizarAckMensajeCache(registro, payload);

                await this._emitirEventoChat(
                    "whatsapp:message_ack",
                    lineaId,
                    payload.telefono,
                    payload
                );

                await this._publicarBackend("whatsapp.message.ack", payload);

                console.log("ACK actualizado:", payload);
            } catch (error) {
                console.error("Error procesando evento message_ack:", error);
            }
        });
    }

    async _normalizarMensaje(lineaId, message) {
        if (!message) return null;

        if (message.isStatus) {
            console.log("Estado de WhatsApp ignorado:", message.from);
            return null;
        }

        if (
            message.from === "status@broadcast" ||
            message.to === "status@broadcast"
        ) {
            console.log("Status broadcast ignorado");
            return null;
        }

        const chat = await message.getChat();

        if (!chat) return null;

        if (chat.isGroup) {
            console.log("Mensaje de grupo ignorado:", message.from);
            return null;
        }

        const chatSerialized = chat.id?._serialized || "";

        if (chatSerialized.includes("@g.us")) {
            console.log("Chat grupal ignorado:", chatSerialized);
            return null;
        }

        const telefono = message.fromMe
            ? this._extraerTelefono(message.to)
            : this._extraerTelefono(message.from);

        if (!telefono) return null;

        const contact = await message.getContact().catch(() => null);

        return {
            lineaId,
            messageId: message.id?._serialized || null,
            telefono,
            nombreContacto:
                contact?.pushname ||
                contact?.name ||
                contact?.shortName ||
                chat.name ||
                telefono,
            mensaje: message.body || "",
            tipo: message.type || "unknown",
            fromMe: Boolean(message.fromMe),
            tieneMedia: Boolean(message.hasMedia),
            ack: message.ack,
            estado: this._mapearAck(message.ack),
            timestamp: message.timestamp || null,
            fecha: message.timestamp
                ? new Date(message.timestamp * 1000)
                : new Date()
        };
    }

    _mapearAck(ack) {
        const valor = Number(ack);

        switch (valor) {
            case -1:
                return "ERROR";
            case 0:
                return "PENDIENTE";
            case 1:
                return "ENVIADO_SERVIDOR";
            case 2:
                return "ENTREGADO_DESTINO";
            case 3:
                return "LEIDO";
            case 4:
                return "REPRODUCIDO";
            default:
                return "DESCONOCIDO";
        }
    }

    _guardarMensajeCache(registro, mensaje) {
        if (!mensaje || !mensaje.messageId) return;

        registro.mensajesCache.set(mensaje.messageId, mensaje);
    }

    _actualizarAckMensajeCache(registro, payload) {
        if (!payload.messageId) return;

        const mensaje = registro.mensajesCache.get(payload.messageId);

        if (!mensaje) return;

        mensaje.ack = payload.ack;
        mensaje.estado = payload.estado;

        registro.mensajesCache.set(payload.messageId, mensaje);
    }

    _actualizarChatCache(registro, mensaje) {
        if (!mensaje || !mensaje.telefono) return;

        const chatActual = registro.chatsCache.get(mensaje.telefono) || {};

        registro.chatsCache.set(mensaje.telefono, {
            lineaId: mensaje.lineaId,
            telefono: mensaje.telefono,
            nombre: mensaje.nombreContacto || chatActual.nombre || mensaje.telefono,
            ultimoMensaje: mensaje.mensaje,
            fechaUltimoMensaje: mensaje.fecha,
            unreadCount: mensaje.fromMe ? 0 : Number(chatActual.unreadCount || 0) + 1
        });
    }

    async _emitirEventoLinea(evento, lineaId, payload) {
        emitToAll(evento, payload);
        emitToLinea(lineaId, evento, payload);
    }

    async _emitirEventoChat(evento, lineaId, telefono, payload) {
        emitToAll(evento, payload);
        emitToLinea(lineaId, evento, payload);
        emitToChat(lineaId, telefono, evento, payload);
    }

    async _publicarBackend(evento, payload) {
        if (!this.backendWebhookPublisher) return;

        await this.backendWebhookPublisher.publicar(evento, payload);
    }

    _validarLineaExiste(lineaId) {
        if (!this.lineas.has(lineaId)) {
            throw new Error("La línea de WhatsApp no existe");
        }
    }

    _obtenerRegistroConectado(lineaId) {
        this._validarLineaExiste(lineaId);

        const registro = this.lineas.get(lineaId);

        if (!registro.conectado) {
            throw new Error("La línea de WhatsApp no está conectada");
        }

        return registro;
    }

    _crearChatId(telefono) {
        const limpio = String(telefono).replace(/\D/g, "");

        if (!limpio) {
            throw new Error("Teléfono inválido");
        }

        return `${limpio}@c.us`;
    }

    _extraerTelefono(valor) {
        if (!valor) return "";

        return String(valor)
            .replace("@c.us", "")
            .replace("@s.whatsapp.net", "")
            .replace("@lid", "")
            .replace(/\D/g, "");
    }

    _toLineaResponse(lineaId) {
        this._validarLineaExiste(lineaId);

        const registro = this.lineas.get(lineaId);

        return {
            id: registro.linea.id,
            nombre: registro.linea.nombre,
            estado: registro.linea.estado,
            telefono: registro.linea.telefono,
            pushname: registro.linea.pushname,
            plataforma: registro.linea.plataforma,
            conectado: registro.conectado,
            inicializado: registro.inicializado,
            tieneQr: Boolean(registro.qrBase64),
            qr: registro.qrBase64,
            fechaCreacion: registro.linea.fechaCreacion
        };
    }
}

module.exports = WhatsappClientRepositoryWebJs;
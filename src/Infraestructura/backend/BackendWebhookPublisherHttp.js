const axios = require("axios");

class BackendWebhookPublisherHttp {
    constructor() {
        this.webhookUrl = process.env.BACKEND_WEBHOOK_URL || "";
        this.token = process.env.BACKEND_WEBHOOK_TOKEN || "";
    }

    async publicar(evento, payload) {
        if (!this.webhookUrl) {
            return {
                enviado: false,
                motivo: "BACKEND_WEBHOOK_URL no configurado"
            };
        }

        try {
            const headers = {
                "Content-Type": "application/json"
            };

            if (this.token) {
                headers.Authorization = `Bearer ${this.token}`;
            }

            await axios.post(
                this.webhookUrl,
                {
                    evento,
                    payload,
                    fecha: new Date()
                },
                {
                    headers,
                    timeout: 10000
                }
            );

            return {
                enviado: true
            };
        } catch (error) {
            console.error("Error enviando evento al backend:", {
                evento,
                message: error.message
            });

            return {
                enviado: false,
                error: error.message
            };
        }
    }
}

module.exports = BackendWebhookPublisherHttp;
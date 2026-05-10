const http = require("http");
const buildApp = require("./app");
const { initSocketServer } = require("./Infraestructura/websocket/SocketServer");

async function start() {
    try {
        const port = Number(process.env.PORT) || 3977;

        const app = buildApp();
        const server = http.createServer(app);

        initSocketServer(server);

        server.listen(port, () => {
            console.log("Webhook WhatsApp corriendo en puerto:", port);
        });
    } catch (error) {
        console.error("Fallo al iniciar la aplicación:", error);
        process.exit(1);
    }
}

start();
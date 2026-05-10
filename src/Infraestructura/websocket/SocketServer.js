const { Server } = require("socket.io");

let io = null;

function initSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Cliente WebSocket conectado:", socket.id);

        socket.on("join-line", (lineaId) => {
            if (!lineaId) return;

            socket.join(`linea:${lineaId}`);
            console.log(`Socket ${socket.id} unido a linea:${lineaId}`);
        });

        socket.on("leave-line", (lineaId) => {
            if (!lineaId) return;

            socket.leave(`linea:${lineaId}`);
            console.log(`Socket ${socket.id} salió de linea:${lineaId}`);
        });

        socket.on("join-chat", ({ lineaId, telefono }) => {
            if (!lineaId || !telefono) return;

            socket.join(`chat:${lineaId}:${telefono}`);
            console.log(`Socket ${socket.id} unido a chat:${lineaId}:${telefono}`);
        });

        socket.on("leave-chat", ({ lineaId, telefono }) => {
            if (!lineaId || !telefono) return;

            socket.leave(`chat:${lineaId}:${telefono}`);
            console.log(`Socket ${socket.id} salió de chat:${lineaId}:${telefono}`);
        });

        socket.on("disconnect", () => {
            console.log("Cliente WebSocket desconectado:", socket.id);
        });
    });

    return io;
}

function getSocketServer() {
    if (!io) {
        throw new Error("Socket.IO no ha sido inicializado");
    }

    return io;
}

function emitToAll(eventName, payload) {
    if (!io) return;
    io.emit(eventName, payload);
}

function emitToLinea(lineaId, eventName, payload) {
    if (!io) return;
    io.to(`linea:${lineaId}`).emit(eventName, payload);
}

function emitToChat(lineaId, telefono, eventName, payload) {
    if (!io) return;
    io.to(`chat:${lineaId}:${telefono}`).emit(eventName, payload);
}

module.exports = {
    initSocketServer,
    getSocketServer,
    emitToAll,
    emitToLinea,
    emitToChat
};
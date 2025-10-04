import { Server, Socket } from "socket.io";
import { server } from "./app";
import { logger } from "./core/logger";
import { validateSocketConnection } from "./core/auth";

const socket = new Server(server, {
    path: "/",
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
});

socket.use((_socket: Socket, next) => {
    const auth = _socket.handshake.auth.token;
    if (!auth) {
        _socket.disconnect();
    }
    const user = validateSocketConnection(auth);
    if (user) {
        next()
    } else {
        _socket.disconnect();
    }
});

socket.on('connection', (_socket) => {
    logger.info("SOCKET Connected")
})
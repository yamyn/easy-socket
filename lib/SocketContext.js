class SocketContext {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
    }

    get user() {
        return this.socket.user;
    }

    get isAuthenticated() {
        return this.socket.isAuthenticated;
    }

    get authError() {
        return this.socket.authError;
    }

    get uploader() {
        return this.socket.uploader;
    }
}

module.exports = SocketContext;

const SocketIOFileUpload = require('socketio-file-upload');
const { promises: fs } = require('fs');

const CommonEmiteds = require('./Common.emiteds');

const uploadFolderPath = `${process.cwd()}/upload`;

class Uploader {
    constructor() {
        this.initUploadFolder();
    }

    async initUploadFolder() {
        try {
            await fs.mkdir(uploadFolderPath);
        } catch (error) {
            if (error.code === 'EEXIST') return;

            throw error;
        }
    }

    join(socket) {
        if (!socket.isAuthenticated) return;

        const uploader = new SocketIOFileUpload();

        uploader.listen(socket);
        uploader.dir = uploadFolderPath;

        uploader.on('error', event => {
            CommonEmiteds.sendUploadError(socket, event.error.message);
        });

        socket.uploader = uploader;
    }

    serveClient(app) {
        if (typeof app === 'function') {
            return app.use(SocketIOFileUpload.router);
        }

        SocketIOFileUpload.listen(app);
    }
}

module.exports = new Uploader();

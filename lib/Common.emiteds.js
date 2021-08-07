const Exception = require('./Errors/BaseException');
const Emiteds = require('./Emiteds');

/** @module CommonEmitteds */
class CommonEmiteds extends Emiteds {
    /**
     * event to client, if token invalid or missed
     *
     * @event Emitted: on-auth-error
     * @param {error}  Unautorized error
     */
    sendAuthError(socket, message) {
        this.emit(socket, 'on-auth-error', {
            error: new Exception(message, 401),
        });
    }

    /**
     * event to client, if token invalid or missed
     *
     * @event Emitted: on-auth-error
     * @param {error}  Unautorized error
     */
    sendUploadError(socket, message) {
        this.emit(socket, 'on-upload-error', {
            error: new Exception(message, 500),
        });
    }
}

module.exports = new CommonEmiteds('common');

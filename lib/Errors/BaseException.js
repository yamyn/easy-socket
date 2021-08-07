const { STATUS_CODES } = require('http');

/**
 * @export
 * @class ValidationError
 * @extends Error
 */
class BaseException extends Error {
    /**
     * @constructor
     * @param {object} message
     */
    constructor(message, statusCode) {
        super();

        this.message = message;

        this.statusCode = statusCode || 500;

        this.name = STATUS_CODES[this.statusCode];
    }
}

module.exports = BaseException;

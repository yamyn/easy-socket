/**
 * @export
 * @class ValidationError
 * @extends Error
 */
class ValidationException extends Error {
    /**
     * @constructor
     * @param {object} message
     */
    constructor(message) {
        super();

        this.message = message;

        this.statusCode = 400;

        this.name = 'ValidationError';
    }
}

module.exports = ValidationException;

const Joi = require('joi');

const ValidationException = require('./Errors/ValidationException');

class Validator {
    async validate(schema, data) {
        try {
            const validatedData = await schema.validateAsync(data);

            return validatedData;
        } catch (error) {
            if (Joi.isError(error)) {
                throw new ValidationException(
                    this.parseErrorMessage(error.details),
                );
            }

            throw error;
        }
    }

    createSchema(cb) {
        return Joi.object(cb(Joi));
    }

    parseErrorMessage(details) {
        return details.reduce((acc, detail) => {
            if (acc) acc += ', ';

            acc += detail.message;

            return acc;
        }, '');
    }
}

module.exports = new Validator();

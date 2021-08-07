const Exception = require('./Errors/BaseException');

module.exports = function (error, cb) {
    if (!error.statusCode || error.statusCode === 500) {
        console.log(error);

        return cb({
            error: new Exception(error.message, 500),
        });
    }

    cb({ error });
};

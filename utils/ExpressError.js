class ExpressError extends Error {
    constructor(statusCode, message) {
        super(); // Call the parent constructor (Error)
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError;

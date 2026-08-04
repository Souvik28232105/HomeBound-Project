class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message); // <--- Pass message to super
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError;
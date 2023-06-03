//inherit Error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //call the parent constructor

    this.statusCode = statusCode;
    //check if starts with 4 or 500
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //all errors are operational errors- user created, or db issue.. not programming errors
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

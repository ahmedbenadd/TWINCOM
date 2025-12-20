const codes = require("../config/codes");

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let response = {
        message: err.message || "Something went wrong",
    };

    if (process.env.NODE_ENV === 'development') {
        response.stackTrace = err.stack;
    }
    console.error(err.message);
    switch (statusCode) {
        case codes.VALIDATION_ERROR:
            response.title = "Validation Failed";
            break;
        case codes.NOT_FOUND:
            response.title = "Not Found";
            break;
        case codes.FORBIDDEN:
            response.title = "Forbidden";
            break;
        case codes.UNAUTHORIZED:
            response.title = "Unauthorized";
            break;
        case codes.SERVER_ERROR:
            response.title = "Server Error";
            break;
        default:
            response.title = "Unexpected Error";
            break;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;

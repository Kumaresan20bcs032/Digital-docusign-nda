// send success response.
export const sendSuccessResponse = (res, statusCode, message, data) => {
    const response = {
        status_code: statusCode || 200,
        status: true,
        message,
        data: data || {}
    };

    res.status(statusCode).json(response);
};

// send error response.
export const sendErrorResponse = (res, statusCode, message) => {
    const response = {
        status_code: statusCode || 500,
        status: false,
        message,
        data: {}
    };

    res.status(statusCode).json(response);
};
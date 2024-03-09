class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        data = null,
        stack = "",
        success = false,
    ){
        super(message)
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = success;
        this.errors = errors;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}
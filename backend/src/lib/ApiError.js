class ApiError extends Error {
  #trace = "";

  constructor(
    statusCode = 500,
    message = "Internal Server Error",
    errors = [],
    trace = "",
  ) {
    super(message);
    this.success = false;
    this.data = null;
    this.statusCode = statusCode;
    this.errors = errors;

    if (trace) {
      this.#trace = trace;
    } else {
      Error.captureStackTrace(this, this.constructor);
      this.#trace = this.stack;
    }
  }

  toJSON() {
    return {
      success: this.success,
      data: this.data,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
    };
  }

  getTrace() {
    return this.#trace;
  }
}

export default ApiError;

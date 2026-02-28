class ApiSuccess {
  constructor( statusCode = 200, message = "Success", data = {}) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      statusCode: this.statusCode
    };
  }
}

export default ApiSuccess
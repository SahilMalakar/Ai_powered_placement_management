import { AppError } from "./AppError.js";

export class RequestValidationError extends AppError {
  public fields: any;

  constructor(message = "Invalid request data", fields?: any) {
    super(message, 422, "VALIDATION_ERROR");
    this.fields = fields;
  }
}

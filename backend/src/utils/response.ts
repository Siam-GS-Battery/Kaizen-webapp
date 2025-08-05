import { Response } from 'express';
import { ApiResponse, ApiError } from '../types';

export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, error: string, statusCode: number = 400, code?: string, details?: any): Response {
    const response: ApiError = {
      success: false,
      error,
      code,
      details
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message || 'Resource created successfully', 201);
  }

  static noContent(res: Response, message?: string): Response {
    return res.status(204).json({
      success: true,
      message: message || 'Operation completed successfully'
    });
  }

  static unauthorized(res: Response, message: string = 'Unauthorized access'): Response {
    return this.error(res, message, 401, 'UNAUTHORIZED');
  }

  static forbidden(res: Response, message: string = 'Forbidden access'): Response {
    return this.error(res, message, 403, 'FORBIDDEN');
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404, 'NOT_FOUND');
  }

  static conflict(res: Response, message: string = 'Resource conflict'): Response {
    return this.error(res, message, 409, 'CONFLICT');
  }

  static validationError(res: Response, details: any, message: string = 'Validation failed'): Response {
    return this.error(res, message, 422, 'VALIDATION_ERROR', details);
  }

  static serverError(res: Response, message: string = 'Internal server error'): Response {
    return this.error(res, message, 500, 'INTERNAL_ERROR');
  }
}
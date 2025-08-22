import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    department: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Access token required', statusCode: 401 }
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as { 
      employeeId: string; 
      iat: number; 
      exp: number; 
    };

    // Get user details from database
    const { data: employee, error } = await supabase
      .from('users')
      .select('employee_id, first_name, last_name, department, role')
      .eq('employee_id', decoded.employeeId)
      .single();

    if (error || !employee) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid token or user not found', statusCode: 401 }
      });
      return;
    }

    // Add user info to request
    req.user = {
      employeeId: employee.employee_id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      department: employee.department,
      role: employee.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token', statusCode: 401 }
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required', statusCode: 401 }
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions', statusCode: 403 }
      });
      return;
    }

    next();
  };
};
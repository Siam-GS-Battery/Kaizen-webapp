import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/database';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

interface LoginRequest {
  employeeId: string;
  password?: string;
}


// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, password }: LoginRequest = req.body;

    if (!employeeId) {
      throw createError('Employee ID is required', 400);
    }

    // Check if user exists in database using admin client to bypass RLS
    if (!supabaseAdmin) {
      throw createError('Server configuration error: Admin client not available', 500);
    }
    
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('employee_id', employeeId)
      .single();
    
    if (userError || !user) {
      throw createError('Invalid employee ID', 401);
    }

    // For demo purposes, we'll accept any password or no password
    // In production, you should verify the password properly
    if (password && user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw createError('Invalid password', 401);
      }
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('Server configuration error', 500);
    }

    const token = jwt.sign(
      { employeeId: user.employee_id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    // Create session record
    const sessionData = {
      employee_id: user.employee_id,
      login_time: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      ip_address: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown'
    };

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.warn('Session creation failed:', sessionError);
    }

    res.json({
      success: true,
      data: {
        token,
        user: {
          employeeId: user.employee_id,
          firstName: user.first_name,
          lastName: user.last_name,
          department: user.department,
          role: user.role,
          fiveSArea: user.five_s_area,
          projectArea: user.project_area,
          isKaizenTeam: user.is_kaizen_team || false,
          kaizenTeamAssignedDate: user.kaizen_team_assigned_date
        },
        sessionId: session?.id || null
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Internal server error', statusCode: 500 }
      });
    }
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret && supabaseAdmin) {
        try {
          const decoded = jwt.verify(token, jwtSecret) as { employeeId: string };
          
          // Update session to mark as logged out
          await supabaseAdmin
            .from('sessions')
            .update({ 
              logout_time: new Date().toISOString(),
              is_active: false 
            })
            .eq('employee_id', decoded.employeeId)
            .eq('is_active', true);
        } catch (jwtError) {
          console.warn('Invalid token during logout:', jwtError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', statusCode: 500 }
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw createError('Token required', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('Server configuration error', 500);
    }
    
    if (!supabaseAdmin) {
      throw createError('Server configuration error: Admin client not available', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as { employeeId: string };

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('employee_id, first_name, last_name, department, role, five_s_area, project_area')
      .eq('employee_id', decoded.employeeId)
      .single();

    if (error || !user) {
      throw createError('Invalid token', 401);
    }

    res.json({
      success: true,
      data: {
        user: {
          employeeId: user.employee_id,
          firstName: user.first_name,
          lastName: user.last_name,
          department: user.department,
          role: user.role,
          fiveSArea: user.five_s_area,
          projectArea: user.project_area
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error instanceof Error && (error as any).statusCode) {
      res.status((error as any).statusCode).json({
        success: false,
        error: { message: error.message, statusCode: (error as any).statusCode }
      });
    } else {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token', statusCode: 401 }
      });
    }
  }
});

export default router;
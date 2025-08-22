import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '../config/database';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Get users for dropdown (simple list with names) - MUST BE BEFORE /:employeeId
router.get('/dropdown/list', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching users for dropdown...');
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        employee_id,
        first_name,
        last_name,
        role
      `)
      .in('role', ['Supervisor', 'Manager', 'Admin'])
      .order('first_name');

    if (error) {
      console.error('❌ Error fetching users for dropdown:', error);
      throw createError(`Database error: ${error.message}`, 500);
    }

    console.log('✅ Successfully fetched users for dropdown');

    res.json({
      success: true,
      data: users?.map(user => ({
        value: user.employee_id,
        label: `${user.first_name} ${user.last_name} (${user.employee_id})`,
        role: user.role
      })) || [],
      message: 'Users for dropdown retrieved successfully'
    });

  } catch (error) {
    console.error('Get users dropdown error:', error);
    
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

// Get Kaizen team members only - MUST BE BEFORE /:employeeId
router.get('/kaizen-team/list', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching Kaizen team members...');
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { data: kaizenTeam, error } = await supabaseAdmin
      .from('users')
      .select(`
        employee_id,
        first_name,
        last_name,
        department,
        five_s_area,
        project_area,
        role,
        position,
        approver,
        is_kaizen_team,
        kaizen_team_assigned_date,
        created_at,
        updated_at
      `)
      .eq('is_kaizen_team', true)
      .order('kaizen_team_assigned_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching Kaizen team members:', error);
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.json({
      success: true,
      data: kaizenTeam?.map(emp => ({
        employeeId: emp.employee_id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        department: emp.department,
        fiveSArea: emp.five_s_area,
        projectArea: emp.project_area,
        role: emp.role,
        position: emp.position,
        approver: emp.approver,
        isKaizenTeam: emp.is_kaizen_team,
        kaizenTeamAssignedDate: emp.kaizen_team_assigned_date,
        createdAt: emp.created_at,
        updatedAt: emp.updated_at
      })) || [],
      message: 'Kaizen team members retrieved successfully'
    });

  } catch (error) {
    console.error('Get Kaizen team error:', error);
    
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

// Get non-Kaizen team employees for selection modal - MUST BE BEFORE /:employeeId
router.get('/non-kaizen-team/list', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching non-Kaizen team employees...');
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { data: employees, error } = await supabaseAdmin
      .from('users')
      .select(`
        employee_id,
        first_name,
        last_name,
        department,
        five_s_area,
        project_area,
        role,
        position,
        created_at,
        updated_at
      `)
      .eq('is_kaizen_team', false)
      .order('first_name');

    if (error) {
      console.error('❌ Error fetching non-Kaizen team employees:', error);
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.json({
      success: true,
      data: employees?.map(emp => ({
        employeeId: emp.employee_id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        department: emp.department,
        fiveSArea: emp.five_s_area,
        projectArea: emp.project_area,
        role: emp.role,
        position: emp.position,
        isKaizenTeam: false,
        createdAt: emp.created_at,
        updatedAt: emp.updated_at
      })) || [],
      message: 'Non-Kaizen team employees retrieved successfully'
    });

  } catch (error) {
    console.error('Get non-Kaizen team employees error:', error);
    
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

// Get all employees (temporarily disabled authentication for frontend testing)
router.get('/', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching all employees...');
    
    console.log('🔍 Attempting to fetch all employees...');
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { data: employees, error } = await supabaseAdmin
      .from('users')
      .select(`
        employee_id,
        first_name,
        last_name,
        department,
        five_s_area,
        project_area,
        role,
        position,
        approver,
        is_kaizen_team,
        kaizen_team_assigned_date,
        created_at,
        updated_at
      `)
      .order('employee_id');

    if (error) {
      console.error('❌ Error fetching employees:', error);
      throw createError(`Database error: ${error.message}`, 500);
    }

    console.log('✅ Successfully fetched employees:', JSON.stringify(employees, null, 2));

    res.json({
      success: true,
      data: employees?.map(emp => ({
        employeeId: emp.employee_id,
        firstName: emp.first_name,
        lastName: emp.last_name,
        department: emp.department,
        fiveSArea: emp.five_s_area,
        projectArea: emp.project_area,
        role: emp.role,
        position: emp.position,
        approver: emp.approver,
        isKaizenTeam: emp.is_kaizen_team || false,
        kaizenTeamAssignedDate: emp.kaizen_team_assigned_date,
        createdAt: emp.created_at,
        updatedAt: emp.updated_at
      })) || [],
      message: 'Employees retrieved successfully'
    });

  } catch (error) {
    console.error('Get employees error:', error);
    
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

// Get employee by ID (temporarily disabled authentication for frontend testing)
router.get('/:employeeId', async (req: any, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;

    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { data: employee, error } = await supabaseAdmin
      .from('users')
      .select(`
        employee_id,
        first_name,
        last_name,
        department,
        five_s_area,
        project_area,
        role,
        position,
        approver,
        is_kaizen_team,
        kaizen_team_assigned_date,
        created_at,
        updated_at
      `)
      .eq('employee_id', employeeId)
      .single();

    if (error || !employee) {
      throw createError('Employee not found', 404);
    }

    res.json({
      success: true,
      data: {
        employeeId: employee.employee_id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        department: employee.department,
        fiveSArea: employee.five_s_area,
        projectArea: employee.project_area,
        role: employee.role,
        position: employee.position,
        approver: employee.approver,
        isKaizenTeam: employee.is_kaizen_team || false,
        kaizenTeamAssignedDate: employee.kaizen_team_assigned_date,
        createdAt: employee.created_at,
        updatedAt: employee.updated_at
      },
      message: 'Employee retrieved successfully'
    });

  } catch (error) {
    console.error('Get employee error:', error);
    
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

// Create new employee (temporarily disabled authentication for frontend testing)
router.post('/', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Creating new employee...');

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const {
      employeeId,
      firstName,
      lastName,
      department,
      fiveSArea,
      projectArea,
      role = 'User',
      position = 'พนักงาน',
      password,
      approver
    } = req.body;

    if (!employeeId || !firstName || !lastName || !department) {
      throw createError('Missing required fields: employeeId, firstName, lastName, department', 400);
    }

    // Check if employee already exists
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('employee_id')
      .eq('employee_id', employeeId)
      .single();

    if (existing) {
      throw createError('Employee ID already exists', 409);
    }

    // Hash password if provided
    let passwordHash = null;
    if (password && password.trim()) {
      const saltRounds = 12;
      passwordHash = await bcrypt.hash(password.trim(), saltRounds);
    }

    const newEmployee = {
      employee_id: employeeId,
      first_name: firstName,
      last_name: lastName,
      department,
      five_s_area: fiveSArea,
      project_area: projectArea,
      role,
      position,
      approver: approver || null,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: employee, error } = await supabaseAdmin
      .from('users')
      .insert(newEmployee)
      .select()
      .single();

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.status(201).json({
      success: true,
      data: {
        employeeId: employee.employee_id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        department: employee.department,
        fiveSArea: employee.five_s_area,
        projectArea: employee.project_area,
        role: employee.role,
        position: employee.position,
        approver: employee.approver,
        createdAt: employee.created_at,
        updatedAt: employee.updated_at
      },
      message: 'Employee created successfully'
    });

  } catch (error) {
    console.error('Create employee error:', error);
    
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

// Update employee (temporarily disabled authentication for frontend testing)
router.put('/:employeeId', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Updating employee...');

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { employeeId } = req.params;
    const {
      firstName,
      lastName,
      department,
      fiveSArea,
      projectArea,
      role,
      position,
      password,
      resetPassword,
      approver
    } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (department !== undefined) updateData.department = department;
    if (fiveSArea !== undefined) updateData.five_s_area = fiveSArea;
    if (projectArea !== undefined) updateData.project_area = projectArea;
    if (role !== undefined) updateData.role = role;
    if (position !== undefined) updateData.position = position;
    if (approver !== undefined) updateData.approver = approver;

    // Handle password updates
    if (resetPassword === true) {
      // Reset password (set to null)
      updateData.password_hash = null;
    } else if (password && password.trim()) {
      // Set new password
      const saltRounds = 12;
      updateData.password_hash = await bcrypt.hash(password.trim(), saltRounds);
    }

    const { data: employee, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('employee_id', employeeId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError('Employee not found', 404);
      }
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.json({
      success: true,
      data: {
        employeeId: employee.employee_id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        department: employee.department,
        fiveSArea: employee.five_s_area,
        projectArea: employee.project_area,
        role: employee.role,
        position: employee.position,
        approver: employee.approver,
        isKaizenTeam: employee.is_kaizen_team || false,
        kaizenTeamAssignedDate: employee.kaizen_team_assigned_date,
        createdAt: employee.created_at,
        updatedAt: employee.updated_at
      },
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('Update employee error:', error);
    
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

// Delete employee (temporarily disabled authentication for frontend testing)
router.delete('/:employeeId', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Deleting employee...');

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { employeeId } = req.params;

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('employee_id', employeeId);

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    
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

// Add employee to Kaizen team
router.post('/:employeeId/kaizen-team', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Adding employee to Kaizen team...');

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { employeeId } = req.params;

    // Check if employee exists
    const { data: existingEmployee, error: checkError } = await supabaseAdmin
      .from('users')
      .select('employee_id, is_kaizen_team')
      .eq('employee_id', employeeId)
      .single();

    if (checkError || !existingEmployee) {
      throw createError('Employee not found', 404);
    }

    if (existingEmployee.is_kaizen_team) {
      throw createError('Employee is already a Kaizen team member', 409);
    }

    // Add to Kaizen team
    const { data: updatedEmployee, error } = await supabaseAdmin
      .from('users')
      .update({
        is_kaizen_team: true,
        kaizen_team_assigned_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('employee_id', employeeId)
      .select()
      .single();

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.json({
      success: true,
      data: {
        employeeId: updatedEmployee.employee_id,
        firstName: updatedEmployee.first_name,
        lastName: updatedEmployee.last_name,
        isKaizenTeam: updatedEmployee.is_kaizen_team,
        kaizenTeamAssignedDate: updatedEmployee.kaizen_team_assigned_date
      },
      message: 'Employee added to Kaizen team successfully'
    });

  } catch (error) {
    console.error('Add to Kaizen team error:', error);
    
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

// Remove employee from Kaizen team
router.delete('/:employeeId/kaizen-team', async (req: any, res: Response): Promise<void> => {
  try {
    console.log('🔍 Removing employee from Kaizen team...');

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not initialized');
      throw createError('Database configuration error', 500);
    }

    const { employeeId } = req.params;

    // Check if employee exists
    const { data: existingEmployee, error: checkError } = await supabaseAdmin
      .from('users')
      .select('employee_id, is_kaizen_team')
      .eq('employee_id', employeeId)
      .single();

    if (checkError || !existingEmployee) {
      throw createError('Employee not found', 404);
    }

    if (!existingEmployee.is_kaizen_team) {
      throw createError('Employee is not a Kaizen team member', 409);
    }

    // Remove from Kaizen team
    const { data: updatedEmployee, error } = await supabaseAdmin
      .from('users')
      .update({
        is_kaizen_team: false,
        kaizen_team_assigned_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('employee_id', employeeId)
      .select()
      .single();

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.json({
      success: true,
      data: {
        employeeId: updatedEmployee.employee_id,
        firstName: updatedEmployee.first_name,
        lastName: updatedEmployee.last_name,
        isKaizenTeam: updatedEmployee.is_kaizen_team,
        kaizenTeamAssignedDate: updatedEmployee.kaizen_team_assigned_date
      },
      message: 'Employee removed from Kaizen team successfully'
    });

  } catch (error) {
    console.error('Remove from Kaizen team error:', error);
    
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

export default router;
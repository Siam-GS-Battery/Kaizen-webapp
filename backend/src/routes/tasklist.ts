import express, { Request, Response } from 'express';
import { supabase } from '../config/database';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

interface TaskListItem {
  id?: number;
  projectName: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  fiveSGroupName: string;
  projectArea: string;
  projectStartDate: string;
  projectEndDate: string;
  problemsEncountered: string;
  solutionApproach: string;
  resultsAchieved: string;
  fiveSType: string;
  improvementTopic: string;
  SGS_Smart: string;
  SGS_Strong: string;
  SGS_Green: string;
  beforeProjectImage?: string;
  afterProjectImage?: string;
  createdDateTh: string;
  submittedDateTh: string;
  status: 'EDIT' | 'WAITING' | 'APPROVED' | 'REJECTED';
  formType: 'genba' | 'suggestion' | 'best_kaizen';
  createdDate: string;
  submittedDate: string;
}

// Get all tasks with filters and pagination
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      formType,
      department,
      employeeId,
      search,
      sortBy = 'created_date',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('projects')
      .select(`
        *,
        users!projects_employee_id_fkey (
          first_name,
          last_name,
          department
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (formType) {
      query = query.eq('form_type', formType);
    }
    
    if (department) {
      query = query.eq('department', department);
    }
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    // Search functionality
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,problems_encountered.ilike.%${search}%,solution_approach.ilike.%${search}%`);
    }

    // Sorting
    const validSortFields = ['created_date', 'submitted_date', 'project_name', 'status'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'created_date';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    
    query = query.order(sortField, { ascending: order === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    const formattedProjects = projects?.map(project => ({
      id: project.id,
      projectName: project.project_name,
      employeeId: project.employee_id,
      firstName: project.users?.first_name || '',
      lastName: project.users?.last_name || '',
      position: project.position,
      department: project.department,
      fiveSGroupName: project.five_s_group_name,
      projectArea: project.project_area,
      projectStartDate: project.project_start_date,
      projectEndDate: project.project_end_date,
      problemsEncountered: project.problems_encountered,
      solutionApproach: project.solution_approach,
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image,
      afterProjectImage: project.after_project_image,
      createdDateTh: project.created_date_th,
      submittedDateTh: project.submitted_date_th,
      status: project.status,
      formType: project.form_type,
      createdDate: project.created_date,
      submittedDate: project.submitted_date
    })) || [];

    res.json({
      success: true,
      data: {
        projects: formattedProjects,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil((count || 0) / limitNum),
          totalItems: count || 0,
          itemsPerPage: limitNum
        }
      },
      message: 'Tasks retrieved successfully'
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    
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

// Get task by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_employee_id_fkey (
          first_name,
          last_name,
          department
        )
      `)
      .eq('id', id)
      .single();

    if (error || !project) {
      throw createError('Task not found', 404);
    }

    const formattedProject = {
      id: project.id,
      projectName: project.project_name,
      employeeId: project.employee_id,
      firstName: project.users?.first_name || '',
      lastName: project.users?.last_name || '',
      position: project.position,
      department: project.department,
      fiveSGroupName: project.five_s_group_name,
      projectArea: project.project_area,
      projectStartDate: project.project_start_date,
      projectEndDate: project.project_end_date,
      problemsEncountered: project.problems_encountered,
      solutionApproach: project.solution_approach,
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image,
      afterProjectImage: project.after_project_image,
      createdDateTh: project.created_date_th,
      submittedDateTh: project.submitted_date_th,
      status: project.status,
      formType: project.form_type,
      createdDate: project.created_date,
      submittedDate: project.submitted_date
    };

    res.json({
      success: true,
      data: formattedProject,
      message: 'Task retrieved successfully'
    });

  } catch (error) {
    console.error('Get task error:', error);
    
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

// Create new task
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const taskData: TaskListItem = req.body;

    // Validate required fields
    const requiredFields = [
      'projectName', 'employeeId', 'department', 'projectArea',
      'projectStartDate', 'projectEndDate', 'problemsEncountered',
      'solutionApproach', 'fiveSType', 'improvementTopic', 'formType'
    ];

    for (const field of requiredFields) {
      if (!taskData[field as keyof TaskListItem]) {
        throw createError(`Missing required field: ${field}`, 400);
      }
    }

    // Verify employee exists
    const { data: employee, error: empError } = await supabase
      .from('users')
      .select('first_name, last_name, department')
      .eq('employee_id', taskData.employeeId)
      .single();

    if (empError || !employee) {
      throw createError('Employee not found', 404);
    }

    const now = new Date().toISOString();
    const newProject = {
      project_name: taskData.projectName,
      employee_id: taskData.employeeId,
      position: taskData.position || 'เจ้าหน้าที่',
      department: taskData.department,
      five_s_group_name: taskData.fiveSGroupName,
      project_area: taskData.projectArea,
      project_start_date: taskData.projectStartDate,
      project_end_date: taskData.projectEndDate,
      problems_encountered: taskData.problemsEncountered,
      solution_approach: taskData.solutionApproach,
      results_achieved: taskData.resultsAchieved || '',
      five_s_type: taskData.fiveSType,
      improvement_topic: taskData.improvementTopic,
      sgs_smart: taskData.SGS_Smart || '',
      sgs_strong: taskData.SGS_Strong || '',
      sgs_green: taskData.SGS_Green || '',
      before_project_image: taskData.beforeProjectImage,
      after_project_image: taskData.afterProjectImage,
      created_date_th: new Date().toLocaleDateString('th-TH'),
      submitted_date_th: new Date().toLocaleDateString('th-TH'),
      status: taskData.status || 'EDIT',
      form_type: taskData.formType,
      created_date: now,
      submitted_date: now,
      updated_at: now
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select(`
        *,
        users!projects_employee_id_fkey (
          first_name,
          last_name,
          department
        )
      `)
      .single();

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    const formattedProject = {
      id: project.id,
      projectName: project.project_name,
      employeeId: project.employee_id,
      firstName: project.users?.first_name || employee.first_name,
      lastName: project.users?.last_name || employee.last_name,
      position: project.position,
      department: project.department,
      fiveSGroupName: project.five_s_group_name,
      projectArea: project.project_area,
      projectStartDate: project.project_start_date,
      projectEndDate: project.project_end_date,
      problemsEncountered: project.problems_encountered,
      solutionApproach: project.solution_approach,
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image,
      afterProjectImage: project.after_project_image,
      createdDateTh: project.created_date_th,
      submittedDateTh: project.submitted_date_th,
      status: project.status,
      formType: project.form_type,
      createdDate: project.created_date,
      submittedDate: project.submitted_date
    };

    res.status(201).json({
      success: true,
      data: formattedProject,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('Create task error:', error);
    
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

// Update task
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const taskData: Partial<TaskListItem> = req.body;

    // Check if task exists and user has permission
    const { data: existingTask, error: fetchError } = await supabase
      .from('projects')
      .select('employee_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      throw createError('Task not found', 404);
    }

    // Check permissions: users can only edit their own tasks, or supervisors/managers/admins can edit any
    const userRole = req.user?.role;
    const isOwner = existingTask.employee_id === req.user?.employeeId;
    const canEdit = isOwner || ['Supervisor', 'Manager', 'Admin'].includes(userRole || '');

    if (!canEdit) {
      throw createError('Insufficient permissions to edit this task', 403);
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map frontend fields to database fields
    if (taskData.projectName !== undefined) updateData.project_name = taskData.projectName;
    if (taskData.position !== undefined) updateData.position = taskData.position;
    if (taskData.department !== undefined) updateData.department = taskData.department;
    if (taskData.fiveSGroupName !== undefined) updateData.five_s_group_name = taskData.fiveSGroupName;
    if (taskData.projectArea !== undefined) updateData.project_area = taskData.projectArea;
    if (taskData.projectStartDate !== undefined) updateData.project_start_date = taskData.projectStartDate;
    if (taskData.projectEndDate !== undefined) updateData.project_end_date = taskData.projectEndDate;
    if (taskData.problemsEncountered !== undefined) updateData.problems_encountered = taskData.problemsEncountered;
    if (taskData.solutionApproach !== undefined) updateData.solution_approach = taskData.solutionApproach;
    if (taskData.resultsAchieved !== undefined) updateData.results_achieved = taskData.resultsAchieved;
    if (taskData.fiveSType !== undefined) updateData.five_s_type = taskData.fiveSType;
    if (taskData.improvementTopic !== undefined) updateData.improvement_topic = taskData.improvementTopic;
    if (taskData.SGS_Smart !== undefined) updateData.sgs_smart = taskData.SGS_Smart;
    if (taskData.SGS_Strong !== undefined) updateData.sgs_strong = taskData.SGS_Strong;
    if (taskData.SGS_Green !== undefined) updateData.sgs_green = taskData.SGS_Green;
    if (taskData.beforeProjectImage !== undefined) updateData.before_project_image = taskData.beforeProjectImage;
    if (taskData.afterProjectImage !== undefined) updateData.after_project_image = taskData.afterProjectImage;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.formType !== undefined) updateData.form_type = taskData.formType;

    // Update submitted date when status changes to WAITING or APPROVED
    if (taskData.status && ['WAITING', 'APPROVED'].includes(taskData.status)) {
      updateData.submitted_date = new Date().toISOString();
      updateData.submitted_date_th = new Date().toLocaleDateString('th-TH');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users!projects_employee_id_fkey (
          first_name,
          last_name,
          department
        )
      `)
      .single();

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    const formattedProject = {
      id: project.id,
      projectName: project.project_name,
      employeeId: project.employee_id,
      firstName: project.users?.first_name || '',
      lastName: project.users?.last_name || '',
      position: project.position,
      department: project.department,
      fiveSGroupName: project.five_s_group_name,
      projectArea: project.project_area,
      projectStartDate: project.project_start_date,
      projectEndDate: project.project_end_date,
      problemsEncountered: project.problems_encountered,
      solutionApproach: project.solution_approach,
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image,
      afterProjectImage: project.after_project_image,
      createdDateTh: project.created_date_th,
      submittedDateTh: project.submitted_date_th,
      status: project.status,
      formType: project.form_type,
      createdDate: project.created_date,
      submittedDate: project.submitted_date
    };

    res.json({
      success: true,
      data: formattedProject,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Update task error:', error);
    
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

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if task exists and user has permission
    const { data: existingTask, error: fetchError } = await supabase
      .from('projects')
      .select('employee_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      throw createError('Task not found', 404);
    }

    // Check permissions: users can only delete their own tasks, or supervisors/managers/admins can delete any
    const userRole = req.user?.role;
    const isOwner = existingTask.employee_id === req.user?.employeeId;
    const canDelete = isOwner || ['Supervisor', 'Manager', 'Admin'].includes(userRole || '');

    if (!canDelete) {
      throw createError('Insufficient permissions to delete this task', 403);
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError(`Database error: ${error.message}`, 500);
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    
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
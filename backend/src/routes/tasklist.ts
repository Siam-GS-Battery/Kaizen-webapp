import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../config/database';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { uploadProjectImage, deleteProjectImage } from '../utils/imageHandler';

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
  standardCertification?: string;
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
  status: 'EDIT' | 'WAITING' | 'APPROVED' | 'REJECTED' | 'DELETED' | 'BEST_KAIZEN';
  formType: 'genba' | 'suggestion' | 'best_kaizen';
  createdDate: string;
  submittedDate: string;
}

// Get all tasks with filters and pagination (temporarily disabled authentication for frontend testing)
router.get('/', async (req: any, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

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

    let query = supabaseAdmin
      .from('projects')
      .select(`
        *,
        users!projects_employee_id_fkey (
          first_name,
          last_name,
          department,
          role,
          approver
        )
      `, { count: 'exact' });

    // Always exclude DELETED status projects
    query = query.neq('status', 'DELETED');

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
      // Ensure exact match for employee_id with proper trimming
      const trimmedEmployeeId = employeeId.toString().trim();
      console.log('Filtering by employee_id:', trimmedEmployeeId);
      query = query.eq('employee_id', trimmedEmployeeId);
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
      standardCertification: project.standard_certification || '-',
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image || null,
      afterProjectImage: project.after_project_image || null,
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

// Get task by ID (temporarily disabled authentication for frontend testing)
router.get('/:id', async (req: any, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { id } = req.params;

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        users!projects_employee_id_fkey (
          first_name,
          last_name,
          department,
          role,
          approver
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
      standardCertification: project.standard_certification || '-',
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image || null,
      afterProjectImage: project.after_project_image || null,
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

// Create new task (temporarily disabled authentication for frontend testing)
router.post('/', async (req: any, res: Response): Promise<void> => {
  try {
    const taskData: TaskListItem = req.body;

    // Validate required fields (images are optional)
    const requiredFields = [
      'projectName', 'employeeId', 'department', 'projectArea',
      'projectStartDate', 'projectEndDate', 'problemsEncountered',
      'solutionApproach', 'fiveSType', 'improvementTopic', 'formType'
    ];

    // Optional fields that can be empty or null
    // const optionalFields = [
    //   'beforeProjectImage', 'afterProjectImage', 'resultsAchieved', 
    //   'SGS_Smart', 'SGS_Strong', 'SGS_Green', 'standardCertification'
    // ];

    for (const field of requiredFields) {
      if (!taskData[field as keyof TaskListItem]) {
        throw createError(`Missing required field: ${field}`, 400);
      }
    }

    // Verify employee exists and get their role
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { data: employee, error: empError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, department, role')
      .eq('employee_id', taskData.employeeId)
      .single();

    if (empError || !employee) {
      throw createError('Employee not found', 404);
    }

    const now = new Date().toISOString();
    
    // Auto-approve if created by Manager
    let projectStatus = taskData.status || 'EDIT';
    if (employee.role === 'Manager' && (taskData.formType === 'genba' || taskData.formType === 'suggestion')) {
      projectStatus = 'APPROVED';
    }
    
    // First create the project without images to get the ID
    const newProject = {
      project_name: taskData.projectName,
      employee_id: taskData.employeeId,
      position: taskData.position || 'พนักงาน',
      department: taskData.department,
      five_s_group_name: taskData.fiveSGroupName,
      project_area: taskData.projectArea,
      project_start_date: taskData.projectStartDate,
      project_end_date: taskData.projectEndDate,
      problems_encountered: taskData.problemsEncountered,
      solution_approach: taskData.solutionApproach,
      standard_certification: taskData.standardCertification || '-',
      results_achieved: taskData.resultsAchieved || '',
      five_s_type: taskData.fiveSType,
      improvement_topic: taskData.improvementTopic,
      sgs_smart: taskData.SGS_Smart || '',
      sgs_strong: taskData.SGS_Strong || '',
      sgs_green: taskData.SGS_Green || '',
      before_project_image: null, // Will be updated after project creation
      after_project_image: null,  // Will be updated after project creation
      // Convert date to YYYY-MM-DD format for database compatibility
      created_date_th: (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      submitted_date_th: (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
      status: projectStatus,
      form_type: taskData.formType,
      created_date: now,
      submitted_date: now,
      updated_at: now
    };

    const { data: project, error } = await supabaseAdmin
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

    // Handle image uploads after project creation
    let beforeImageUrl: string | null = null;
    let afterImageUrl: string | null = null;

    if (taskData.beforeProjectImage) {
      const beforeResult = await uploadProjectImage(taskData.beforeProjectImage, project.id, 'before');
      if (beforeResult.error) {
        console.warn('Before image upload failed:', beforeResult.error);
      } else {
        beforeImageUrl = beforeResult.url;
      }
    }

    if (taskData.afterProjectImage) {
      const afterResult = await uploadProjectImage(taskData.afterProjectImage, project.id, 'after');
      if (afterResult.error) {
        console.warn('After image upload failed:', afterResult.error);
      } else {
        afterImageUrl = afterResult.url;
      }
    }

    // Update project with image URLs if any were uploaded
    if (beforeImageUrl || afterImageUrl) {
      const updateData: any = {};
      if (beforeImageUrl) updateData.before_project_image = beforeImageUrl;
      if (afterImageUrl) updateData.after_project_image = afterImageUrl;

      const { error: updateError } = await supabaseAdmin
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (updateError) {
        console.warn('Failed to update project with image URLs:', updateError);
      } else {
        // Update local project object with new image URLs
        project.before_project_image = beforeImageUrl || project.before_project_image;
        project.after_project_image = afterImageUrl || project.after_project_image;
      }
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
      standardCertification: project.standard_certification || '-',
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image || null,
      afterProjectImage: project.after_project_image || null,
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

// Update task (temporarily disabled authentication for frontend testing)
router.put('/:id', async (req: any, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { id } = req.params;
    const taskData: Partial<TaskListItem> = req.body;
    
    // Debug logging for image data
    console.log('Update request for project:', id);
    console.log('Has beforeProjectImage:', taskData.beforeProjectImage !== undefined);
    console.log('Has afterProjectImage:', taskData.afterProjectImage !== undefined);
    if (taskData.beforeProjectImage !== undefined && taskData.beforeProjectImage !== null) {
      console.log('beforeProjectImage type:', typeof taskData.beforeProjectImage);
      console.log('beforeProjectImage starts with:', taskData.beforeProjectImage.substring(0, 50));
    }
    if (taskData.afterProjectImage !== undefined && taskData.afterProjectImage !== null) {
      console.log('afterProjectImage type:', typeof taskData.afterProjectImage);
      console.log('afterProjectImage starts with:', taskData.afterProjectImage.substring(0, 50));
    }

    // Check if task exists and get creator's role
    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('employee_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      throw createError('Task not found', 404);
    }

    // Form edit permissions: 
    // Admin users can edit forms in any status
    // Manager, Supervisor and Regular users can only edit forms in WAITING status
    // Exception: If only status is being changed (Best Kaizen approval), allow for any status
    const isStatusOnlyUpdate = Object.keys(taskData).length === 1 && taskData.status !== undefined;
    
    // Get user role from the request body (since auth might be disabled)
    // In production, this should come from req.user?.role after authentication
    const userRole = req.body.userRole || req.user?.role;
    const isAdmin = userRole === 'Admin';
    
    console.log('Edit permission check:', {
      userRole,
      isAdmin,
      taskStatus: existingTask.status,
      isStatusOnlyUpdate,
      taskData: Object.keys(taskData)
    });
    
    if (!isStatusOnlyUpdate && existingTask.status !== 'WAITING' && !isAdmin) {
      throw createError(`Can only edit forms when status is WAITING. Current status: ${existingTask.status}, User role: ${userRole}`, 403);
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
    const convertDateFormat = (dateStr: string): string => {
      if (!dateStr) return dateStr;
      
      // Check if it's already in ISO format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Convert DD/MM/YYYY to YYYY-MM-DD
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      return dateStr;
    };

    // Map frontend fields to database fields
    if (taskData.projectName !== undefined) updateData.project_name = taskData.projectName;
    if (taskData.position !== undefined) updateData.position = taskData.position;
    if (taskData.department !== undefined) updateData.department = taskData.department;
    if (taskData.fiveSGroupName !== undefined) updateData.five_s_group_name = taskData.fiveSGroupName;
    if (taskData.projectArea !== undefined) updateData.project_area = taskData.projectArea;
    if (taskData.projectStartDate !== undefined) updateData.project_start_date = convertDateFormat(taskData.projectStartDate);
    if (taskData.projectEndDate !== undefined) updateData.project_end_date = convertDateFormat(taskData.projectEndDate);
    if (taskData.problemsEncountered !== undefined) updateData.problems_encountered = taskData.problemsEncountered;
    if (taskData.solutionApproach !== undefined) updateData.solution_approach = taskData.solutionApproach;
    if (taskData.resultsAchieved !== undefined) updateData.results_achieved = taskData.resultsAchieved;
    if (taskData.fiveSType !== undefined) updateData.five_s_type = taskData.fiveSType;
    if (taskData.improvementTopic !== undefined) updateData.improvement_topic = taskData.improvementTopic;
    if (taskData.SGS_Smart !== undefined) updateData.sgs_smart = taskData.SGS_Smart;
    if (taskData.SGS_Strong !== undefined) updateData.sgs_strong = taskData.SGS_Strong;
    if (taskData.SGS_Green !== undefined) updateData.sgs_green = taskData.SGS_Green;
    // Handle image uploads separately - don't update database columns yet
    let beforeImageUrl: string | null = null;
    let afterImageUrl: string | null = null;
    let shouldUpdateImages = false;

    if (taskData.beforeProjectImage !== undefined) {
      if (taskData.beforeProjectImage === null) {
        // Delete existing image if present
        const { data: currentProject } = await supabaseAdmin
          .from('projects')
          .select('before_project_image')
          .eq('id', id)
          .single();
        
        if (currentProject?.before_project_image) {
          await deleteProjectImage(currentProject.before_project_image);
        }
        beforeImageUrl = null;
        shouldUpdateImages = true;
      } else {
        // Upload new image
        const beforeResult = await uploadProjectImage(taskData.beforeProjectImage, parseInt(id), 'before');
        if (beforeResult.error) {
          console.warn('Before image upload failed:', beforeResult.error);
        } else {
          beforeImageUrl = beforeResult.url;
          shouldUpdateImages = true;
        }
      }
    }

    if (taskData.afterProjectImage !== undefined) {
      if (taskData.afterProjectImage === null) {
        // Delete existing image if present
        const { data: currentProject } = await supabaseAdmin
          .from('projects')
          .select('after_project_image')
          .eq('id', id)
          .single();
        
        if (currentProject?.after_project_image) {
          await deleteProjectImage(currentProject.after_project_image);
        }
        afterImageUrl = null;
        shouldUpdateImages = true;
      } else {
        // Upload new image
        const afterResult = await uploadProjectImage(taskData.afterProjectImage, parseInt(id), 'after');
        if (afterResult.error) {
          console.warn('After image upload failed:', afterResult.error);
        } else {
          afterImageUrl = afterResult.url;
          shouldUpdateImages = true;
        }
      }
    }

    // Update image URLs in database if needed
    if (shouldUpdateImages) {
      if (taskData.beforeProjectImage !== undefined) {
        updateData.before_project_image = beforeImageUrl;
      }
      if (taskData.afterProjectImage !== undefined) {
        updateData.after_project_image = afterImageUrl;
      }
    }
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.formType !== undefined) updateData.form_type = taskData.formType;

    // Update submitted date when status changes to WAITING or APPROVED
    if (taskData.status && ['WAITING', 'APPROVED'].includes(taskData.status)) {
      updateData.submitted_date = new Date().toISOString();
      // Convert date to YYYY-MM-DD format for database compatibility
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      updateData.submitted_date_th = `${year}-${month}-${day}`;
    }

    const { data: project, error } = await supabaseAdmin
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
      standardCertification: project.standard_certification || '-',
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image || null,
      afterProjectImage: project.after_project_image || null,
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

// Delete task (temporarily disabled authentication for frontend testing)
router.delete('/:id', async (req: any, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { id } = req.params;

    // Check if task exists and user has permission
    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('employee_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      throw createError('Task not found', 404);
    }

    // Temporarily bypass permission checks for frontend testing
    // const userRole = req.user?.role;
    // const isOwner = existingTask.employee_id === req.user?.employeeId;
    // const canDelete = isOwner || ['Supervisor', 'Manager', 'Admin'].includes(userRole || '');

    // if (!canDelete) {
    //   throw createError('Insufficient permissions to delete this task', 403);
    // }

    const { error } = await supabaseAdmin
      .from('projects')
      .update({ status: 'DELETED' })
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

// Get tasks filtered by hierarchy (for Supervisor/Manager viewing subordinates' tasks)
router.get('/hierarchy/:userEmployeeId', async (req: any, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { userEmployeeId } = req.params;
    const {
      page = '1',
      limit = '10',
      status,
      formType,
      department,
      search,
      sortBy = 'created_date',
      sortOrder = 'desc'
    } = req.query;

    // First, get the user's role and find their subordinates
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('role, employee_id')
      .eq('employee_id', userEmployeeId)
      .single();

    if (userError || !currentUser) {
      throw createError('User not found', 404);
    }

    let allowedEmployeeIds: string[] = [];

    // If user is Supervisor, Manager, or Admin, include tasks from people they can approve
    if (['Supervisor', 'Manager', 'Admin'].includes(currentUser.role)) {
      const { data: approvableUsers, error: approveError } = await supabaseAdmin
        .from('users')
        .select('employee_id, first_name, last_name, role')
        .eq('approver', userEmployeeId);

      if (!approveError && approvableUsers) {
        console.log(`[Hierarchy] ${currentUser.role} ${userEmployeeId} can approve for:`, approvableUsers);
        // Only include subordinates' employee IDs, not the supervisor's own ID
        allowedEmployeeIds = approvableUsers.map(user => user.employee_id);
        console.log(`[Hierarchy] Mapped allowedEmployeeIds (should NOT include ${userEmployeeId}):`, allowedEmployeeIds);
      }
    }
    
    // If no subordinates found, return empty array to avoid showing any tasks
    if (allowedEmployeeIds.length === 0) {
      console.log(`[Hierarchy] No subordinates found for ${userEmployeeId}`);
      // Return empty result set
      res.json({
        success: true,
        data: {
          projects: [],
          pagination: {
            currentPage: parseInt(page as string),
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: parseInt(limit as string)
          }
        },
        message: 'No subordinate tasks found'
      });
      return;
    }

    console.log(`[Hierarchy] Final allowedEmployeeIds for ${userEmployeeId}:`, allowedEmployeeIds);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('projects')
      .select(`
        *,
        users!projects_employee_id_fkey (
          first_name,
          last_name,
          department,
          role,
          approver
        )
      `, { count: 'exact' })
      .in('employee_id', allowedEmployeeIds);

    // Always exclude DELETED status projects
    query = query.neq('status', 'DELETED');

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
      standardCertification: project.standard_certification || '-',
      resultsAchieved: project.results_achieved,
      fiveSType: project.five_s_type,
      improvementTopic: project.improvement_topic,
      SGS_Smart: project.sgs_smart,
      SGS_Strong: project.sgs_strong,
      SGS_Green: project.sgs_green,
      beforeProjectImage: project.before_project_image || null,
      afterProjectImage: project.after_project_image || null,
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
        },
        hierarchy: {
          userRole: currentUser.role,
          allowedEmployeeIds: allowedEmployeeIds
        }
      },
      message: 'Hierarchy tasks retrieved successfully'
    });

  } catch (error) {
    console.error('Get hierarchy tasks error:', error);
    
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

// Best Kaizen approval endpoint (Supervisor+ only)
router.patch('/:id/best-kaizen', async (req: any, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { id } = req.params;
    const { action, userEmployeeId } = req.body; // action: 'approve' or 'remove'

    if (!action || !userEmployeeId) {
      throw createError('Missing required fields: action and userEmployeeId', 400);
    }

    if (!['approve', 'remove'].includes(action)) {
      throw createError('Invalid action. Must be "approve" or "remove"', 400);
    }

    // Check if task exists
    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      throw createError('Task not found', 404);
    }

    // Check user permissions (Supervisor+ only)
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('employee_id', userEmployeeId)
      .single();

    if (userError || !user) {
      throw createError('User not found', 404);
    }

    if (!['Supervisor', 'Manager', 'Admin'].includes(user.role)) {
      throw createError('Insufficient permissions: Only Supervisor+ can approve Best Kaizen', 403);
    }

    // Determine new status based on action
    let newStatus: string;
    if (action === 'approve') {
      newStatus = 'BEST_KAIZEN';
    } else { // remove
      // Return to previous status (assume APPROVED for now, could be enhanced)
      newStatus = 'APPROVED';
    }

    // Update project status
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, status')
      .single();

    if (updateError) {
      throw createError(`Database error: ${updateError.message}`, 500);
    }

    res.json({
      success: true,
      data: {
        id: updatedProject.id,
        status: updatedProject.status
      },
      message: `Best Kaizen ${action === 'approve' ? 'approved' : 'removed'} successfully`
    });

  } catch (error) {
    console.error('Best Kaizen approval error:', error);
    
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
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
          department
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

    // Verify employee exists
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { data: employee, error: empError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, department')
      .eq('employee_id', taskData.employeeId)
      .single();

    if (empError || !employee) {
      throw createError('Employee not found', 404);
    }

    const now = new Date().toISOString();
    
    // First create the project without images to get the ID
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
      before_project_image: null, // Will be updated after project creation
      after_project_image: null,  // Will be updated after project creation
      created_date_th: new Date().toLocaleDateString('th-TH'),
      submitted_date_th: new Date().toLocaleDateString('th-TH'),
      status: taskData.status || 'EDIT',
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

    // Check if task exists and user has permission
    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('employee_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      throw createError('Task not found', 404);
    }

    // Temporarily bypass permission checks for frontend testing
    // const userRole = req.user?.role;
    // const isOwner = existingTask.employee_id === req.user?.employeeId;
    // const canEdit = isOwner || ['Supervisor', 'Manager', 'Admin'].includes(userRole || '');

    // if (!canEdit) {
    //   throw createError('Insufficient permissions to edit this task', 403);
    // }

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
      updateData.submitted_date_th = new Date().toLocaleDateString('th-TH');
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

export default router;
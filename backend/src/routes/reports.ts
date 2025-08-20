import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../config/database';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

interface ReportData {
  totalEmployees: number;
  submittedReports: number;
  notSubmittedReports: number;
  successRate: number;
  departments: DepartmentData[];
}

interface DepartmentData {
  name: string;
  code: string;
  employees: number;
  submitted: number;
  rate: number;
}

interface MonthlyReportResponse {
  [month: string]: ReportData;
}

// Get monthly reports data
router.get('/monthly', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { year = new Date().getFullYear(), month } = req.query;

    // Get all active users grouped by department
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('employee_id, department, is_active')
      .eq('is_active', true);

    if (usersError) {
      throw createError(`Database error: ${usersError.message}`, 500);
    }

    // Get departments data
    const { data: departments, error: deptError } = await supabaseAdmin
      .from('departments')
      .select('code, name')
      .eq('is_active', true);

    if (deptError) {
      throw createError(`Database error: ${deptError.message}`, 500);
    }

    // Create department mapping
    const deptMapping: { [key: string]: string } = {};
    departments?.forEach(dept => {
      deptMapping[dept.code] = dept.name;
    });

    // Group users by department
    const usersByDept: { [key: string]: string[] } = {};
    users?.forEach(user => {
      if (!usersByDept[user.department]) {
        usersByDept[user.department] = [];
      }
      usersByDept[user.department].push(user.employee_id);
    });

    const monthlyData: MonthlyReportResponse = {};

    // If specific month requested, only get that month
    const monthsToProcess = month 
      ? [month as string] 
      : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    for (const monthNum of monthsToProcess) {
      const startDate = `${year}-${monthNum.padStart(2, '0')}-01`;
      
      // Calculate the last day of the month properly
      const monthIndex = parseInt(monthNum) - 1;
      const lastDayOfMonth = new Date(parseInt(year as string), monthIndex + 1, 0).getDate();
      const endDate = `${year}-${monthNum.padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;

      // Get submitted reports for this month
      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select('employee_id, department, status, submitted_date')
        .gte('submitted_date', startDate)
        .lte('submitted_date', endDate)
        .in('status', ['APPROVED', 'WAITING', 'BEST_KAIZEN']);

      if (projectsError) {
        throw createError(`Database error: ${projectsError.message}`, 500);
      }

      // Count submissions by department
      const submissionsByDept: { [key: string]: Set<string> } = {};
      projects?.forEach(project => {
        if (!submissionsByDept[project.department]) {
          submissionsByDept[project.department] = new Set();
        }
        submissionsByDept[project.department].add(project.employee_id);
      });

      // Calculate department statistics
      const departmentStats: DepartmentData[] = [];
      let totalEmployees = 0;
      let totalSubmitted = 0;

      Object.entries(usersByDept).forEach(([deptCode, employeeIds]) => {
        const submittedEmployees = submissionsByDept[deptCode] || new Set();
        const employees = employeeIds.length;
        const submitted = submittedEmployees.size;
        const rate = employees > 0 ? Math.round((submitted / employees) * 100 * 10) / 10 : 0;

        departmentStats.push({
          name: deptMapping[deptCode] || deptCode,
          code: deptCode,
          employees,
          submitted,
          rate
        });

        totalEmployees += employees;
        totalSubmitted += submitted;
      });

      // Sort departments by code
      departmentStats.sort((a, b) => a.code.localeCompare(b.code));

      const monthName = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
      ][parseInt(monthNum) - 1];

      monthlyData[monthName] = {
        totalEmployees,
        submittedReports: totalSubmitted,
        notSubmittedReports: totalEmployees - totalSubmitted,
        successRate: totalEmployees > 0 ? Math.round((totalSubmitted / totalEmployees) * 100) : 0,
        departments: departmentStats
      };
    }

    res.json({
      success: true,
      data: month ? monthlyData[Object.keys(monthlyData)[0]] : monthlyData,
      message: 'Monthly reports retrieved successfully'
    });

  } catch (error) {
    console.error('Get monthly reports error:', error);
    
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

// Get yearly summary
router.get('/yearly', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!supabaseAdmin) {
      throw createError('Database configuration error', 500);
    }

    const { year = new Date().getFullYear() } = req.query;

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Get all users count
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('employee_id')
      .eq('is_active', true);

    if (usersError) {
      throw createError(`Database error: ${usersError.message}`, 500);
    }

    // Get submitted reports for the year
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('employee_id, status, submitted_date')
      .gte('submitted_date', startDate)
      .lte('submitted_date', endDate)
      .in('status', ['APPROVED', 'WAITING', 'BEST_KAIZEN']);

    if (projectsError) {
      throw createError(`Database error: ${projectsError.message}`, 500);
    }

    // Count unique employees who submitted
    const submittedEmployees = new Set(projects?.map(p => p.employee_id) || []);
    
    const totalEmployees = users?.length || 0;
    const totalSubmitted = submittedEmployees.size;
    const successRate = totalEmployees > 0 ? Math.round((totalSubmitted / totalEmployees) * 100) : 0;

    res.json({
      success: true,
      data: {
        year: parseInt(year as string),
        totalEmployees,
        submittedReports: totalSubmitted,
        notSubmittedReports: totalEmployees - totalSubmitted,
        successRate,
        totalProjects: projects?.length || 0
      },
      message: 'Yearly summary retrieved successfully'
    });

  } catch (error) {
    console.error('Get yearly summary error:', error);
    
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
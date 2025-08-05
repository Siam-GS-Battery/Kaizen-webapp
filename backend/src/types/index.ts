// Database Types
export interface User {
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  department: string;
  five_s_area: string;
  project_area: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Project {
  project_id: string;
  employee_id: string;
  project_name: string;
  project_start_date: string;
  project_end_date: string;
  problems_encountered: string;
  solution_approach: string;
  standard_certification?: string;
  results_achieved: string;
  five_s_type: FiveSType;
  improvement_topic: ImprovementTopic;
  sgs_smart: SGSSmart;
  sgs_strong: SGSStrong;
  sgs_green: SGSGreen;
  form_type: FormType;
  status: ProjectStatus;
  created_date: string;
  submitted_date?: string;
  created_by: string;
}

export interface ProjectImage {
  image_id: string;
  project_id: string;
  image_type: ImageType;
  file_name: string;
  file_path: string;
  s3_key?: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface Session {
  session_id: string;
  user_id: string;
  login_time: string;
  last_activity: string;
  logout_time?: string;
  ip_address: string;
  is_active: boolean;
}

// Enums
export type UserRole = 'Admin' | 'Manager' | 'Supervisor' | 'User';
export type FiveSType = 'ส1' | 'ส2' | 'ส3' | 'ส4' | 'ส5';
export type ImprovementTopic = 'Safety' | 'Env' | 'Quality' | 'Cost' | 'Delivery';
export type SGSSmart = 'People' | 'Factory';
export type SGSStrong = 'Energy_3R' | 'Workplace';
export type SGSGreen = 'Teamwork' | 'Branding';
export type FormType = 'genba' | 'suggestion' | 'best_kaizen';
export type ProjectStatus = 'DRAFT' | 'WAITING' | 'EDIT' | 'APPROVED' | 'REJECTED' | 'DELETED';
export type ImageType = 'before' | 'after';

// API Request/Response Types
export interface LoginRequest {
  employee_id: string;
  password?: string;
}

export interface LoginResponse {
  success: boolean;
  user: Omit<User, 'created_at' | 'updated_at'>;
  token: string;
  session_id: string;
}

export interface CreateProjectRequest {
  project_name: string;
  project_start_date: string;
  project_end_date: string;
  problems_encountered: string;
  solution_approach: string;
  results_achieved: string;
  five_s_type: FiveSType;
  improvement_topic: ImprovementTopic;
  sgs_smart: SGSSmart;
  sgs_strong: SGSStrong;
  sgs_green: SGSGreen;
  form_type: FormType;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  project_id: string;
}

export interface ProjectListResponse {
  projects: ProjectWithImages[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectWithImages extends Project {
  before_image?: ProjectImage;
  after_image?: ProjectImage;
  user?: Pick<User, 'first_name' | 'last_name' | 'department'>;
}

// Error Types
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Middleware Types
export interface AuthenticatedRequest extends Express.Request {
  user?: User;
  session?: Session;
}

// Database Query Types
export interface QueryFilters {
  employee_id?: string;
  department?: string;
  status?: ProjectStatus;
  form_type?: FormType;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
// =====================================================
// PROJEKTMANAGEMENT SYSTEM - TYPESCRIPT TYPES
// =====================================================

export type UserRole = 'user' | 'manager' | 'admin';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type ProjectMemberRole = 'owner' | 'manager' | 'member' | 'viewer';
export type FileType = 'upload' | 'task' | 'update' | 'invoice';

// =====================================================
// USER / PROFILE
// =====================================================
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  company: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

// =====================================================
// PROJECTS
// =====================================================
export interface PMProject {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  client_id: string | null;
  manager_id: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  budget: number | null;
  budget_used: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;

  // Relationen (optional, je nach Query)
  client?: Profile;
  manager?: Profile;
  members?: ProjectMember[];
  tasks?: Task[];
  task_count?: number;
  completed_task_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  created_at: string;

  // Relationen
  user?: Profile;
}

// =====================================================
// TASKS
// =====================================================
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assignee_id: string | null;
  created_by: string | null;
  parent_task_id: string | null;
  due_date: string | null;
  start_date: string | null;
  completed_at: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  position: number;
  tags: string[];
  created_at: string;
  updated_at: string;

  // Relationen
  assignee?: Profile;
  creator?: Profile;
  project?: PMProject;
  subtasks?: Task[];
  comments?: Comment[];
}

// =====================================================
// COMMENTS
// =====================================================
export interface Comment {
  id: string;
  task_id: string | null;
  project_id: string | null;
  content: string;
  author_id: string;
  parent_id: string | null;
  is_internal: boolean;
  attachments: CommentAttachment[];
  created_at: string;
  updated_at: string;

  // Relationen
  author?: Profile;
  replies?: Comment[];
}

export interface CommentAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

// =====================================================
// PROGRESS UPDATES
// =====================================================
export interface ProgressUpdate {
  id: string;
  project_id: string;
  task_id: string | null;
  title: string;
  content: string | null;
  progress_percentage: number | null;
  author_id: string;
  images: ProgressImage[];
  attachments: CommentAttachment[];
  is_public: boolean;
  created_at: string;

  // Relationen
  author?: Profile;
  project?: PMProject;
  task?: Task;
}

export interface ProgressImage {
  url: string;
  caption: string | null;
  uploaded_at: string;
}

// =====================================================
// INVOICES
// =====================================================
export interface Invoice {
  id: string;
  project_id: string;
  invoice_number: string;
  title: string;
  description: string | null;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  paid_at: string | null;
  pdf_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;

  // Relationen
  project?: PMProject;
  creator?: Profile;
}

// =====================================================
// ACTIVITY LOG
// =====================================================
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'commented'
  | 'uploaded'
  | 'status_changed'
  | 'assigned'
  | 'completed'
  | 'invoice_sent'
  | 'invoice_paid';

export type ActivityEntityType =
  | 'project'
  | 'task'
  | 'comment'
  | 'file'
  | 'invoice'
  | 'progress_update';

export interface ActivityLog {
  id: string;
  project_id: string | null;
  task_id: string | null;
  user_id: string | null;
  action: ActivityAction;
  entity_type: ActivityEntityType;
  entity_id: string | null;
  details: Record<string, unknown>;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;

  // Relationen
  user?: Profile;
  project?: PMProject;
  task?: Task;
}

// =====================================================
// PROJECT FILES
// =====================================================
export interface ProjectFile {
  id: string;
  project_id: string;
  task_id: string | null;
  name: string;
  original_name: string;
  file_type: FileType;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string;
  url: string | null;
  uploaded_by: string | null;
  description: string | null;
  created_at: string;

  // Relationen
  uploader?: Profile;
  project?: PMProject;
  task?: Task;
}

// =====================================================
// FORM TYPES
// =====================================================
export interface CreateProjectForm {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  client_id?: string;
  manager_id?: string;
  start_date?: string;
  due_date?: string;
  budget?: number;
}

export interface CreateTaskForm {
  project_id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignee_id?: string;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  tags?: string[];
}

export interface CreateCommentForm {
  content: string;
  task_id?: string;
  project_id?: string;
  parent_id?: string;
  is_internal?: boolean;
}

export interface CreateProgressUpdateForm {
  project_id: string;
  task_id?: string;
  title: string;
  content?: string;
  progress_percentage?: number;
  is_public?: boolean;
}

// =====================================================
// KANBAN TYPES
// =====================================================
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export type KanbanBoard = KanbanColumn[];

// =====================================================
// STATISTICS
// =====================================================
export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  progress_percentage: number;
  budget_percentage: number;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  pending_tasks: number;
  overdue_tasks: number;
  recent_activity: ActivityLog[];
}

/**
 * @deprecated Use '@/contexts/AuthContext' instead
 * This file re-exports from AuthContext for backwards compatibility
 */
export {
  useAuth,
  AuthProvider,
  canManageProject,
  canManageTasks,
  canViewAllProjects,
  canManageUsers,
  canDeleteProject,
  canUploadInvoices,
  canViewInternalComments,
} from '@/contexts/AuthContext';

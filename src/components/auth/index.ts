export { default as MfaVerification } from './MfaVerification';

// Hooks de permissões
export { useUserPermissions } from '@/hooks/useUserPermissions';
export { usePermissionsConfig } from '@/hooks/usePermissionsConfig';

// Services
export { permissionsService } from '@/services/permissions';

// Tipos
export type { 
  PermissionDetail,
  ResourceConfig,
  ResourceActionsResponse,
  ValidatePermissionResponse 
} from '@/types/auth';
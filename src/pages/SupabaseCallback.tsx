import SupabaseService from '@/services/integrations/supabaseService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const SupabaseCallback = createCallbackPage({
  integrationName: 'Supabase',
  service: SupabaseService,
  iconPath: '/integrations/supabase.png',
});

export default SupabaseCallback;

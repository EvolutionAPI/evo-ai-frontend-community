import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@evoapi/design-system';
import { Edit, Trash2 } from 'lucide-react';
import { Agent } from '@/types/agents';

interface AgentActionsDropdownProps {
  agent: Agent;
  trigger: React.ReactNode;
  onEdit: (agent: Agent) => void;
  onMoveToFolder?: (agent: Agent) => void;
  onExportAsJSON?: (agent: Agent) => void;
  onShare?: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  align?: 'start' | 'center' | 'end';
}

export default function AgentActionsDropdown({
  agent,
  trigger,
  onEdit,
  onDelete,
  align = 'end',
}: AgentActionsDropdownProps) {
  const { t } = useLanguage('agents');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuItem onClick={() => onEdit(agent)}>
          <Edit className="h-4 w-4 mr-2" />
          {t('dropdown.edit')}
        </DropdownMenuItem>
        {/* {onExportAsJSON && (
          <DropdownMenuItem onClick={() => onExportAsJSON(agent)}>
            <Download className="h-4 w-4 mr-2 text-purple-500" />
            {t('dropdown.exportJSON')}
          </DropdownMenuItem>
        )} */}
        {/* {onShare && (
          <DropdownMenuItem onClick={() => onShare(agent)}>
            <Share2 className="h-4 w-4 mr-2 text-blue-500" />
            {t('dropdown.share')}
          </DropdownMenuItem>
        )} */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(agent)}
          className="text-red-500 focus:text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t('dropdown.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

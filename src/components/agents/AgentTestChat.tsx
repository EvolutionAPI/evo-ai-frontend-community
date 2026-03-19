import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@evoapi/design-system';
import { Agent } from '@/types/agents';
import { AgentChatProvider } from '@/contexts/agents/AgentChatContext';
import { AgentChatSessionList, AgentChatArea } from '@/pages/Customer/Agents/Agent/chat';
import { useLanguage } from '@/hooks/useLanguage';

interface AgentTestChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent;
}

export default function AgentTestChat({ open, onOpenChange, agent }: AgentTestChatProps) {
  const { t } = useLanguage('aiAgents');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[90vw] !max-w-[90vw] h-[90vh] max-h-[90vh] overflow-hidden p-0 sm:!max-w-[90vw]">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('chat.chatWithAgent', { name: agent.name })}</DialogTitle>
          <DialogDescription>{t('chat.startConversation')}</DialogDescription>
        </DialogHeader>
        <AgentChatProvider agentId={agent.id} key={open ? 'open' : 'closed'}>
          <div className="flex h-full overflow-hidden">
            <AgentChatSessionList />
            <AgentChatArea agent={agent} />
          </div>
        </AgentChatProvider>
      </DialogContent>
    </Dialog>
  );
}

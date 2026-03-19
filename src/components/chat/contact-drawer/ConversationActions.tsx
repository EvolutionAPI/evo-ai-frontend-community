import React, { useState } from 'react';
import { Button } from '@evoapi/design-system/button';
import { Badge } from '@evoapi/design-system/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@evoapi/design-system/card';
import { Settings, UserPlus, UserMinus, Tag, Zap, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Conversation } from '@/types/chat/api';
import { useLanguage } from '@/hooks/useLanguage';

interface ConversationActionsProps {
  conversation: Conversation | null;
}

const ConversationActions: React.FC<ConversationActionsProps> = ({ conversation }) => {
  const { t } = useLanguage('chat');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!conversation) return;

    setIsUpdatingStatus(true);
    try {
      // TODO: Implementar API call para atualizar status
      // await chatService.updateConversationStatus(conversation.id, newStatus);

      toast.success(
        t('contactSidebar.conversationActions.status.changed', {
          status: getStatusDisplayName(newStatus),
        }),
      );
    } catch (error) {
      toast.error(t('contactSidebar.conversationActions.status.error'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (agentId: string | null) => {
    if (!conversation) return;

    setIsAssigning(true);
    try {
      // TODO: Implementar API call para atribuição
      // await chatService.assignConversation(conversation.id, agentId);

      if (agentId) {
        toast.success(t('contactSidebar.conversationActions.assignment.assignedSuccess'));
      } else {
        toast.success(t('contactSidebar.conversationActions.assignment.unassignedSuccess'));
      }
    } catch (error) {
      toast.error(t('contactSidebar.conversationActions.assignment.error'));
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusDisplayName = (status: string): string => {
    const statusMap = {
      open: t('contactSidebar.conversationActions.status.open'),
      resolved: t('contactSidebar.conversationActions.status.resolved'),
      pending: t('contactSidebar.conversationActions.status.pending'),
      snoozed: t('contactSidebar.conversationActions.status.snoozed'),
    };

    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('contactSidebar.conversationActions.status.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <StatusButton
              status="open"
              current={conversation?.status}
              onClick={() => handleStatusChange('open')}
              disabled={isUpdatingStatus}
            />
            <StatusButton
              status="resolved"
              current={conversation?.status}
              onClick={() => handleStatusChange('resolved')}
              disabled={isUpdatingStatus}
            />
            <StatusButton
              status="pending"
              current={conversation?.status}
              onClick={() => handleStatusChange('pending')}
              disabled={isUpdatingStatus}
            />
            <StatusButton
              status="snoozed"
              current={conversation?.status}
              onClick={() => handleStatusChange('snoozed')}
              disabled={isUpdatingStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t('contactSidebar.conversationActions.assignment.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* TODO: Implementar AssigneeSelector real */}
          <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
            {conversation?.assignee_id
              ? t('contactSidebar.conversationActions.assignment.assignedTo', {
                  id: conversation.assignee_id,
                })
              : t('contactSidebar.conversationActions.assignment.notAssigned')}
          </div>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleAssigneeChange(null)}
            disabled={isAssigning}
          >
            <UserMinus className="h-4 w-4 mr-2" />
            {t('contactSidebar.conversationActions.assignment.unassign')}
          </Button>
        </CardContent>
      </Card>

      {/* Labels Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {t('contactSidebar.conversationActions.labels.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Labels Atuais */}
          {conversation?.labels&& conversation.labels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {conversation.labels.map((label: any) => (
                <Badge key={label.id} variant="secondary" className="text-xs">
                  {label.title}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
              {t('contactSidebar.conversationActions.labels.noneApplied')}
            </div>
          )}

          {/* TODO: Implementar LabelsManager real */}
          <Button variant="outline" className="w-full justify-start">
            <Tag className="h-4 w-4 mr-2" />
            {t('contactSidebar.conversationActions.labels.manage')}
          </Button>
        </CardContent>
      </Card>

      {/* Prioridade da Conversa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('contactSidebar.conversationActions.priority.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/30">
            {/* TODO: Implementar seletor de prioridade real */}
            {t('contactSidebar.conversationActions.priority.none')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Status Button Component
interface StatusButtonProps {
  status: string;
  current?: string;
  onClick: () => void;
  disabled: boolean;
}

const StatusButton: React.FC<StatusButtonProps> = ({ status, current, onClick, disabled }) => {
  const { t } = useLanguage('chat');
  const isCurrent = status === current;

  const getStatusConfig = (status: string) => {
    const configs = {
      open: {
        label: t('contactSidebar.conversationActions.status.open'),
        color: 'text-blue-600 bg-blue-50 border-blue-200',
      },
      resolved: {
        label: t('contactSidebar.conversationActions.status.resolved'),
        color: 'text-green-600 bg-green-50 border-green-200',
      },
      pending: {
        label: t('contactSidebar.conversationActions.status.pending'),
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      },
      snoozed: {
        label: t('contactSidebar.conversationActions.status.snoozed'),
        color: 'text-purple-600 bg-purple-50 border-purple-200',
      },
    };

    return (
      configs[status as keyof typeof configs] || {
        label: status,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
      }
    );
  };

  const config = getStatusConfig(status);

  return (
    <Button
      variant={isCurrent ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`justify-start relative ${isCurrent ? '' : config.color}`}
    >
      {isCurrent && <Check className="h-3 w-3 mr-2" />}
      {config.label}
    </Button>
  );
};

export default ConversationActions;

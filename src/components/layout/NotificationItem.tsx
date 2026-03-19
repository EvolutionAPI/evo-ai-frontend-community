import { useLanguage } from '@/hooks/useLanguage';
import { Avatar, AvatarFallback, Button } from '@evoapi/design-system';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Notification } from '@/services/notifications/NotificationsService';

interface NotificationItemProps {
  notification: Notification;
  onOpen: (notification: Notification) => void;
  getTypeLabel: (type: string) => string;
}

export default function NotificationItem({
  notification,
  onOpen,
  getTypeLabel,
}: NotificationItemProps) {
  const { t } = useLanguage('layout');
  const isUnread = !notification.read_at;
  const assignee = notification.primary_actor_meta?.assignee;

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return t('notifications.item.someTimeAgo');
    }
  };

  const getAssigneeInitials = (name: string) => {
    if (!name) return t('notifications.item.noAssignee');
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClick = () => {
    onOpen(notification);
  };

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        onClick={handleClick}
        className="w-full h-auto p-0 justify-start hover:bg-muted/50"
      >
        <div className="flex items-center p-4 w-full border-b border-border hover:bg-muted/30 hover:rounded-md transition-colors">
          {/* Unread indicator */}
          {isUnread ? (
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
          ) : (
            <div className="w-2 flex-shrink-0" />
          )}

          {/* Content */}
          <div className="flex-1 ml-3 overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {notification.primary_actor?.id || notification.primary_actor_id ? (
                  <span className="font-bold text-foreground">
                    #{notification.primary_actor?.id || notification.primary_actor_id}
                  </span>
                ) : null}
                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md flex-shrink-0">
                  {getTypeLabel(notification.notification_type)}
                </span>
              </div>

              {/* Assignee avatar */}
              {assignee && (
                <div className="flex-shrink-0 ml-2">
                  <Avatar className="h-4 w-4">
                    {assignee.thumbnail ? (
                      <img
                        src={assignee.thumbnail}
                        alt={assignee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {getAssigneeInitials(assignee.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              )}
            </div>

            {/* Message title */}
            <div className="flex w-full mt-1">
              <span className="text-sm text-foreground truncate font-normal">
                {notification.push_message_title || t('notifications.item.noContent')}
              </span>
            </div>

            {/* Time */}
            <span className="flex mt-1 text-xs font-semibold text-muted-foreground">
              {formatTime(notification.last_activity_at)}
            </span>
          </div>
        </div>
      </Button>
    </div>
  );
}

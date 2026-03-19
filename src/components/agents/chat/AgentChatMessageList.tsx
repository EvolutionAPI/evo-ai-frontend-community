import { ChatMessage } from '@/types';
import { Bot } from 'lucide-react';
import { AgentChatMessage } from './AgentChatMessage';

interface AgentChatMessageListProps {
  messages: ChatMessage[];
  isSending: boolean;
}

export function AgentChatMessageList({ messages, isSending }: AgentChatMessageListProps) {
  // Filter out system messages without content (metadata messages)
  const visibleMessages = messages.filter(message => {
    // Skip messages with null content
    if (!message.content) return false;

    // Skip system messages without useful content
    if (message.author === 'system' || message.author === 'teste') {
      // Only show system messages if they have actual content parts
      if (!message.content.parts || message.content.parts.length === 0) {
        return false;
      }
      // Check if parts have any actual content (text, function calls, etc.)
      const hasContent = message.content.parts.some(
        (part: any) =>
          part.text ||
          part.function_call ||
          part.functionCall ||
          part.function_response ||
          part.functionResponse,
      );
      if (!hasContent) {
        return false;
      }
    }

    // Keep messages with actual content (user, model, or function calls/responses)
    return true;
  });

  return (
    <div className="space-y-4 w-full max-w-full">
      {visibleMessages.map(message => (
        <AgentChatMessage key={message.id} message={message} />
      ))}

      {isSending && (
        <div className="flex justify-start">
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-lg p-3 bg-muted border">
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

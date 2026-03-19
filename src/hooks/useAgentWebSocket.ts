import { useEffect, useRef, useCallback, useState } from 'react';

interface FileData {
  filename: string;
  content_type: string;
  data: string;
}

interface UseAgentWebSocketProps {
  agentId: string;
  externalId: string;
  userId?: string;
  jwt?: string;
  apiKey?: string;
  onEvent: (event: unknown) => void;
  onTurnComplete?: () => void;
}

interface PendingMessageData {
  message: string;
  files?: FileData[];
}

export function useAgentWebSocket({
  agentId,
  externalId,
  userId,
  jwt,
  apiKey,
  onEvent,
  onTurnComplete,
}: UseAgentWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [pendingMessage, setPendingMessage] = useState<PendingMessageData | null>(null);

  const getApiUrl = () => {
    // WebSocket está no evo-ai-processor, não no evo-ai-core-service
    return import.meta.env.VITE_AGENT_PROCESSOR_URL || 'http://localhost:8000';
  };

  const openWebSocket = useCallback(() => {
    if (!agentId || !externalId || (!jwt && !apiKey)) {
      return;
    }
    const apiUrl = getApiUrl();
    const wsUserId = userId || externalId; // Use provided userId or fallback to externalId

    // O endpoint do processor é /api/v1/chat/ws/{agent_id}/{user_id}/{session_id}
    // session_id é o externalId
    const wsUrl = `${apiUrl?.replace('http', 'ws').replace('https', 'wss')}/api/v1/chat/ws/${agentId}/${wsUserId}/${externalId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (apiKey) {
        ws.send(
          JSON.stringify({
            type: 'authorization',
            api_key: apiKey,
          })
        );
      } else if (jwt) {
        ws.send(
          JSON.stringify({
            type: 'authorization',
            token: jwt,
          })
        );
      }

      if (pendingMessage) {
        if (pendingMessage.files && pendingMessage.files.length > 0) {
          ws.send(JSON.stringify({ message: pendingMessage.message, files: pendingMessage.files }));
        } else {
          ws.send(JSON.stringify({ message: pendingMessage.message }));
        }
        setPendingMessage(null);
      }
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          let eventObj = data.message;
          if (typeof data.message === 'string' && data.message.trim() !== '') {
            try {
              eventObj = JSON.parse(data.message);
            } catch (e) {
              console.warn('[WebSocket] data.message is not valid JSON:', data.message);
            }
          }
          onEvent(eventObj);
        }
        if (data.turn_complete && onTurnComplete) {
          onTurnComplete();
        }
      } catch (err) {
        console.error('[WebSocket] Error processing message:', err, event.data);
      }
    };

    ws.onerror = err => {
      console.error('[WebSocket] connection error:', err);
    };

    ws.onclose = event => {
      console.warn('[WebSocket] connection closed:', event);
    };
  }, [agentId, externalId, userId, jwt, apiKey, onEvent, onTurnComplete, pendingMessage]);

  useEffect(() => {
    openWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [openWebSocket]);

  const sendMessage = useCallback(
    (msg: string, files?: FileData[]) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        if (files && files.length > 0) {
          wsRef.current.send(JSON.stringify({ message: msg, files }));
        } else {
          wsRef.current.send(JSON.stringify({ message: msg }));
        }
      } else {
        console.warn('[WebSocket] unable to send message, connection not open.');
        setPendingMessage({ message: msg, files });
        openWebSocket();
      }
    },
    [openWebSocket]
  );

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { sendMessage, disconnect };
}


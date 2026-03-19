import { Suspense } from 'react';
import { ChatProvider } from '@/contexts/chat/ChatContext';
import Chat from './Chat';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';

const ChatPage = () => {
  return (
    <ErrorBoundary>
      <ChatProvider>
        <Suspense fallback={<LoadingScreen fullScreen showLogo />}>
          <Chat />
        </Suspense>
      </ChatProvider>
    </ErrorBoundary>
  );
};

export default ChatPage;

import { useLanguage } from '@/hooks/useLanguage';

const Tutorials = () => {
  const { t } = useLanguage('tutorials');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
      </div>
      <div className="flex-1 px-6 pb-6">
        <div className="w-full h-full min-h-[700px] rounded-lg overflow-hidden border border-border">
          <iframe
            src="https://gateway.evolutionfoundation.com.br/embed/phrP4kOXKKROpUxwCoJJsCn8wVLzRVhuyrufdNS9raghOOmw74XBYzO5NfKbc8UY"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            style={{ border: 'none', borderRadius: '8px', minHeight: '700px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Tutorials;

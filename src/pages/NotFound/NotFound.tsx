import { Button } from '@evoapi/design-system';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useLanguage('notFound');

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-gray-500">{t('description')}</p>
      <Button color="primary" onClick={() => navigate('/')}>
        {t('button.backToHome')}
      </Button>
    </div>
  );
};

export default NotFound;

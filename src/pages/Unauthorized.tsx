import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage('unauthorized');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Ícone */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldX className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900">{t('title')}</h1>
          <p className="text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Descrição */}
        <div className="bg-white shadow rounded-lg p-6 text-left space-y-4">
          <p className="text-sm text-gray-700">
            {t('description')}
          </p>

          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong className="font-semibold">{t('contactAdmin.title')}</strong>
              <br />
              {t('contactAdmin.message')}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('buttons.back')}
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            {t('buttons.goHome')}
          </button>
        </div>

        {/* Informações Adicionais */}
        <div className="text-xs text-gray-500">
          <p>{t('errorCode')}</p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

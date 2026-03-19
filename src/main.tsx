import { createRoot } from 'react-dom/client';
import "@evoapi/design-system/styles";
import './styles/globals.css';
import './i18n/config'; // Importar configuração do i18n
import App from './App.tsx';
import { initTheme } from './utils/themeUtils';
import { initClarity } from './utils/clarityUtils';
import { initGA4 } from './utils/ga4Utils';

// Inicialização do tema antes do React montar
initTheme();

// Inicialização do Microsoft Clarity Analytics
initClarity();

// Inicialização do Google Analytics 4
initGA4();

// ⚡ OTIMIZAÇÃO: StrictMode removido para evitar duplicação de requests
// Em desenvolvimento, StrictMode executa useEffect 2x para detectar problemas
createRoot(document.getElementById('root')!).render(
    <App />
);

import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@evoapi/design-system';
import { FileText, Search, BookOpen, Code, Video, Download } from 'lucide-react';

const Documentacao = () => {
  const { t } = useLanguage('documentation');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('header.title')}</h1>
            <p className="text-muted-foreground">
              {t('header.subtitle')}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t('header.downloadPdf')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Documentation Sidebar */}
        <div className="w-80 border-r bg-card/50">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Quick Start */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  {t('sections.quickStart.title')}
                </h3>
                <div className="space-y-1">
                  {[
                    t('sections.quickStart.items.introduction'),
                    t('sections.quickStart.items.firstSteps'),
                    t('sections.quickStart.items.initialSetup'),
                    t('sections.quickStart.items.basicTutorial'),
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guides */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  {t('sections.guides.title')}
                </h3>
                <div className="space-y-1">
                  {[
                    t('sections.guides.items.managingAgents'),
                    t('sections.guides.items.knowledgeBase'),
                    t('sections.guides.items.chatSettings'),
                    t('sections.guides.items.apiIntegration'),
                    t('sections.guides.items.backupRestore'),
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Reference */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  {t('sections.apiReference.title')}
                </h3>
                <div className="space-y-1">
                  {[
                    t('sections.apiReference.items.authentication'),
                    t('sections.apiReference.items.agentEndpoints'),
                    t('sections.apiReference.items.chatApi'),
                    t('sections.apiReference.items.webhooks'),
                    t('sections.apiReference.items.errorCodes'),
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm"
                    >
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Tutorials */}
              <div>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  {t('sections.videoTutorials.title')}
                </h3>
                <div className="space-y-1">
                  {[
                    t('sections.videoTutorials.items.initialSetup'),
                    t('sections.videoTutorials.items.firstAgent'),
                    t('sections.videoTutorials.items.advancedChat'),
                    t('sections.videoTutorials.items.bestPractices'),
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm"
                    >
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="p-6 border-b bg-background/95">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t('content.title')}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('content.lastUpdated', { date: '15 de dezembro de 2024' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  {t('content.edit')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('content.share')}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {t('content.welcome.title')}
                </h3>
                <p className="text-blue-800">
                  {t('content.welcome.description')}
                </p>
              </div>

              <h2>{t('content.whatIs.title')}</h2>
              <p>
                {t('content.whatIs.description')}
              </p>

              <h2>{t('content.mainFeatures.title')}</h2>
              <ul>
                <li>
                  <strong>{t('content.mainFeatures.customAgents.title')}</strong> {t('content.mainFeatures.customAgents.description')}
                </li>
                <li>
                  <strong>{t('content.mainFeatures.smartChat.title')}</strong> {t('content.mainFeatures.smartChat.description')}
                </li>
                <li>
                  <strong>{t('content.mainFeatures.knowledgeBase.title')}</strong> {t('content.mainFeatures.knowledgeBase.description')}
                </li>
                <li>
                  <strong>{t('content.mainFeatures.advancedSettings.title')}</strong> {t('content.mainFeatures.advancedSettings.description')}
                </li>
              </ul>

              <h2>{t('content.gettingStarted.title')}</h2>
              <p>{t('content.gettingStarted.description')}</p>

              <ol>
                <li dangerouslySetInnerHTML={{ __html: t('content.gettingStarted.steps.step1') }} />
                <li dangerouslySetInnerHTML={{ __html: t('content.gettingStarted.steps.step2') }} />
                <li dangerouslySetInnerHTML={{ __html: t('content.gettingStarted.steps.step3') }} />
                <li dangerouslySetInnerHTML={{ __html: t('content.gettingStarted.steps.step4') }} />
              </ol>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">{t('content.tip.title')}</h3>
                <p className="text-yellow-800">
                  {t('content.tip.description')}
                </p>
              </div>

              <h2>{t('content.support.title')}</h2>
              <p>
                {t('content.support.description')}
              </p>
              <ul>
                <li>{t('content.support.email')}</li>
                <li>{t('content.support.chat')}</li>
                <li>{t('content.support.documentation')}</li>
              </ul>

              <div className="text-center py-8 border-t mt-8">
                <p className="text-muted-foreground">
                  {t('content.demo.message')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentacao;

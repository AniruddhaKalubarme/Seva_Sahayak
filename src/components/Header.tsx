import { FileText, Shield, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 tricolor-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-glow">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('appName')}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">{t('appTagline')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-success" />
              <span>{t('secureProcessing')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-accent" />
              <span>{t('poweredBy')}</span>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

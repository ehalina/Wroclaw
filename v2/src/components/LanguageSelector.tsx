import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
];

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageSelect = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);

    // Save to localStorage (i18next handles this automatically)
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full hover:bg-primary/20 transition-all duration-300"
            aria-label="Выбрать язык"
          >
            <div className="flex items-center justify-center">
              <span className="text-lg">{currentLang.flag}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="center" 
          className="glass border-0 backdrop-blur-md min-w-48"
          sideOffset={8}
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`
                flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md
                hover:bg-primary/20 transition-colors duration-200
                ${i18n.language === language.code ? 'bg-primary/10' : ''}
              `}
            >
              <span className="text-lg">{language.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {language.nativeName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language.name}
                </div>
              </div>
              {i18n.language === language.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant for settings or main menu
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-foreground font-medieval">
        Выберите язык
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={i18n.language === language.code ? 'default' : 'ghost'}
            onClick={() => handleLanguageSelect(language.code)}
            className={`
              flex items-center gap-3 justify-start h-auto p-3 rounded-lg
              transition-all duration-200 hover:scale-[1.02]
              ${i18n.language === language.code ? 'bg-primary text-background' : 'hover:bg-primary/10'}
            `}
          >
            <span className="text-xl">{language.flag}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">
                {language.nativeName}
              </div>
              <div className="text-xs opacity-70">
                {language.name}
              </div>
            </div>
            {i18n.language === language.code && (
              <Check className="w-5 h-5" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
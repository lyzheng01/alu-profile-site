import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supportedLanguages, translationService } from '../services/translationService';

interface TranslationContextType {
  currentLanguage: string;
  isLoading: boolean;
  changeLanguage: (language: string) => Promise<void>;
  t: (key: string, defaultValue?: string) => string;
  hasTranslation: (key: string) => boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const resolveInitialLanguage = (pathname: string, fallbackLanguage: string = 'en'): string => {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return supportedLanguages.some((language) => language.code === firstSegment)
    ? firstSegment
    : fallbackLanguage;
};

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = React.useState(() => resolveInitialLanguage(
    typeof window === 'undefined' ? '/' : window.location.pathname,
    translationService.getCurrentLanguage()
  ));
  const [isLoading, setIsLoading] = React.useState(true);
  const [translationsReady, setTranslationsReady] = React.useState(false);
  const [, forceUpdate] = React.useState({}); // 用于强制刷新
  const location = useLocation();

  // 初始化时根据URL设置语言
  useEffect(() => {
    const initTranslations = async () => {
      setIsLoading(true);
      setTranslationsReady(false);
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0];
      const urlLanguage = supportedLanguages.some((language) => language.code === firstSegment)
        ? firstSegment
        : null;
      const savedLanguage = localStorage.getItem('language') || 'en';
      const targetLanguage = urlLanguage || savedLanguage;
      
      try {
        const translations = await translationService.loadTranslations(targetLanguage);
        setCurrentLanguage(targetLanguage);
        setTranslationsReady(Object.keys(translations).length > 0);
        forceUpdate({});
      } finally {
        setIsLoading(false);
      }
    };
    
    initTranslations();
  }, [location.pathname]);

  // 监听翻译服务的变化
  useEffect(() => {
    const handleTranslationChange = () => {
      const lang = translationService.getCurrentLanguage();
      setCurrentLanguage(lang);
      forceUpdate({}); // 关键：强制刷新所有依赖翻译的组件
    };

    translationService.addListener(handleTranslationChange);

    return () => {
      translationService.removeListener(handleTranslationChange);
    };
  }, []);

  // 切换语言
  const changeLanguage = async (language: string) => {
    setIsLoading(true);
    setTranslationsReady(false);
    try {
      const translations = await translationService.loadTranslations(language);
      setCurrentLanguage(language);
      setTranslationsReady(Object.keys(translations).length > 0);
      localStorage.setItem('language', language); // 保存到localStorage
      forceUpdate({}); // 关键：强制刷新所有依赖翻译的组件
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取翻译文本
  const t = (key: string, defaultValue?: string): string => {
    return translationService.getText(key, defaultValue);
  };

  // 检查是否有翻译
  const hasTranslation = (key: string): boolean => {
    return translationService.hasTranslation(key);
  };

  const value: TranslationContextType = {
    currentLanguage,
    isLoading,
    changeLanguage,
    t,
    hasTranslation,
  };

  return (
    <TranslationContext.Provider value={value}>
      <div style={{ display: 'contents' }} data-translation-ready={translationsReady && !isLoading ? 'true' : 'false'}>
        {children}
      </div>
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

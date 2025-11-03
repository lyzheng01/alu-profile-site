import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { translationService } from '../services/translationService';

interface TranslationContextType {
  currentLanguage: string;
  isLoading: boolean;
  changeLanguage: (language: string) => Promise<void>;
  t: (key: string, defaultValue?: string) => string;
  hasTranslation: (key: string) => boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = React.useState(translationService.getCurrentLanguage());
  const [isLoading, setIsLoading] = React.useState(false);
  const [, forceUpdate] = React.useState({}); // 用于强制刷新
  const location = useLocation();

  // 从URL获取语言代码
  const getLanguageFromUrl = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    const supportedLanguages = ['en', 'zh', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'hi'];
    
    if (supportedLanguages.includes(firstSegment)) {
      return firstSegment;
    }
    return null;
  };

  // 初始化时根据URL设置语言
  useEffect(() => {
    const initTranslations = async () => {
      const urlLanguage = getLanguageFromUrl();
      const savedLanguage = localStorage.getItem('language') || 'en';
      const targetLanguage = urlLanguage || savedLanguage;
      
      await translationService.loadTranslations(targetLanguage);
      setCurrentLanguage(targetLanguage);
      forceUpdate({});
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
    try {
      await translationService.loadTranslations(language);
      setCurrentLanguage(language);
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
      {children}
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
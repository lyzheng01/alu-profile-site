import { useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { setPageTitle, setNewsDetailTitle } from '../utils/titleManager';

// Custom hook for title + meta description.
export const usePageTitle = (pageKey: string, customTitle?: string, customDescription?: string) => {
  const { currentLanguage } = useTranslation();

  useEffect(() => {
    setPageTitle(pageKey, currentLanguage, customTitle, customDescription);
  }, [pageKey, currentLanguage, customTitle, customDescription]);
};

// 自定义Hook用于设置新闻详情页标题
export const useNewsDetailTitle = (articleTitle?: string) => {
  const { currentLanguage } = useTranslation();
  
  useEffect(() => {
    if (articleTitle) {
      setNewsDetailTitle(articleTitle, currentLanguage);
    } else {
      setPageTitle('newsDetail', currentLanguage);
    }
  }, [articleTitle, currentLanguage]);
};

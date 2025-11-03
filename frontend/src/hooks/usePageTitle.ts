import { useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { setPageTitle, setNewsDetailTitle } from '../utils/titleManager';

// 自定义Hook用于设置页面标题
export const usePageTitle = (pageKey: string, customTitle?: string) => {
  const { currentLanguage } = useTranslation();
  
  useEffect(() => {
    setPageTitle(pageKey, currentLanguage, customTitle);
  }, [pageKey, currentLanguage, customTitle]);
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

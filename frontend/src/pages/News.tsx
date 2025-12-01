import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { usePageTitle, useNewsDetailTitle } from '../hooks/usePageTitle';

interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
  created_at: string;
  updated_at: string;
  author: string;
  featured_image?: string;
}

interface Tag {
  id: number;
  name: string;
  description: string;
}

// 新闻详情页面组件
const NewsDetail: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // 设置页面标题
  useNewsDetailTitle(article?.title);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.ARTICLES}${articleId}/`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
        } else {
          // 如果文章不存在，重定向到新闻列表
          navigate(`/${currentLanguage}/news`);
        }
      } catch (error) {
        console.error('获取文章详情失败:', error);
        navigate(`/${currentLanguage}/news`);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId, navigate]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('status_loading', 'Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate(`/${currentLanguage}/news`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to News
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(`/${currentLanguage}/news`)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </button>

        {/* 文章标题 */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">{article.title}</h1>

        {/* 文章元信息 */}
        <div className="flex items-center text-gray-500 text-sm mb-6">
          <span>By {article.author}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(article.created_at)}</span>
        </div>

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map(tag => (
              <span
                key={tag.id}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 特色图片 */}
        {article.featured_image && (
          <div className="mb-8">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full max-h-[600px] object-contain rounded-lg bg-gray-50"
            />
          </div>
        )}

        {/* 文章摘要 */}
        {article.summary && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Summary</h2>
            <p className="text-gray-600 leading-relaxed">{article.summary}</p>
          </div>
        )}

        {/* 文章内容 */}
        <div className="prose max-w-none">
          <div 
            className="text-gray-700 leading-relaxed text-lg [&>p]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:mt-6 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3 [&>h3]:mt-5 [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:mb-2 [&>h4]:mt-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>li]:mb-1 [&>strong]:font-bold [&>b]:font-bold [&>em]:italic [&>i]:italic [&>u]:underline [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:mb-4 [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>pre]:bg-gray-100 [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:mb-4 [&>a]:text-blue-600 [&>a]:underline [&>a]:hover:text-blue-800 [&>img]:max-w-full [&>img]:w-full [&>img]:h-auto [&>img]:object-contain [&>img]:rounded-lg [&>img]:mb-4 [&>img]:bg-gray-50 [&>table]:w-full [&>table]:border-collapse [&>table]:mb-4 [&>table>thead]:bg-gray-50 [&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-gray-300 [&>table>thead>tr>th]:px-4 [&>table>thead>tr>th]:py-2 [&>table>thead>tr>th]:text-left [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-gray-300 [&>table>tbody>tr>td]:px-4 [&>table>tbody>tr>td]:py-2 [&>hr]:border-gray-300 [&>hr]:my-6"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
          />
        </div>

        
      </div>
      
      <FloatingContactButtons />
    </div>
  );
};

// 新闻列表页面组件
const NewsList: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  // 设置页面标题
  usePageTitle('news');

  // 获取新闻数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ARTICLES);
        if (response.ok) {
          const data = await response.json();
          setArticles(data.results || data);
        }
      } catch (error) {
        console.error('获取新闻数据失败:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TAGS);
        if (response.ok) {
          const data = await response.json();
          setTags(data.results || data);
        }
      } catch (error) {
        console.error('获取标签数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
    fetchTags();
  }, []);

  // 过滤新闻（只按标签筛选，不搜索）
  const filteredArticles = articles.filter(article => {
    const matchesTag = selectedTag === null || 
      article.tags.some(tag => tag.id === selectedTag);
    return matchesTag;
  });

  // 分页
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('status_loading', 'Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('page_news_title', 'News')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('page_news_subtitle', 'Industry news, technical trends, company updates')}
            </p>
          </div>
        </div>
      </div>

                           <div className="max-w-7xl mx-auto px-8 py-12">
                {/* 标签筛选 */}
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTag === null
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {t('news_category_all', 'All')}
                    </button>
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedTag === tag.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 新闻列表 */}
                {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('status_no_data', 'No news data')}</p>
            <p className="text-gray-400 mt-2">Please add news in the admin panel</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentArticles.map(article => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/${currentLanguage}/news/${article.id}`)}
                >
                  {/* 文章图片 */}
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 文章信息 */}
                  <div className="p-6">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <span>{article.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    
                                         <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                       {article.summary || (article.content ? article.content.substring(0, 150).replace(/\n/g, ' ') + '...' : 'No content available')}
                     </p>

                    {/* 标签 */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag.id}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${currentLanguage}/news/${article.id}`);
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('news_read_more', 'Read More')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 新闻统计 */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Found <span className="font-semibold text-blue-600">{filteredArticles.length}</span> news articles
          </p>
        </div>
      </div>
      
      <FloatingContactButtons />
    </div>
  );
};

// 主组件 - 根据路由参数决定显示列表还是详情
const News: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  
  // 如果有articleId参数，显示详情页面
  if (articleId) {
    return <NewsDetail />;
  }
  
  // 否则显示列表页面
  return <NewsList />;
};

export default News; 
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useTranslation } from '../contexts/TranslationContext';
import { usePageTitle } from '../hooks/usePageTitle';

interface CompanyInfo {
  id: number;
  key: string;
  value: string;
  info_type: string;
}

interface Advantage {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface Certificate {
  id: number;
  name: string;
  description: string;
  image: string;
  issue_date: string;
}

interface FactoryImage {
  id: number;
  title: string;
  description: string;
  image: string;
}

const About: React.FC = () => {
  const { t } = useTranslation();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo[]>([]);
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [factoryImages, setFactoryImages] = useState<FactoryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // 设置页面标题
  usePageTitle('about');

  // 获取公司信息
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取公司基本信息
        const infoResponse = await fetch(API_ENDPOINTS.COMPANY_INFO);
        if (infoResponse.ok) {
          const infoData = await infoResponse.json();
          setCompanyInfo(infoData.results || infoData);
        }

        // 获取公司优势
        const advantagesResponse = await fetch(API_ENDPOINTS.ADVANTAGES);
        if (advantagesResponse.ok) {
          const advantagesData = await advantagesResponse.json();
          setAdvantages(advantagesData.results || advantagesData);
        }

        // 获取证书信息
        const certificatesResponse = await fetch(API_ENDPOINTS.CERTIFICATES);
        if (certificatesResponse.ok) {
          const certificatesData = await certificatesResponse.json();
          setCertificates(certificatesData.results || certificatesData);
        }

        // 获取工厂图片
        const factoryResponse = await fetch(API_ENDPOINTS.FACTORY_IMAGES);
        if (factoryResponse.ok) {
          const factoryData = await factoryResponse.json();
          setFactoryImages(factoryData.results || factoryData);
        }
      } catch (error) {
        console.error('Failed to fetch company information:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取特定类型的公司信息
  const getCompanyInfo = (key: string) => {
    const info = companyInfo.find(item => item.key === key);
    return info ? info.value : '';
  };

  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
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
              {t('about_title', 'About Us')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('about_subtitle', 'Professional aluminum profile manufacturer, your trusted partner')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* 公司简介 */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {t('about_company_intro', 'Company Introduction')}
              </h2>
              <div className="prose text-gray-600 leading-relaxed">
                <p className="mb-4">
                  {getCompanyInfo('company_introduction') || t('about_company_intro_content', 'We are a professional aluminum profile manufacturer with 15 years of industry experience. We are committed to providing customers with high-quality aluminum products and solutions, with products exported to more than 60 countries and regions worldwide.')}
                </p>
                <p className="mb-4">
                  {getCompanyInfo('company_mission') || t('about_company_mission', 'Our mission is to create greater value for customers through innovative technology and quality service, and to become a leader in the aluminum profile industry.')}
                </p>
                <p>
                  {getCompanyInfo('company_vision') || t('about_company_vision', 'We are committed to sustainable development, focusing on environmental protection and quality, providing customers with the best products and services.')}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-200 h-96 rounded-lg overflow-hidden">
                {factoryImages.length > 0 ? (
                  <img
                    src={factoryImages[0].image}
                    alt="Company Factory"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 公司数据 */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {getCompanyInfo('years_experience') || '15'}
              </div>
              <div className="text-gray-600">
                {t('about_years_experience', 'Years of Experience')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {getCompanyInfo('export_countries') || '60+'}
              </div>
              <div className="text-gray-600">
                {t('about_export_countries', 'Export Countries')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {getCompanyInfo('annual_production') || '50000'}
              </div>
              <div className="text-gray-600">
                {t('about_annual_production', 'Annual Production (tons)')}
              </div>
            </div>
          </div>
        </div>

        {/* 公司优势 */}
        {advantages.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {t('about_our_advantages', 'Our Advantages')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('about_why_choose_us', 'Why Choose Us')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advantages.map(advantage => (
                <div key={advantage.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 证书认证 */}
        {certificates.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Certifications
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our Quality Assurance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificates.map(certificate => (
                <div key={certificate.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={certificate.image}
                      alt={certificate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {certificate.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {certificate.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      Issue Date: {new Date(certificate.issue_date).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 工厂展示 */}
        {factoryImages.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {t('factory_showcase', 'Factory Showcase')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('factory_subtitle', 'Advanced production equipment and modern factory')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {factoryImages.map(image => (
                <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-64 bg-gray-200 overflow-hidden">
                    <img
                      src={image.image}
                      alt={image.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {image.title}
                    </h3>
                    <p className="text-gray-600">
                      {image.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 联系信息 */}
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {t('contact_us', 'Contact Us')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('contact_subtitle', 'Always ready to provide professional service support')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('contact_email', 'Email')}</h3>
              <p className="text-gray-600">{getCompanyInfo('email') || 'info@lingyealu.cn'}</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('contact_phone', 'Phone')}</h3>
              <p className="text-gray-600">{getCompanyInfo('phone') || '+86 18326081058'}</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('contact_address', 'Address')}</h3>
              <p className="text-gray-600">{getCompanyInfo('address') || 'Hefei, Anhui, China'}</p>
            </div>
            <div className="text-center">
              <div className="text-green-600 mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('contact_whatsapp', 'WhatsApp')}</h3>
              <p className="text-gray-600">{getCompanyInfo('whatsapp') || '+86 18326081058'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 
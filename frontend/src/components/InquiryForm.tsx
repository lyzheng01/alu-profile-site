import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { trackEvent } from '../utils/analytics';
import { useTranslation } from '../contexts/TranslationContext';

type QuoteLanguage = 'en' | 'zh' | 'es' | 'pt';

const quoteCopy: Record<QuoteLanguage, Record<string, string>> = {
  en: {
    title: 'Get a Quote', intro: 'Tell us what you need and our team will follow up with you.',
    name: 'Name', namePlaceholder: 'Your full name', email: 'Email', emailPlaceholder: 'you@example.com',
    company: 'Company name', companyPlaceholder: 'Your company name', country: 'Country / region', countryPlaceholder: 'Your country or region',
    subject: 'Subject', subjectPlaceholder: 'What is your inquiry about?', message: 'Message',
    messagePlaceholder: 'Share the specifications, quantity, finish, or delivery requirements you would like us to review.',
    productLink: 'The product page link will be included with your inquiry.', submitting: 'Sending…', submit: 'Send inquiry',
    success: 'Your inquiry has been sent. We will be in touch.', submitError: 'We could not send your inquiry. Please try again.',
    networkError: 'Connection error. Check your internet connection and try again.',
  },
  zh: {
    title: '获取报价', intro: '请告诉我们您的需求，我们会与您联系。',
    name: '姓名', namePlaceholder: '请输入您的姓名', email: '电子邮箱', emailPlaceholder: 'you@example.com',
    company: '公司名称', companyPlaceholder: '请输入公司名称', country: '国家/地区', countryPlaceholder: '请输入国家或地区',
    subject: '咨询主题', subjectPlaceholder: '请简要说明咨询内容', message: '需求说明',
    messagePlaceholder: '请填写产品规格、数量、表面处理或交付要求。',
    productLink: '产品页面链接会随咨询内容一并发送。', submitting: '正在提交…', submit: '提交询价',
    success: '询价已提交，我们会与您联系。', submitError: '询价未能提交，请重试。',
    networkError: '网络连接失败，请检查网络后重试。',
  },
  es: {
    title: 'Solicitar cotización', intro: 'Cuéntenos qué necesita y nuestro equipo se pondrá en contacto con usted.',
    name: 'Nombre', namePlaceholder: 'Escriba su nombre completo', email: 'Correo electrónico', emailPlaceholder: 'nombre@ejemplo.com',
    company: 'Empresa', companyPlaceholder: 'Nombre de su empresa', country: 'País o región', countryPlaceholder: 'País o región',
    subject: 'Asunto', subjectPlaceholder: '¿Sobre qué trata su consulta?', message: 'Mensaje',
    messagePlaceholder: 'Indique las especificaciones, la cantidad, el acabado o los requisitos de entrega que desea consultar.',
    productLink: 'El enlace de este producto se incluirá en su consulta.', submitting: 'Enviando…', submit: 'Enviar consulta',
    success: 'Su consulta se ha enviado. Nos pondremos en contacto con usted.', submitError: 'No se pudo enviar su consulta. Inténtelo de nuevo.',
    networkError: 'Error de conexión. Compruebe su conexión a Internet e inténtelo de nuevo.',
  },
  pt: {
    title: 'Solicitar orçamento', intro: 'Diga-nos o que precisa e a nossa equipa entrará em contacto consigo.',
    name: 'Nome', namePlaceholder: 'Introduza o seu nome completo', email: 'E-mail', emailPlaceholder: 'nome@exemplo.com',
    company: 'Empresa', companyPlaceholder: 'Nome da empresa', country: 'País/região', countryPlaceholder: 'País ou região',
    subject: 'Assunto', subjectPlaceholder: 'Sobre o que pretende falar?', message: 'Mensagem',
    messagePlaceholder: 'Indique as especificações, a quantidade, o acabamento ou os requisitos de entrega que pretende consultar.',
    productLink: 'O link desta página do produto será incluído no seu pedido.', submitting: 'A enviar…', submit: 'Enviar pedido',
    success: 'O seu pedido foi enviado. Entraremos em contacto consigo.', submitError: 'Não foi possível enviar o pedido. Tente novamente.',
    networkError: 'Erro de ligação. Verifique a sua ligação à Internet e tente novamente.',
  },
};

interface InquiryFormProps {
  productName?: string;
  productLink?: string;
  onSuccess?: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ productName, productLink, onSuccess }) => {
  const { currentLanguage } = useTranslation();
  const copy = quoteCopy[currentLanguage as QuoteLanguage] || quoteCopy.en;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    country: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // 构建消息内容，自动附加产品链接
      let messageContent = formData.message;
      if (productLink) {
        messageContent += `\n\n---\nProduct Link: ${productLink}`;
      }
      if (productName) {
        messageContent += `\nProduct Name: ${productName}`;
      }

      const response = await fetch(API_ENDPOINTS.INQUIRIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          subject: formData.subject,
          message: messageContent,
          product_name: productName || '',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        trackEvent('generate_lead', {
          method: 'inquiry_form',
          page_path: typeof window !== 'undefined' ? window.location.pathname : '',
          product_name: productName || '',
        });
        setFormData({
          name: '',
          email: '',
          company: '',
          country: '',
          subject: '',
          message: '',
        });
        if (onSuccess) {
          onSuccess();
        }
        // 3秒后重置状态
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 3000);
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(currentLanguage === 'en' && errorData.message ? errorData.message : copy.submitError);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
      setErrorMessage(copy.networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">{copy.title}</h2>
        <p className="text-blue-100 text-sm mt-1">{copy.intro}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={copy.namePlaceholder}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.email} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={copy.emailPlaceholder}
            />
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.company}
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={copy.companyPlaceholder}
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.country}
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={copy.countryPlaceholder}
            />
          </div>
        </div>

        {/* Subject */}
        <div className="mt-6">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            {copy.subject} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder={copy.subjectPlaceholder}
          />
        </div>

        {/* Message */}
        <div className="mt-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            {copy.message} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            placeholder={copy.messagePlaceholder}
          />
          {productLink && (
            <p className="text-xs text-gray-500 mt-1">
              {copy.productLink}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {copy.submitting}
              </span>
            ) : (
              copy.submit
            )}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">{copy.success}</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default InquiryForm;


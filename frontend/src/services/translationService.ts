// 前端翻译服务
class TranslationService {
  private translations: Record<string, any> = {};
  private currentLanguage: string = 'en';
  private listeners: Array<() => void> = [];

  // 添加监听器
  addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  // 移除监听器
  removeListener(listener: () => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // 设置当前语言
  setLanguage(language: string) {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.notifyListeners();
  }

  // 获取当前语言
  getCurrentLanguage(): string {
    return this.currentLanguage || localStorage.getItem('language') || 'en';
  }

  // 加载翻译内容
  async loadTranslations(language: string = 'en') {
    try {
      // 使用与API配置相同的逻辑
      let base = '';
      if (process.env.REACT_APP_API_URL) {
        base = process.env.REACT_APP_API_URL.replace(/\/$/, '');
      } else if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          base = origin;
        } else {
          base = 'http://lingyealu.cn';
        }
      }
      const response = await fetch(`${base}/api/translations/frontend_content/?lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        this.translations = data.content || {}; // 保证为对象
        this.currentLanguage = language;
        this.notifyListeners(); // 通知监听器翻译已更新
        return this.translations;
      } else {
        console.error(`[TranslationService] 响应错误: ${response.status}`);
      }
    } catch (error) {
      console.error('加载翻译失败:', error);
    }
    this.translations = {}; // 加载失败也保证为对象
    return {};
  }

  // 获取翻译文本
  getText(key: string, defaultValue?: string): string {
    if (!this.translations || typeof this.translations !== 'object') return defaultValue || key;
    const translation = this.translations[key];
    if (translation) {
      return translation;
    }
    
    // 如果没有翻译，返回默认值或键名
    return defaultValue || key;
  }

  // 翻译单个文本
  async translateText(key: string, language: string = 'zh'): Promise<string> {
    try {
      const base = (process.env.REACT_APP_API_URL || window.location.origin).replace(/\/$/, '');
      const response = await fetch(`${base}/api/translations/translate_frontend/?key=${encodeURIComponent(key)}&lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        return data.translated_text;
      }
    } catch (error) {
      console.error('翻译失败:', error);
    }
    return key;
  }

  // 获取所有翻译内容
  getAllTranslations(): Record<string, any> {
    return this.translations;
  }

  // 检查是否有翻译
  hasTranslation(key: string): boolean {
    return key in this.translations;
  }

  // 强制刷新翻译
  async refreshTranslations() {
    const currentLang = this.getCurrentLanguage();
    await this.loadTranslations(currentLang);
  }
}

// 创建全局翻译服务实例
export const translationService = new TranslationService();

// 导出翻译函数
export const t = (key: string, defaultValue?: string): string => {
  return translationService.getText(key, defaultValue);
};

// 支持的语言列表（英语优先，精简为4种主要语言）
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: '中文', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

export default translationService; 
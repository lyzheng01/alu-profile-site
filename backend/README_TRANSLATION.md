# 翻译系统使用说明

## 概述

本系统采用混合翻译策略，支持多种触发方式，既避免了实时翻译的高成本，又避免了数据库字段过多的问题。

## 翻译策略

### 1. 静态内容
- 使用Django i18n（翻译文件）
- 适用于页面标题、按钮文字等固定内容

### 2. 动态内容（产品、分类等）
- 一次性翻译并保存到JSON文件
- 按需从文件读取翻译内容
- 支持缓存机制

### 3. 用户生成内容
- 按需翻译 + 缓存
- 适用于评论、留言等

## 翻译触发方式

### 🚀 **1. 自动翻译（推荐）**
**触发时机**：产品/分类保存时自动触发
**优点**：无需手动操作，内容添加后立即翻译
**实现**：Django信号 + Google翻译API

```python
# 在后台添加产品时，会自动翻译到所有支持的语言
# 无需任何手动操作
```

### 🎯 **2. 手动翻译**
**触发时机**：后台管理界面手动触发
**优点**：可以控制翻译时机，避免不必要的翻译
**实现**：后台管理界面 + 翻译按钮

```bash
# 在后台管理界面，每个产品/分类都有翻译状态显示
# 点击"翻译"按钮可以手动触发翻译
```

### 📝 **3. 批量翻译**
**触发时机**：命令行批量处理
**优点**：适合大量数据处理，支持强制重新翻译
**实现**：Django管理命令

```bash
# 翻译所有产品到英文
python manage.py translate_content --language en --model all

# 强制重新翻译所有内容
python manage.py translate_content --language en --model all --force

# 翻译到所有支持的语言
python manage.py translate_content --all-languages --model all
```

### 🔄 **4. 按需翻译**
**触发时机**：前端访问时检查并翻译缺失内容
**优点**：确保所有内容都有翻译
**实现**：API检查 + 自动翻译

## 使用方法

### 1. 自动翻译（默认启用）

产品或分类保存时会自动翻译到所有支持的语言：

```python
# 在后台添加产品
product = Product.objects.create(
    name="铝型材",
    description="高品质铝型材产品",
    features="耐用, 轻便, 防腐",
    applications="建筑, 汽车, 电子"
)
# 系统会自动翻译到英文、西班牙语等11种语言
```

### 2. 手动翻译

在后台管理界面：

1. 进入产品管理页面
2. 查看"翻译状态"列
   - ✅ 已翻译（绿色）
   - ⚠ 部分翻译（橙色）
   - ✗ 未翻译（红色）
3. 点击"翻译"按钮手动触发翻译

### 3. 批量翻译命令

```bash
# 翻译所有产品到英文
python manage.py translate_content --language en --model all

# 只翻译产品
python manage.py translate_content --language en --model product

# 只翻译分类
python manage.py translate_content --language en --model category

# 翻译到其他语言
python manage.py translate_content --language es --model all

# 强制重新翻译所有内容
python manage.py translate_content --language en --model all --force

# 翻译到所有支持的语言
python manage.py translate_content --all-languages --model all
```

### 4. API调用示例

```bash
# 获取中文产品列表（默认）
GET /api/products/

# 获取英文产品列表
GET /api/products/?lang=en

# 获取西班牙语产品列表
GET /api/products/?lang=es

# 获取分类列表（英文）
GET /api/categories/?lang=en
```

### 5. 前端使用

```javascript
// 根据当前语言获取产品数据
const language = localStorage.getItem('language') || 'zh';
const response = await fetch(`/api/products/?lang=${language}`);
```

## 支持的语言

- `zh` - 中文（默认）
- `en` - 英文
- `es` - 西班牙语
- `pt` - 葡萄牙语
- `fr` - 法语
- `de` - 德语
- `it` - 意大利语
- `ru` - 俄语
- `ja` - 日语
- `ko` - 韩语
- `ar` - 阿拉伯语
- `hi` - 印地语

## 文件结构

```
backend/
├── translations/           # 翻译文件目录
│   ├── product_en.json    # 产品英文翻译
│   ├── product_es.json    # 产品西班牙语翻译
│   ├── category_en.json   # 分类英文翻译
│   └── category_es.json   # 分类西班牙语翻译
```

## 翻译文件格式

```json
{
  "name_1": "Aluminum Profile",
  "description_1": "High quality aluminum profile for industrial use",
  "features_1": "Durable, Lightweight, Corrosion resistant",
  "applications_1": "Construction, Automotive, Electronics"
}
```

## 性能优化

1. **文件缓存**：翻译内容保存在JSON文件中，读取速度快
2. **内存缓存**：使用Django缓存系统，避免重复读取文件
3. **批量翻译**：一次性翻译多个内容，减少API调用次数
4. **延迟机制**：翻译时添加延迟，避免API限制
5. **Google翻译API**：使用高质量的Google翻译服务

## 翻译状态

系统会显示每个内容的翻译状态：

- **已完成**：所有字段都已翻译
- **部分完成**：部分字段已翻译
- **未开始**：尚未翻译
- **不需要**：中文内容不需要翻译

## 扩展性

### 添加新的翻译字段

1. 在 `TranslationService.translate_model_batch()` 中添加新字段
2. 在序列化器中添加对应的翻译字段
3. 重新运行翻译命令

### 添加新的模型

1. 创建模型的序列化器
2. 在 `TranslationService` 中添加模型处理逻辑
3. 创建翻译命令
4. 在视图中添加语言支持
5. 添加Django信号

## 注意事项

1. **翻译质量**：使用Google翻译API，翻译质量较高
2. **API限制**：Google翻译API有调用次数限制
3. **文件管理**：定期清理不需要的翻译文件
4. **备份**：重要翻译内容建议备份
5. **网络依赖**：翻译需要网络连接

## 故障排除

### 翻译不显示
1. 检查翻译文件是否存在
2. 检查文件格式是否正确
3. 检查API调用是否成功
4. 检查网络连接

### 翻译文件损坏
1. 删除损坏的翻译文件
2. 重新运行翻译命令

### API调用失败
1. 检查网络连接
2. 检查Google翻译API是否可用
3. 检查API限制

### 自动翻译不工作
1. 检查Django信号是否正确注册
2. 检查 `apps.py` 中的 `ready()` 方法
3. 检查翻译服务是否正常工作 
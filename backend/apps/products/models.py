from django.db import models
from django.utils import timezone


class Category(models.Model):
    """产品分类"""
    name = models.CharField('分类名称', max_length=100)
    description = models.TextField('分类描述', blank=True)
    image = models.ImageField('分类图片', upload_to='categories/', blank=True)
    slug = models.SlugField('URL别名', unique=True, blank=True)
    order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('是否激活', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '产品分类'
        verbose_name_plural = '产品分类'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class SubCategory(models.Model):
    """产品子分类"""
    parent_category = models.ForeignKey(Category, on_delete=models.CASCADE, 
                                       related_name='subcategories', verbose_name='父分类')
    name = models.CharField('子分类名称', max_length=100)
    description = models.TextField('子分类描述', blank=True)
    image = models.ImageField('子分类图片', upload_to='subcategories/', blank=True)
    slug = models.SlugField('URL别名', unique=True, blank=True)
    order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('是否激活', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '产品子分类'
        verbose_name_plural = '产品子分类'
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.parent_category.name} - {self.name}"


class Product(models.Model):
    """产品"""
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='所属分类')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True, 
                                   verbose_name='所属子分类')
    name = models.CharField('产品名称', max_length=200)
    description = models.TextField('产品描述')
    features = models.TextField('产品特性', blank=True)
    applications = models.TextField('应用领域', blank=True)
    specifications = models.TextField('技术规格', blank=True)
    
    # 产品参数字段
    range_param = models.CharField('Range', max_length=200, blank=True, default='OEM factory supply aluminium profiles')
    type_param = models.CharField('Type', max_length=200, blank=True, default='For door and window profiles')
    surface_treatment = models.CharField('Surface Treatment', max_length=300, blank=True, 
                                       default='Mill Finished, Anodized, Powder Coated, Electrohoresis, Wood Grain')
    colors = models.CharField('Colors', max_length=300, blank=True, 
                             default='Silver, White, Black, Bronze, Champagne, Golden or customized')
    grade = models.CharField('Grade', max_length=100, blank=True, default='6063 Series')
    temper = models.CharField('Temper', max_length=100, blank=True, default='T5, T6')
    
    slug = models.SlugField('URL别名', unique=True, blank=True)
    is_featured = models.BooleanField('是否推荐', default=False)
    is_active = models.BooleanField('是否激活', default=True)
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '产品'
        verbose_name_plural = '产品'
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """产品图片"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', verbose_name='产品')
    image = models.ImageField('图片', upload_to='products/')
    caption = models.CharField('图片说明', max_length=200, blank=True)
    is_primary = models.BooleanField('是否主图', default=False)
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '产品图片'
        verbose_name_plural = '产品图片'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.product.name} - {self.caption or '图片'}"
    
    def save(self, *args, **kwargs):
        """保存时确保只有一个主图"""
        if self.is_primary:
            # 将同一产品的其他图片设为非主图
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)


class TranslationLog(models.Model):
    """翻译日志"""
    TRANSLATION_TYPES = [
        ('frontend', '前端内容'),
        ('product', '产品内容'),
        ('category', '分类内容'),
        ('article', '资讯内容'),
        ('all', '所有内容'),
    ]
    
    STATUS_CHOICES = [
        ('success', '成功'),
        ('failed', '失败'),
        ('partial', '部分成功'),
    ]
    
    translation_type = models.CharField('翻译类型', max_length=20, choices=TRANSLATION_TYPES)
    target_language = models.CharField('目标语言', max_length=10)
    status = models.CharField('状态', max_length=10, choices=STATUS_CHOICES)
    message = models.TextField('消息', blank=True)
    logs = models.TextField('详细日志', blank=True)
    items_processed = models.IntegerField('处理项目数', default=0)
    items_success = models.IntegerField('成功项目数', default=0)
    items_failed = models.IntegerField('失败项目数', default=0)
    duration = models.FloatField('耗时(秒)', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '翻译日志'
        verbose_name_plural = '翻译日志'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_translation_type_display()} - {self.target_language} - {self.get_status_display()}"
    
    @property
    def success_rate(self):
        """成功率"""
        if self.items_processed == 0:
            return 0
        return round((self.items_success / self.items_processed) * 100, 2)


class ProductSpecification(models.Model):
    """产品技术规格"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specification_items', verbose_name='产品')
    name = models.CharField('规格名称', max_length=200)
    value = models.TextField('规格值')
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '产品技术规格'
        verbose_name_plural = '产品技术规格'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductFeature(models.Model):
    """产品特性"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='feature_items', verbose_name='产品')
    name = models.CharField('特性名称', max_length=200)
    description = models.TextField('特性描述')
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '产品特性'
        verbose_name_plural = '产品特性'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductApplication(models.Model):
    """产品应用领域"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='application_items', verbose_name='产品')
    name = models.CharField('应用名称', max_length=200)
    description = models.TextField('应用描述')
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '产品应用领域'
        verbose_name_plural = '产品应用领域'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


class TranslationManagement(models.Model):
    """翻译管理（虚拟模型）"""
    name = models.CharField('名称', max_length=100, default='翻译管理')
    description = models.TextField('描述', blank=True)
    
    class Meta:
        verbose_name = '翻译管理'
        verbose_name_plural = '翻译管理'
    
    def __str__(self):
        return self.name

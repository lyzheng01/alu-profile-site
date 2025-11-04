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
    
    # ⭐新增：产品关联模板
    template = models.ForeignKey(
        'ProductTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name='关联模板',
        help_text='如果指定，优先使用此模板；否则自动匹配分类/子分类模板'
    )
    use_template = models.BooleanField(
        '使用模板内容',
        default=True,
        help_text='如果为False，则不使用任何模板，只使用产品自定义数据'
    )
    
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
    image = models.ImageField('应用场景图片', upload_to='applications/', blank=True, null=True)
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


class ProductTemplate(models.Model):
    """产品模板 - 用于存储同一类型产品的通用信息"""
    name = models.CharField('模板名称', max_length=200, help_text='模板的显示名称')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='templates', 
                                null=True, blank=True, verbose_name='关联分类', 
                                help_text='如果设置，该分类下的产品可以使用此模板')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='templates',
                                   null=True, blank=True, verbose_name='关联子分类',
                                   help_text='如果设置，该子分类下的产品可以使用此模板（优先级高于分类模板）')
    
    # 默认参数（参考Product模型的参数字段）
    range_param = models.CharField('Range', max_length=200, blank=True, default='OEM factory supply aluminium profiles')
    type_param = models.CharField('Type', max_length=200, blank=True, default='For door and window profiles')
    surface_treatment = models.CharField('Surface Treatment', max_length=300, blank=True, 
                                       default='Mill Finished, Anodized, Powder Coated, Electrohoresis, Wood Grain')
    colors = models.CharField('Colors', max_length=300, blank=True, 
                             default='Silver, White, Black, Bronze, Champagne, Golden or customized')
    grade = models.CharField('Grade', max_length=100, blank=True, default='6063 Series')
    temper = models.CharField('Temper', max_length=100, blank=True, default='T5, T6')
    
    # 默认描述和内容
    description = models.TextField('产品描述', blank=True)
    features_text = models.TextField('特性文本', blank=True)
    applications_text = models.TextField('应用文本', blank=True)
    specifications_text = models.TextField('规格文本', blank=True)
    packaging_details = models.TextField('包装详情', blank=True)
    
    # 商业信息
    oem_available = models.BooleanField('支持OEM', default=True)
    free_samples = models.CharField('免费样品', max_length=200, blank=True, 
                                   default='Available, about 1 days can be sent')
    supply_ability = models.CharField('供应能力', max_length=200, blank=True)
    payment_terms = models.CharField('付款方式', max_length=200, blank=True)
    product_origin = models.CharField('产品产地', max_length=200, blank=True, default='Foshan China')
    shipping_port = models.CharField('发货港口', max_length=200, blank=True, 
                                    default='Shenzhen/Guangzhou/Foshan')
    lead_time = models.CharField('交期', max_length=200, blank=True, default='7-15 Days')
    
    # 状态
    is_active = models.BooleanField('是否激活', default=True)
    order = models.IntegerField('排序', default=0, help_text='数字越小越靠前')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        verbose_name = '产品模板'
        verbose_name_plural = '产品模板'
        ordering = ['order', 'name']
    
    def __str__(self):
        if self.subcategory:
            return f"{self.name} ({self.subcategory.name})"
        elif self.category:
            return f"{self.name} ({self.category.name})"
        return self.name


class TemplateSpecification(models.Model):
    """模板技术规格"""
    template = models.ForeignKey(ProductTemplate, on_delete=models.CASCADE, related_name='specification_items', 
                                verbose_name='模板')
    name = models.CharField('规格名称', max_length=200)
    value = models.TextField('规格值')
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '模板技术规格'
        verbose_name_plural = '模板技术规格'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"


class TemplateFeature(models.Model):
    """模板特性"""
    template = models.ForeignKey(ProductTemplate, on_delete=models.CASCADE, related_name='feature_items',
                                verbose_name='模板')
    name = models.CharField('特性名称', max_length=200)
    description = models.TextField('特性描述')
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '模板特性'
        verbose_name_plural = '模板特性'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"


class TemplateApplication(models.Model):
    """模板应用领域"""
    template = models.ForeignKey(ProductTemplate, on_delete=models.CASCADE, related_name='application_items',
                                verbose_name='模板')
    name = models.CharField('应用名称', max_length=200)
    description = models.TextField('应用描述')
    image = models.ImageField('应用场景图片', upload_to='template_applications/', blank=True)
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '模板应用领域'
        verbose_name_plural = '模板应用领域'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"


class TemplateFactoryImage(models.Model):
    """模板工厂图片"""
    template = models.ForeignKey(ProductTemplate, on_delete=models.CASCADE, related_name='factory_images',
                                verbose_name='模板')
    title = models.CharField('图片标题', max_length=200)
    description = models.TextField('图片描述', blank=True)
    image = models.ImageField('工厂图片', upload_to='template_factory/')
    category = models.CharField('图片分类', max_length=50, blank=True, 
                               help_text='如：factory, production, quality, packaging')
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '模板工厂图片'
        verbose_name_plural = '模板工厂图片'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.template.name} - {self.title}"


class TemplateProcess(models.Model):
    """模板工艺处理"""
    template = models.ForeignKey(
        ProductTemplate, 
        on_delete=models.CASCADE, 
        related_name='process_items',
        verbose_name='模板'
    )
    name = models.CharField('工艺名称', max_length=200, help_text='如：阳极氧化、粉末喷涂、电泳、木纹转印等')
    description = models.TextField('工艺描述', help_text='详细的工艺处理说明')
    image = models.ImageField('工艺图片', upload_to='template_process/', blank=True, null=True)
    order = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        verbose_name = '模板工艺处理'
        verbose_name_plural = '模板工艺处理'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"
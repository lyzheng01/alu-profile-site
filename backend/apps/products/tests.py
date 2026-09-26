import tempfile
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.middleware import SessionMiddleware
from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from django.template.loader import render_to_string
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse
from unittest import mock

from .admin import ProductAdmin
from .models import (
    Category,
    Product,
    ProductApplication,
    ProductFeature,
    ProductImage,
    ProductSpecification,
    ProductTemplate,
    SubCategory,
)
from .services import add_product_images, clone_product


class AdminThemeTests(TestCase):
    def test_admin_base_site_references_aluminum_admin_css(self):
        html = render_to_string("admin/base_site.html", {})

        self.assertIn("aluminum_admin.css", html)


class ProductCloneTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.translation_patcher = mock.patch(
            'apps.products.signals.translation_service.auto_translate_on_save',
            autospec=True,
        )
        cls.translation_patcher.start()

    @classmethod
    def tearDownClass(cls):
        cls.translation_patcher.stop()
        super().tearDownClass()

    def setUp(self):
        self.category = Category.objects.create(name='Industrial Profiles')
        self.subcategory = SubCategory.objects.create(
            parent_category=self.category,
            name='T Slot',
        )
        self.product = Product.objects.create(
            category=self.category,
            subcategory=self.subcategory,
            name='4040 Aluminum Profile',
            description='Original product description',
            features='Original features',
            applications='Original applications',
            specifications='Original specs',
            range_param='Original range',
            type_param='Original type',
            surface_treatment='Anodized',
            colors='Silver',
            grade='6063',
            temper='T5',
            slug='4040-aluminum-profile',
            is_featured=True,
            order=9,
        )
        ProductImage.objects.create(
            product=self.product,
            image=SimpleUploadedFile('product.jpg', b'product-image-content', content_type='image/jpeg'),
            caption='Main image',
            is_primary=True,
            order=1,
        )
        ProductSpecification.objects.create(
            product=self.product,
            name='Width',
            value='40mm',
            order=1,
        )
        ProductFeature.objects.create(
            product=self.product,
            name='High Strength',
            description='Suitable for industrial frames',
            order=1,
        )
        ProductApplication.objects.create(
            product=self.product,
            name='Automation Line',
            description='Used in assembly structures',
            image=SimpleUploadedFile('application.jpg', b'application-image-content', content_type='image/jpeg'),
            order=1,
        )

    def test_clone_product_copies_product_and_related_content(self):
        cloned = clone_product(self.product)

        self.assertNotEqual(cloned.id, self.product.id)
        self.assertEqual(cloned.category, self.product.category)
        self.assertEqual(cloned.subcategory, self.product.subcategory)
        self.assertEqual(cloned.description, self.product.description)
        self.assertEqual(cloned.features, self.product.features)
        self.assertEqual(cloned.applications, self.product.applications)
        self.assertEqual(cloned.specifications, self.product.specifications)
        self.assertEqual(cloned.range_param, self.product.range_param)
        self.assertEqual(cloned.type_param, self.product.type_param)
        self.assertEqual(cloned.surface_treatment, self.product.surface_treatment)
        self.assertEqual(cloned.colors, self.product.colors)
        self.assertEqual(cloned.grade, self.product.grade)
        self.assertEqual(cloned.temper, self.product.temper)
        self.assertEqual(cloned.name, '4040 Aluminum Profile - Copy')
        self.assertTrue(cloned.slug.startswith(f'product-copy-{self.product.id}-'))
        self.assertNotEqual(cloned.slug, self.product.slug)
        self.assertFalse(cloned.is_featured)
        self.assertEqual(cloned.order, 0)

        self.assertEqual(cloned.images.count(), 0)

        self.assertEqual(cloned.specification_items.count(), 1)
        self.assertEqual(cloned.specification_items.first().name, 'Width')
        self.assertEqual(cloned.feature_items.count(), 1)
        self.assertEqual(cloned.feature_items.first().name, 'High Strength')
        self.assertEqual(cloned.application_items.count(), 1)
        self.assertEqual(cloned.application_items.first().name, 'Automation Line')
        self.assertEqual(
            cloned.application_items.first().image.name,
            self.product.application_items.first().image.name,
        )

    def test_admin_clone_view_creates_copy_and_redirects_to_change_page(self):
        user = get_user_model().objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='password123',
        )
        request = RequestFactory().get('/admin/products/product/clone/')
        request.user = user
        session_middleware = SessionMiddleware(lambda req: None)
        session_middleware.process_request(request)
        request.session.save()
        setattr(request, '_messages', FallbackStorage(request))

        model_admin = ProductAdmin(Product, AdminSite())
        response = model_admin.clone_product_view(request, self.product.id)

        cloned = Product.objects.exclude(id=self.product.id).get()
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            reverse('admin:products_product_change', args=[cloned.id]),
        )

    def test_admin_change_page_includes_clone_action_field_for_existing_product(self):
        model_admin = ProductAdmin(Product, AdminSite())

        fields = model_admin.get_fields(request=None, obj=self.product)

        self.assertIn('clone_actions', fields)
        self.assertIn('新增类似产品', model_admin.clone_actions(self.product))

    def test_admin_list_display_places_clone_button_after_name(self):
        model_admin = ProductAdmin(Product, AdminSite())
        list_display = list(model_admin.get_list_display(request=None))

        self.assertEqual(list_display[0], 'primary_image_preview')
        self.assertEqual(list_display[1], 'name')
        self.assertEqual(list_display[2], 'clone_button')

    def test_product_admin_list_display_has_product_manager_columns(self):
        model_admin = ProductAdmin(Product, AdminSite())
        list_display = list(model_admin.get_list_display(request=None))

        self.assertIn('primary_image_preview', list_display)
        self.assertIn('publish_status_badge', list_display)
        self.assertIn('image_count', list_display)
        self.assertIn('clone_button', list_display)

    def test_admin_fieldsets_group_product_form_for_cleaner_editing(self):
        model_admin = ProductAdmin(Product, AdminSite())
        fieldsets = model_admin.get_fieldsets(request=None, obj=self.product)
        titles = [fieldset[0] for fieldset in fieldsets]

        self.assertEqual(
            titles,
            ['快速操作', '快速上传', '外贸参数', '内容描述', '发布设置'],
        )

    def test_product_admin_fieldsets_include_batch_images_in_quick_upload(self):
        model_admin = ProductAdmin(Product, AdminSite())
        fields = [
            field
            for _, options in model_admin.get_fieldsets(request=None, obj=self.product)
            for field in options['fields']
        ]

        self.assertIn('batch_images', fields)


class ProductImageBatchUploadTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.translation_patcher = mock.patch(
            'apps.products.signals.translation_service.auto_translate_on_save',
            autospec=True,
        )
        cls.translation_patcher.start()

    @classmethod
    def tearDownClass(cls):
        cls.translation_patcher.stop()
        super().tearDownClass()

    def setUp(self):
        self.category = Category.objects.create(name='Industrial Profiles')

    def test_add_product_images_marks_first_image_primary_when_product_has_no_images(self):
        product = Product.objects.create(
            category=self.category,
            name='Test Profile',
            description='Test',
        )
        files = [
            SimpleUploadedFile('a.jpg', b'file-a', content_type='image/jpeg'),
            SimpleUploadedFile('b.jpg', b'file-b', content_type='image/jpeg'),
        ]

        created = add_product_images(product, files)

        self.assertEqual(len(created), 2)
        self.assertTrue(created[0].is_primary)
        self.assertFalse(created[1].is_primary)
        self.assertEqual(product.images.count(), 2)


class ProductTemplateSeedCommandTests(TestCase):
    def test_seed_product_templates_creates_common_templates(self):
        call_command('seed_product_templates')

        names = set(ProductTemplate.objects.values_list('name', flat=True))
        self.assertIn('Window and Door Aluminium Profile', names)
        self.assertIn('Industrial T-Slot Aluminium Profile', names)
        self.assertIn('Tile Trim and Decorative Aluminium Profile', names)
        self.assertIn('Tube and Common Aluminium Profile', names)
        self.assertIn('Custom OEM Aluminium Extrusion', names)


class SeedLingyeCatalogCommandTests(TestCase):
    def test_seed_lingye_catalog_creates_five_categories_and_twenty_products_idempotently(self):
        with tempfile.TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            call_command('seed_lingye_catalog')

            self.assertEqual(Category.objects.count(), 5)
            self.assertEqual(Product.objects.count(), 20)
            self.assertEqual(ProductImage.objects.count(), 20)
            self.assertEqual(Product.objects.values_list('features', flat=True).distinct().count(), 20)
            self.assertEqual(
                set(Category.objects.values_list('slug', flat=True)),
                {'cabinet-profiles', 'industrial-profiles', 't-slot-profiles', 'windows-doors', 'standard-aluminium-profiles'},
            )
            self.assertTrue(Product.objects.filter(slug='south-america-window-door-extrusions').exists())
            self.assertTrue(Product.objects.filter(slug='africa-window-door-extrusions').exists())

            call_command('seed_lingye_catalog')

            self.assertEqual(Category.objects.count(), 5)
            self.assertEqual(Product.objects.count(), 20)
            self.assertEqual(ProductImage.objects.count(), 20)

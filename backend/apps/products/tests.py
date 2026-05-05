from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.middleware import SessionMiddleware
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, TestCase
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
    SubCategory,
)
from .services import clone_product


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

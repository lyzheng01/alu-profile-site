import tempfile
from pathlib import Path
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.middleware import SessionMiddleware
from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from django.template.loader import render_to_string
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse
from PIL import Image
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
    CURRENT_SLUGS = {
        'glass-door-frame-profiles',
        'wardrobe-aluminium-profiles',
        'gola-handleless-cabinet-profiles',
        'wardrobe-handle-profiles',
        'aluminium-heat-sink-profiles',
        'custom-cnc-aluminium-profiles',
        'aluminium-enclosure-profiles',
        'cnc-machined-aluminium-components',
        '2020-t-slot-aluminium-profile',
        '3030-t-slot-aluminium-profile',
        '4040-t-slot-aluminium-profile',
        '4545-t-slot-aluminium-profile',
        'custom-window-door-extrusions',
        'curtain-wall-aluminium-profiles',
        'south-america-window-door-extrusions',
        'africa-window-door-extrusions',
        'aluminium-u-channel',
        'aluminium-h-profile',
        'aluminium-square-tube',
        'aluminium-flat-bar',
    }

    NEW_SLUGS = {
        '2040-t-slot-aluminium-profile',
        '2060-t-slot-aluminium-profile',
        '3060-t-slot-aluminium-profile',
        '4080-t-slot-aluminium-profile',
        '5050-t-slot-aluminium-profile',
        '6060-t-slot-aluminium-profile',
        '8080-t-slot-aluminium-profile',
        '9090-t-slot-aluminium-profile',
        '90-degree-external-corner-bracket',
        'three-way-connector',
        'angle-bracket',
        'flat-joining-plate',
        't-slot-nut',
        't-bolt',
        'anchor-fastener-set',
        'profile-end-cap',
        'panel-fastener',
        'hinge',
        'leveling-foot',
        'caster-wheel',
        'sliding-window-system',
        'casement-window-system',
        'thermal-break-window-system',
        'sliding-door-system',
        'folding-door-system',
        'commercial-entrance-shopfront-system',
    }

    T_SLOT_SLUGS = {
        '2020-t-slot-aluminium-profile',
        '3030-t-slot-aluminium-profile',
        '4040-t-slot-aluminium-profile',
        '4545-t-slot-aluminium-profile',
        '2040-t-slot-aluminium-profile',
        '2060-t-slot-aluminium-profile',
        '3060-t-slot-aluminium-profile',
        '4080-t-slot-aluminium-profile',
        '5050-t-slot-aluminium-profile',
        '6060-t-slot-aluminium-profile',
        '8080-t-slot-aluminium-profile',
        '9090-t-slot-aluminium-profile',
        '90-degree-external-corner-bracket',
        'three-way-connector',
        'angle-bracket',
        'flat-joining-plate',
        't-slot-nut',
        't-bolt',
        'anchor-fastener-set',
        'profile-end-cap',
        'panel-fastener',
        'hinge',
        'leveling-foot',
        'caster-wheel',
    }

    WINDOWS_DOORS_SLUGS = {
        'custom-window-door-extrusions',
        'curtain-wall-aluminium-profiles',
        'south-america-window-door-extrusions',
        'africa-window-door-extrusions',
        'sliding-window-system',
        'casement-window-system',
        'thermal-break-window-system',
        'sliding-door-system',
        'folding-door-system',
        'commercial-entrance-shopfront-system',
    }

    EXPECTED_PRESERVED_ORDERS = {
        'glass-door-frame-profiles': 1,
        'wardrobe-aluminium-profiles': 2,
        'gola-handleless-cabinet-profiles': 3,
        'wardrobe-handle-profiles': 4,
        'aluminium-heat-sink-profiles': 11,
        'custom-cnc-aluminium-profiles': 12,
        'aluminium-enclosure-profiles': 13,
        'cnc-machined-aluminium-components': 14,
        '2020-t-slot-aluminium-profile': 21,
        '3030-t-slot-aluminium-profile': 22,
        '4040-t-slot-aluminium-profile': 23,
        '4545-t-slot-aluminium-profile': 24,
    }

    def test_seed_lingye_catalog_matches_expanded_inventory_contract_idempotently(self):
        with tempfile.TemporaryDirectory() as media_root, tempfile.TemporaryDirectory() as translations_dir, override_settings(MEDIA_ROOT=media_root):
            preserved_media = Path(media_root) / 'products' / 'catalog' / '2020-aluminium-t-slot.jpg'
            preserved_media.parent.mkdir(parents=True, exist_ok=True)
            preserved_media.write_bytes(b'keep existing customized media')

            call_command('seed_lingye_catalog', translations_dir=translations_dir)
            self.assertEqual(preserved_media.read_bytes(), b'keep existing customized media')
            self.assertTrue(self.T_SLOT_SLUGS.isdisjoint(self.WINDOWS_DOORS_SLUGS))

            self.assertEqual(Category.objects.count(), 5)
            self.assertEqual(Product.objects.count(), 46)
            product_orders = list(Product.objects.values_list('order', flat=True))
            self.assertEqual(len(product_orders), len(set(product_orders)))
            self.assertEqual(ProductImage.objects.count(), 46)
            self.assertEqual(ProductImage.objects.filter(is_primary=True).count(), 46)
            self.assertEqual(
                Product.objects.filter(category__slug='t-slot-profiles').count(),
                24,
            )
            self.assertEqual(
                Product.objects.filter(category__slug='windows-doors').count(),
                10,
            )
            self.assertEqual(
                self.T_SLOT_SLUGS,
                set(Product.objects.filter(category__slug='t-slot-profiles').values_list('slug', flat=True)),
            )
            self.assertEqual(
                self.WINDOWS_DOORS_SLUGS,
                set(Product.objects.filter(category__slug='windows-doors').values_list('slug', flat=True)),
            )
            self.assertEqual(
                set(Category.objects.values_list('slug', flat=True)),
                {'cabinet-profiles', 'industrial-profiles', 't-slot-profiles', 'windows-doors', 'standard-aluminium-profiles'},
            )

            products = list(Product.objects.prefetch_related('images').order_by('slug'))
            slugs = [product.slug for product in products]
            product_order_by_slug = {product.slug: product.order for product in products}
            self.assertEqual(len(slugs), len(set(slugs)))
            self.assertEqual(set(slugs), self.CURRENT_SLUGS | self.NEW_SLUGS)
            self.assertTrue(self.CURRENT_SLUGS.issubset(set(slugs)))
            self.assertTrue(self.NEW_SLUGS.isdisjoint(self.CURRENT_SLUGS))
            self.assertEqual(len(self.NEW_SLUGS), 26)
            features = [product.features.strip() for product in products]
            self.assertTrue(all(features))
            self.assertEqual(len(features), len(set(features)))
            for slug, expected_order in self.EXPECTED_PRESERVED_ORDERS.items():
                self.assertEqual(product_order_by_slug[slug], expected_order, slug)

            t_slot_orders = Product.objects.filter(category__slug='t-slot-profiles').values_list('order', flat=True)
            windows_doors_orders = Product.objects.filter(category__slug='windows-doors').values_list('order', flat=True)
            standard_profile_orders = Product.objects.filter(
                category__slug='standard-aluminium-profiles'
            ).values_list('order', flat=True)
            self.assertLess(max(t_slot_orders), min(windows_doors_orders))
            self.assertLess(min(windows_doors_orders), max(windows_doors_orders))
            self.assertLess(max(windows_doors_orders), min(standard_profile_orders))

            image_associations = {}
            for product in products:
                images = list(product.images.all())
                primary_images = [image for image in images if image.is_primary]
                self.assertEqual(len(primary_images), 1, product.slug)
                self.assertEqual(len(images), 1, product.slug)
                image = primary_images[0]
                image_path = Path(media_root) / image.image.name
                self.assertTrue(image_path.is_file(), product.slug)
                if product.slug in self.NEW_SLUGS:
                    with Image.open(image_path) as asset:
                        asset.load()
                        self.assertGreaterEqual(asset.width, 128, product.slug)
                        self.assertGreaterEqual(asset.height, 128, product.slug)
                image_associations[product.slug] = (
                    image.image.name,
                    image.is_primary,
                    image.order,
                )

            first_run = {
                'category_slugs': set(Category.objects.values_list('slug', flat=True)),
                'product_slugs': set(slugs),
                'product_order_by_slug': product_order_by_slug,
                'image_associations': image_associations,
                'product_count': Product.objects.count(),
                'image_count': ProductImage.objects.count(),
                'primary_image_count': ProductImage.objects.filter(is_primary=True).count(),
            }

            call_command('seed_lingye_catalog', translations_dir=translations_dir)

            self.assertEqual(Category.objects.count(), len(first_run['category_slugs']))
            self.assertEqual(Product.objects.count(), first_run['product_count'])
            self.assertEqual(ProductImage.objects.count(), first_run['image_count'])
            self.assertEqual(
                ProductImage.objects.filter(is_primary=True).count(),
                first_run['primary_image_count'],
            )
            self.assertEqual(
                set(Product.objects.values_list('slug', flat=True)),
                first_run['product_slugs'],
            )
            self.assertEqual(
                dict(Product.objects.values_list('slug', 'order')),
                first_run['product_order_by_slug'],
            )
            self.assertEqual(
                set(Category.objects.values_list('slug', flat=True)),
                first_run['category_slugs'],
            )
            rerun_products = Product.objects.prefetch_related('images').order_by('slug')
            rerun_image_associations = {
                product.slug: (
                    image.image.name,
                    image.is_primary,
                    image.order,
                )
                for product in rerun_products
                for image in product.images.all()
                if image.is_primary
            }
            self.assertEqual(rerun_image_associations, first_run['image_associations'])

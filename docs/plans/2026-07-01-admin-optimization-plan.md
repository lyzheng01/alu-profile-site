# Aluminum Admin Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the current Django Admin product backend into a cleaner, faster, more professional product management workflow for aluminum profile uploads, images, templates, and publishing.

**Architecture:** Keep Django Admin as the first-stage backend instead of building a separate React admin. Improve information architecture, admin styling, product list visibility, product edit flow, batch image upload, and template presets while preserving the existing `Product`, `ProductImage`, and `ProductTemplate` API contracts consumed by the frontend.

**Tech Stack:** Django 4.2.7, Django Admin, Django forms, Django tests, SQLite, existing `apps.products` models/admin/services, existing production media/static serving.

---

## Current Problems

The current backend is functional but feels low-quality because it exposes database structure directly to operators.

- Product creation requires understanding too many fields at once.
- Product images are uploaded one row at a time through a basic inline.
- Product templates are powerful but hard to create because they contain too many inline sections.
- The product list does not behave like a commercial product manager.
- There is no clear "quick product upload" path.
- Admin styling is inconsistent with a professional B2B export site.
- Existing clone flow is useful, but it needs a clearer editing workflow after copying.

## Target Experience

The backend should feel like a practical product operations system:

- Operators can create a product with only name, category, template, parameters, and images.
- Advanced fields are available but visually secondary.
- Product list shows thumbnail, status, category, template, image count, and quick actions.
- Product edit page is grouped by operator workflow, not database order.
- Templates become selectable presets instead of something operators must build from scratch every time.
- Images can be batch uploaded, previewed, sorted, and marked as primary.

## Non-Goals

- Do not replace Django Admin with a custom React admin in this phase.
- Do not change frontend API response contracts unless explicitly planned.
- Do not redesign product detail frontend in this plan.
- Do not restart production services unless explicitly requested.
- Do not commit changes unless explicitly requested.

---

## Phase 1: Admin Visual Foundation

### Task 1: Add Admin CSS Shell

**Files:**
- Modify: `backend/templates/admin/base_site.html`
- Create: `backend/static/admin/css/aluminum_admin.css`
- Verify: `backend/aluminum/settings.py` static settings only if needed

**Step 1: Write a visual smoke test**

Add or extend a Django admin template test to confirm the custom CSS file is referenced.

Suggested test location:

```python
# backend/apps/products/tests.py
from django.test import TestCase
from django.template.loader import render_to_string

class AdminThemeTests(TestCase):
    def test_admin_base_site_references_aluminum_admin_css(self):
        html = render_to_string("admin/base_site.html", {})
        self.assertIn("aluminum_admin.css", html)
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.AdminThemeTests
```

Expected: FAIL because the CSS reference does not exist yet.

**Step 3: Add CSS reference**

Update `backend/templates/admin/base_site.html` to include:

```django
{% block extrastyle %}
{{ block.super }}
<link rel="stylesheet" href="{% static 'admin/css/aluminum_admin.css' %}">
{% endblock %}
```

Ensure `{% load static %}` exists in the template.

**Step 4: Create visual CSS**

Create `backend/static/admin/css/aluminum_admin.css` with:

```css
:root {
  --lingye-bg: #f6f8fb;
  --lingye-panel: #ffffff;
  --lingye-border: #dbe3ef;
  --lingye-text: #0f172a;
  --lingye-muted: #64748b;
  --lingye-primary: #0369a1;
  --lingye-primary-dark: #075985;
  --lingye-success: #15803d;
  --lingye-warning: #b45309;
  --lingye-danger: #b91c1c;
}

body {
  background: var(--lingye-bg);
  color: var(--lingye-text);
}

#header {
  background: #0f172a;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

#branding h1,
#branding h1 a:link,
#branding h1 a:visited {
  color: #fff;
  font-weight: 700;
}

.module,
.inline-group,
div.breadcrumbs,
#content-main > form,
.change-list .filtered #changelist,
#changelist {
  border-radius: 10px;
  border: 1px solid var(--lingye-border);
  box-shadow: 0 10px 30px rgba(15, 23, 42, .06);
}

.button,
input[type=submit],
input[type=button],
.submit-row input,
a.button {
  border-radius: 8px;
  border: 0;
  background: var(--lingye-primary);
  color: #fff;
  font-weight: 700;
}

.button:hover,
input[type=submit]:hover,
input[type=button]:hover,
.submit-row input:hover,
a.button:hover {
  background: var(--lingye-primary-dark);
}

fieldset.module h2,
.inline-group h2 {
  background: #eef5fb;
  color: var(--lingye-text);
  font-weight: 700;
}

.admin-product-thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--lingye-border);
  background: #f8fafc;
}

.admin-status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
```

**Step 5: Run test and admin check**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.AdminThemeTests
cd "/www/wwwroot/Aluminum/backend" && python manage.py check
```

Expected: PASS.

---

## Phase 2: Product List Becomes a Product Manager

### Task 2: Add Product Thumbnail and Better Status Columns

**Files:**
- Modify: `backend/apps/products/admin.py`
- Test: `backend/apps/products/tests.py`

**Step 1: Write list display test**

Add:

```python
class ProductAdminListDisplayTests(TestCase):
    def test_product_admin_list_display_has_product_manager_columns(self):
        model_admin = ProductAdmin(Product, AdminSite())
        list_display = list(model_admin.get_list_display(request=None))

        self.assertIn("primary_image_preview", list_display)
        self.assertIn("publish_status_badge", list_display)
        self.assertIn("image_count", list_display)
        self.assertIn("clone_button", list_display)
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductAdminListDisplayTests
```

Expected: FAIL until list display is updated.

**Step 3: Update `ProductAdmin.list_display`**

Target order:

```python
list_display = [
    "primary_image_preview",
    "name",
    "clone_button",
    "category",
    "subcategory",
    "template_display",
    "publish_status_badge",
    "is_featured",
    "order",
    "image_count",
    "updated_at",
]
```

**Step 4: Add preview and status methods**

```python
def primary_image_preview(self, obj):
    image = obj.images.filter(is_primary=True).first() or obj.images.first()
    if not image:
        return format_html('<span class="admin-status-pill" style="background:#fee2e2;color:#991b1b;">缺图</span>')
    return format_html(
        '<img class="admin-product-thumb" src="{}" alt="{}" />',
        image.image.url,
        obj.name,
    )

primary_image_preview.short_description = "主图"

def publish_status_badge(self, obj):
    if obj.is_active:
        return format_html('<span class="admin-status-pill" style="background:#dcfce7;color:#166534;">已发布</span>')
    return format_html('<span class="admin-status-pill" style="background:#f1f5f9;color:#475569;">草稿</span>')

publish_status_badge.short_description = "发布状态"
```

**Step 5: Run tests**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductAdminListDisplayTests
cd "/www/wwwroot/Aluminum/backend" && python manage.py check
```

Expected: PASS.

---

## Phase 3: Product Edit Page Workflow

### Task 3: Reorganize Product Fieldsets

**Files:**
- Modify: `backend/apps/products/admin.py`
- Test: `backend/apps/products/tests.py`

**Step 1: Write fieldset test**

Add:

```python
class ProductAdminFieldsetWorkflowTests(TestCase):
    def test_product_admin_fieldsets_follow_upload_workflow(self):
        model_admin = ProductAdmin(Product, AdminSite())
        fieldsets = model_admin.get_fieldsets(request=None, obj=None)
        titles = [fieldset[0] for fieldset in fieldsets]

        self.assertEqual(titles[0], "快速操作")
        self.assertIn("基础信息", titles)
        self.assertIn("外贸参数", titles)
        self.assertIn("内容描述", titles)
        self.assertIn("发布设置", titles)
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductAdminFieldsetWorkflowTests
```

Expected: FAIL if current titles/order differ.

**Step 3: Update fieldsets**

Use:

```python
fieldsets = (
    ("快速操作", {
        "fields": ("clone_actions",),
        "description": "复制同类产品后，只需要修改名称、规格、主图和发布状态。",
    }),
    ("基础信息", {
        "fields": ("category", "subcategory", "template", "use_template", "name", "slug"),
    }),
    ("外贸参数", {
        "fields": ("range_param", "type_param", "surface_treatment", "colors", "grade", "temper"),
        "description": "这些字段会显示在产品详情页的 Product Parameters 区域。",
    }),
    ("内容描述", {
        "fields": ("description", "features", "applications", "specifications"),
        "classes": ("collapse",),
        "description": "常规产品优先使用模板内容；只有差异内容才需要在这里单独填写。",
    }),
    ("发布设置", {
        "fields": ("is_featured", "is_active", "order"),
    }),
)
```

**Step 4: Run tests**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductAdminFieldsetWorkflowTests
cd "/www/wwwroot/Aluminum/backend" && python manage.py check
```

Expected: PASS.

---

## Phase 4: Batch Product Image Upload

### Task 4: Add Multi-Image Upload Form Field

**Files:**
- Modify: `backend/apps/products/admin.py`
- Modify: `backend/apps/products/services.py`
- Test: `backend/apps/products/tests.py`

**Step 1: Write service test**

Add:

```python
from django.core.files.uploadedfile import SimpleUploadedFile
from .services import add_product_images

class ProductImageBatchUploadTests(TestCase):
    def test_add_product_images_marks_first_image_primary_when_product_has_no_images(self):
        product = Product.objects.create(
            category=self.category,
            name="Test Profile",
            description="Test",
        )
        files = [
            SimpleUploadedFile("a.jpg", b"file-a", content_type="image/jpeg"),
            SimpleUploadedFile("b.jpg", b"file-b", content_type="image/jpeg"),
        ]

        created = add_product_images(product, files)

        self.assertEqual(len(created), 2)
        self.assertTrue(created[0].is_primary)
        self.assertFalse(created[1].is_primary)
        self.assertEqual(product.images.count(), 2)
```

Use existing test setup patterns for `self.category`.

**Step 2: Run test to verify it fails**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductImageBatchUploadTests
```

Expected: FAIL because `add_product_images` does not exist.

**Step 3: Implement service**

In `backend/apps/products/services.py`:

```python
from .models import ProductImage

def add_product_images(product, files):
    existing_count = product.images.count()
    created = []

    for index, uploaded_file in enumerate(files):
        image = ProductImage.objects.create(
            product=product,
            image=uploaded_file,
            caption=getattr(uploaded_file, "name", ""),
            is_primary=(existing_count == 0 and index == 0),
            order=existing_count + index,
        )
        created.append(image)

    return created
```

**Step 4: Add form field**

In `ProductForm`:

```python
batch_images = forms.FileField(
    required=False,
    widget=forms.ClearableFileInput(attrs={"multiple": True}),
    help_text="可一次选择多张产品图片；第一张会自动设为主图。",
    label="批量上传产品图片",
)
```

Do not include `batch_images` in `Meta.fields`; add it manually to the admin fieldset.

**Step 5: Save uploaded files in `ProductAdmin.save_model` or `save_related`**

Use `save_related` to ensure product exists:

```python
def save_related(self, request, form, formsets, change):
    super().save_related(request, form, formsets, change)
    files = request.FILES.getlist("batch_images")
    if files:
        created = add_product_images(form.instance, files)
        self.message_user(request, f"已上传 {len(created)} 张产品图片。", level=messages.SUCCESS)
```

**Step 6: Run tests**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductImageBatchUploadTests
cd "/www/wwwroot/Aluminum/backend" && python manage.py check
```

Expected: PASS.

---

## Phase 5: Fast Product Creation Mode

### Task 5: Add "Quick Product" Fieldset and Defaults

**Files:**
- Modify: `backend/apps/products/admin.py`
- Test: `backend/apps/products/tests.py`

**Step 1: Define required quick fields**

The fast flow should require only:

- `category`
- `subcategory`
- `template`
- `name`
- `range_param`
- `type_param`
- `surface_treatment`
- `colors`
- `grade`
- `temper`
- `batch_images`
- `is_active`
- `is_featured`

**Step 2: Update fieldsets to show quick fields first**

Add `batch_images` into the first or second visible fieldset:

```python
("快速上传", {
    "fields": ("category", "subcategory", "template", "use_template", "name", "batch_images"),
    "description": "日常上传产品只需要填写这里，再补充外贸参数即可。高级描述可使用模板自动补齐。",
}),
```

**Step 3: Keep advanced fields collapsed**

Set `classes: ("collapse",)` for content description fields.

**Step 4: Test admin field includes `batch_images`**

```python
def test_product_admin_fieldsets_include_batch_images_in_quick_upload(self):
    model_admin = ProductAdmin(Product, AdminSite())
    fields = [
        field
        for _, options in model_admin.get_fieldsets(request=None, obj=None)
        for field in options["fields"]
    ]

    self.assertIn("batch_images", fields)
```

**Step 5: Run tests**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductAdminFieldsetWorkflowTests
cd "/www/wwwroot/Aluminum/backend" && python manage.py check
```

Expected: PASS.

---

## Phase 6: Template Presets

### Task 6: Add Management Command to Seed Common Templates

**Files:**
- Create: `backend/apps/products/management/commands/seed_product_templates.py`
- Test: `backend/apps/products/tests.py`

**Step 1: Write command test**

```python
from django.core.management import call_command

class ProductTemplateSeedCommandTests(TestCase):
    def test_seed_product_templates_creates_common_templates(self):
        call_command("seed_product_templates")

        names = set(ProductTemplate.objects.values_list("name", flat=True))
        self.assertIn("Window and Door Aluminium Profile", names)
        self.assertIn("Industrial T-Slot Aluminium Profile", names)
        self.assertIn("Tile Trim and Decorative Aluminium Profile", names)
        self.assertIn("Tube and Common Aluminium Profile", names)
        self.assertIn("Custom OEM Aluminium Extrusion", names)
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductTemplateSeedCommandTests
```

Expected: FAIL because command does not exist.

**Step 3: Implement command**

Create templates with sensible defaults:

```python
COMMON_TEMPLATES = [
    {
        "name": "Window and Door Aluminium Profile",
        "type_param": "For window and door systems",
        "surface_treatment": "Anodized, Powder Coated, Electrophoresis, Wood Grain",
        "grade": "6063 Series",
        "temper": "T5, T6",
        "lead_time": "7-15 Days",
    },
    {
        "name": "Industrial T-Slot Aluminium Profile",
        "type_param": "For industrial framing, automation, and workstations",
        "surface_treatment": "Mill Finished, Silver Anodized, Black Anodized",
        "grade": "6061 / 6063 Series",
        "temper": "T5, T6",
        "lead_time": "7-15 Days",
    },
]
```

Use `get_or_create` to keep the command idempotent.

**Step 4: Run tests**

Run:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products.tests.ProductTemplateSeedCommandTests
cd "/www/wwwroot/Aluminum/backend" && python manage.py check
```

Expected: PASS.

---

## Phase 7: Admin Dashboard Navigation

### Task 7: Group Admin Modules for Operators

**Files:**
- Modify: `backend/templates/admin/base_site.html`
- Possibly create: `backend/templates/admin/index.html`
- Test: template smoke test only

**Operator groups:**

- Product Operations
  - Products
  - Product Images
  - Product Templates
  - Categories
  - Subcategories
- Website Content
  - News
  - Company Info
  - Factory Images
  - Certificates
- Sales
  - Inquiries
  - Contact Info
- Tools
  - Translation
  - Logs

**Implementation note:**
If overriding `admin/index.html` becomes too invasive, defer this task. Styling and product workflow improvements provide more immediate value.

---

## Verification Checklist

Run after each implemented phase:

```bash
cd "/www/wwwroot/Aluminum/backend" && python manage.py check
cd "/www/wwwroot/Aluminum/backend" && python manage.py test apps.products
```

Manual admin checks:

- Open product list page.
- Confirm product thumbnail appears.
- Confirm status badges are readable.
- Confirm clone button is visible.
- Create a new product using only quick upload fields.
- Upload multiple images at once.
- Confirm first uploaded image becomes primary.
- Confirm frontend product detail page still loads the product images.
- Confirm `/api/products/?lang=en` response still includes `images`.

Frontend smoke check after backend changes:

```bash
cd "/www/wwwroot/Aluminum/frontend" && npm run build
```

API smoke:

```bash
curl -sS -I "http://127.0.0.1:9001/api/"
```

---

## Recommended Implementation Order

1. Admin CSS shell.
2. Product list thumbnail/status/action improvements.
3. Product edit fieldset workflow.
4. Batch image upload.
5. Quick product upload fieldset.
6. Template seed command.
7. Optional admin dashboard navigation grouping.

This order improves perceived quality first, then upload speed, then template maintainability.

## Risks

- Django Admin multiple file upload can be awkward with default widgets; if `ClearableFileInput` is not enough, use a small custom widget.
- Product image upload tests need valid image-like files if Pillow validation is strict.
- Overriding `admin/index.html` can become brittle; keep it optional.
- Do not change serializer fields casually because frontend product detail relies on existing names.

## Future Option: Dedicated React Admin

If product volume grows significantly, build a separate admin app later:

- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/media`
- `/admin/templates`
- `/admin/inquiries`

This should be a second-stage project, not the first implementation step.

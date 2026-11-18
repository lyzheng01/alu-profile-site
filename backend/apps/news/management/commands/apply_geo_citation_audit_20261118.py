from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.news.models import Article

AEC_DESIGN = "https://aec.org/extrusion-design-tips"
AEC_PROCESS = "https://aec.org/aluminum-extrusion-process"
AA_STANDARDS = "https://www.aluminum.org/aluminum-standards-data-2024"
AEC_FINISHING = "https://aec.org/finishing"
TI_THERMAL = "https://www.ti.com/lit/pdf/slta007"

APPEND = {
    "aluminium-extrusion-cross-section-die-design-guide": {
        "en": f'<p><strong>Technical reference:</strong> The general guidance on balanced walls and smooth transitions is also covered by the <a href="{AEC_DESIGN}">Aluminum Extruders Council\'s extrusion design tips</a>. These are starting points, not universal dimensions; confirm die feasibility with the producer for the alloy and section.</p>',
        "zh": f'<p><strong>技术参考：</strong>关于壁厚平衡和过渡平顺的通用建议，可参阅美国铝挤压协会（AEC）的<a href="{AEC_DESIGN}">挤压设计指南</a>。这些内容是设计参考，不是通用尺寸规范；具体模具可制造性仍需生产方结合合金和截面评估。</p>',
        "es": f'<p><strong>Referencia técnica:</strong> Las recomendaciones generales sobre paredes equilibradas y transiciones suaves también aparecen en las <a href="{AEC_DESIGN}">pautas de diseño de extrusión del Aluminum Extruders Council</a>. Son criterios orientativos, no dimensiones universales; el productor debe confirmar la viabilidad de la matriz para la aleación y la sección concretas.</p>',
        "pt": f'<p><strong>Referência técnica:</strong> As orientações gerais sobre paredes equilibradas e transições suaves também constam nas <a href="{AEC_DESIGN}">recomendações de projeto de extrusão do Aluminum Extruders Council</a>. São pontos de partida, não dimensões universais; o produtor deve confirmar a viabilidade da matriz para a liga e a seção específicas.</p>',
    },
    "aluminium-extrusion-process-from-billet-to-profile": {
        "en": f'<p><strong>Process reference:</strong> This overview follows the stages described by the <a href="{AEC_PROCESS}">Aluminum Extruders Council</a>. Equipment and sequence vary by producer, alloy and project; confirm the actual route and records with the selected production partner.</p>',
        "zh": f'<p><strong>流程参考：</strong>本文概述与<a href="{AEC_PROCESS}">美国铝挤压协会（AEC）</a>介绍的常见工序相对应。设备和顺序会因生产方、合金及项目而异；实际生产路线和记录应向选定的生产合作方确认。</p>',
        "es": f'<p><strong>Referencia del proceso:</strong> Este resumen sigue las etapas descritas por el <a href="{AEC_PROCESS}">Aluminum Extruders Council</a>. Los equipos y la secuencia varían según el productor, la aleación y el proyecto; confirme la ruta y los registros reales con el socio de producción elegido.</p>',
        "pt": f'<p><strong>Referência do processo:</strong> Este resumo acompanha as etapas descritas pelo <a href="{AEC_PROCESS}">Aluminum Extruders Council</a>. Os equipamentos e a sequência variam conforme o produtor, a liga e o projeto; confirme o processo e os registros reais com o parceiro de produção escolhido.</p>',
    },
    "6061-vs-6063-aluminium-alloy-selection": {
        "en": f'<p><strong>Material reference:</strong> For published alloy and temper properties, consult the relevant product-form data in <a href="{AA_STANDARDS}">The Aluminum Association\'s Aluminum Standards &amp; Data</a>. Match the alloy, temper, dimensions and governing specification; this guide is a selection aid, not a material certificate.</p>',
        "zh": f'<p><strong>材料参考：</strong>合金和状态的公开性能数据可查阅<a href="{AA_STANDARDS}">美国铝业协会《Aluminum Standards &amp; Data》</a>中对应产品形态的数据。核对时应匹配合金、状态、尺寸和适用规范；本指南用于选材讨论，不能替代材料证明。</p>',
        "es": f'<p><strong>Referencia del material:</strong> Para consultar propiedades publicadas de aleaciones y temples, revise los datos de la forma de producto correspondiente en <a href="{AA_STANDARDS}">Aluminum Standards &amp; Data de The Aluminum Association</a>. Compruebe aleación, temple, dimensiones y especificación aplicable; esta guía orienta la selección, pero no sustituye un certificado de material.</p>',
        "pt": f'<p><strong>Referência do material:</strong> Para consultar propriedades publicadas de ligas e têmperas, verifique os dados da forma de produto correspondente em <a href="{AA_STANDARDS}">Aluminum Standards &amp; Data da The Aluminum Association</a>. Confira liga, têmpera, dimensões e especificação aplicável; este guia apoia a seleção, mas não substitui um certificado do material.</p>',
    },
    "selecting-an-aluminium-profile-finish": {
        "en": f'<p><strong>Finishing reference:</strong> For general information on finishing aluminium extrusions, see the <a href="{AEC_FINISHING}">Aluminum Extruders Council finishing overview</a>. Specific coating performance, colour tolerance and certification still depend on the named specification, test evidence and the supplier\'s confirmed capability.</p>',
        "zh": f'<p><strong>表面处理参考：</strong>铝挤压材表面处理的一般说明可参阅<a href="{AEC_FINISHING}">美国铝挤压协会（AEC）的表面处理介绍</a>。具体涂层性能、颜色公差和认证仍取决于明确的规范、检测依据及供应商确认的能力。</p>',
        "es": f'<p><strong>Referencia de acabado:</strong> Para información general sobre acabados de extrusiones de aluminio, consulte la <a href="{AEC_FINISHING}">guía de acabados del Aluminum Extruders Council</a>. El rendimiento específico, la tolerancia de color y la certificación dependen de la especificación indicada, las pruebas y la capacidad confirmada del proveedor.</p>',
        "pt": f'<p><strong>Referência de acabamento:</strong> Para informações gerais sobre acabamentos de extrusões de alumínio, consulte a <a href="{AEC_FINISHING}">apresentação de acabamentos do Aluminum Extruders Council</a>. O desempenho específico, a tolerância de cor e a certificação dependem da especificação indicada, dos ensaios e da capacidade confirmada do fornecedor.</p>',
    },
    "aluminium-heat-sink-profile-design-guide": {
        "en": f'<p><strong>Reference scope:</strong> The cited <a href="{TI_THERMAL}">Texas Instruments Application Note AN7</a> supports the thermal-resistance calculation method; it concerns power modules and does not rate an aluminium extrusion heat sink. Validate the actual assembly under its specified operating and test conditions.</p>',
        "zh": f'<p><strong>参考范围：</strong>所引<a href="{TI_THERMAL}">德州仪器应用说明 AN7</a>用于参考热阻计算方法；该资料讨论的是电源模块，并不对铝挤压散热器作性能评级。实际组件仍须按明确的运行和测试条件验证。</p>',
        "es": f'<p><strong>Alcance de la referencia:</strong> La <a href="{TI_THERMAL}">nota de aplicación AN7 de Texas Instruments</a> respalda el método de cálculo de resistencia térmica; trata de módulos de alimentación y no califica un disipador extruido de aluminio. Valide el conjunto real bajo las condiciones de funcionamiento y ensayo especificadas.</p>',
        "pt": f'<p><strong>Escopo da referência:</strong> A <a href="{TI_THERMAL}">nota de aplicação AN7 da Texas Instruments</a> apoia o método de cálculo da resistência térmica; ela trata de módulos de alimentação e não classifica um dissipador extrudado de alumínio. Valide o conjunto real nas condições de operação e ensaio especificadas.</p>',
    },
}

HEAT_SINK_REPLACEMENTS = {
    "en": (
        f'See the thermal-resistance method in <a href="{TI_THERMAL}">Texas Instruments Application Note AN7</a>.',
        f'For the thermal-resistance calculation method, see <a href="{TI_THERMAL}">Texas Instruments Application Note AN7</a>. This note discusses power modules; it does not rate this aluminium extrusion heat sink.',
    ),
    "zh": (
        f'热阻计算思路可参阅 <a href={TI_THERMAL}>德州仪器应用说明 AN7</a>。',
        f'热阻计算方法可参阅 <a href="{TI_THERMAL}">德州仪器应用说明 AN7</a>。该资料讨论的是电源模块，并不对本文所述铝挤压散热器作性能评级。',
    ),
    "es": (
        f'Consulte el método de resistencia térmica de la <a href={TI_THERMAL}>nota de aplicación AN7 de Texas Instruments</a>.',
        f'Para el método de cálculo de resistencia térmica, consulte la <a href="{TI_THERMAL}">nota de aplicación AN7 de Texas Instruments</a>. Este documento trata de módulos de alimentación y no califica este disipador extruido de aluminio.',
    ),
    "pt": (
        f'Consulte o método de resistência térmica na <a href={TI_THERMAL}>nota de aplicação AN7 da Texas Instruments</a>.',
        f'Para o método de cálculo da resistência térmica, consulte a <a href="{TI_THERMAL}">nota de aplicação AN7 da Texas Instruments</a>. Esse documento trata de módulos de alimentação e não classifica este dissipador extrudado de alumínio.',
    ),
}

SLOT_REPLACEMENTS = {
    "en": (
        "The numbers in 2020, 3030, 4040 and 4545 commonly describe nominal outside dimensions in millimetres. A 2020 member is compact and useful where space and low mass matter. 3030 provides a wider section for general frames. 4040 and 4545 offer larger envelopes for applications that need a stiffer structure or more mounting faces.",
        "In many profile families, 2020, 3030, 4040 and 4545 refer to nominal outside dimensions in millimetres; the label alone does not define the slot or section properties. Compare the actual drawing and section data before selecting. A larger outside size is not, by itself, a load rating or proof of greater stiffness in the assembled frame.",
    ),
    "zh": (
        "2020、3030、4040 和 4545 通常表示型材标称外形尺寸，单位为毫米。2020 结构紧凑，适合空间和重量受限的场景；3030 可用于常见框架；4040 和 4545 截面更大，适合需要更高刚度或更多安装面的应用。",
        "在许多型材系列中，2020、3030、4040 和 4545 指以毫米表示的标称外形尺寸；名称本身不能说明槽口或截面属性。选型前应核对具体图纸和截面数据。外形尺寸更大本身不代表额定承载能力更高，也不能证明装配后的框架刚度更大。",
    ),
    "es": (
        "Las cifras 2020, 3030, 4040 y 4545 suelen indicar dimensiones exteriores nominales en milímetros. El 2020 es compacto para espacios y pesos reducidos; el 3030 sirve para bastidores de uso general; el 4040 y el 4545 ofrecen más sección cuando se necesita rigidez o más caras de montaje.",
        "En muchas familias de perfiles, 2020, 3030, 4040 y 4545 se refieren a dimensiones exteriores nominales en milímetros; la designación por sí sola no define la ranura ni las propiedades de la sección. Compare el plano y los datos de sección reales antes de elegir. Un tamaño exterior mayor no es, por sí mismo, una clasificación de carga ni demuestra mayor rigidez del bastidor montado.",
    ),
    "pt": (
        "Os números 2020, 3030, 4040 e 4545 normalmente indicam dimensões externas nominais em milímetros. O 2020 é compacto para espaços e pesos reduzidos; o 3030 atende quadros de uso geral; o 4040 e o 4545 oferecem seções maiores quando é necessária mais rigidez ou mais faces de montagem.",
        "Em muitas famílias de perfis, 2020, 3030, 4040 e 4545 indicam dimensões externas nominais em milímetros; a designação, sozinha, não define a ranhura nem as propriedades da seção. Compare o desenho e os dados de seção reais antes de escolher. Um tamanho externo maior não é, por si só, uma classificação de carga nem comprova maior rigidez do quadro montado.",
    ),
}

class Command(BaseCommand):
    help = "Add verified source context to GEO priority articles and qualify T-slot size claims."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true", help="Write the prepared changes; otherwise only report the plan.")

    def handle(self, *args, **options):
        apply = options["apply"]
        root = Path(__file__).resolve().parents[5]
        translation_paths = {lang: root / "backend" / "translations" / f"article_{lang}.json" for lang in ("zh", "es", "pt")}
        translations = {lang: json.loads(path.read_text(encoding="utf-8")) for lang, path in translation_paths.items()}
        expected_ids = {
            "aluminium-extrusion-cross-section-die-design-guide": 7,
            "aluminium-extrusion-process-from-billet-to-profile": 8,
            "6061-vs-6063-aluminium-alloy-selection": 6,
            "selecting-an-aluminium-profile-finish": 4,
            "aluminium-heat-sink-profile-design-guide": 10,
            "choose-2020-3030-4040-4545-t-slot-profiles": 0,
        }
        articles = {slug: Article.objects.get(slug=slug) for slug in expected_ids}
        for slug, article in articles.items():
            if expected_ids[slug] and article.id != expected_ids[slug]:
                raise CommandError(f"Unexpected article id for {slug}: {article.id}")

        planned = []
        english_new = {}
        translated_new = {lang: dict(data) for lang, data in translations.items()}
        for slug, localized in APPEND.items():
            article = articles[slug]
            for lang in ("en", "zh", "es", "pt"):
                current = article.content if lang == "en" else translations[lang].get(f"content_{article.id}")
                if not current:
                    raise CommandError(f"Missing {lang} content for {slug}")
                url = next((u for u in (AEC_DESIGN, AEC_PROCESS, AA_STANDARDS, AEC_FINISHING, TI_THERMAL) if u in localized[lang]), None)
                addition = localized[lang]
                if url and url in current:
                    planned.append((lang, slug, "already-cited"))
                    continue
                updated = current.rstrip() + addition
                if lang == "en":
                    english_new[slug] = updated
                else:
                    translated_new[lang][f"content_{article.id}"] = updated
                planned.append((lang, slug, "append"))

        heat_article = articles["aluminium-heat-sink-profile-design-guide"]
        for lang, (old, new) in HEAT_SINK_REPLACEMENTS.items():
            current = heat_article.content if lang == "en" else translations[lang].get(f"content_{heat_article.id}")
            if not current:
                raise CommandError(f"Missing {lang} heat-sink content")
            if old in current:
                if current.count(old) != 1:
                    raise CommandError(f"Expected one thermal-reference sentence in {lang}, got {current.count(old)}")
                updated = current.replace(old, new, 1)
                if lang == "en":
                    english_new[heat_article.slug] = updated
                else:
                    translated_new[lang][f"content_{heat_article.id}"] = updated
                planned.append((lang, heat_article.slug, "qualify-thermal-source"))
            elif new in current:
                planned.append((lang, heat_article.slug, "already-qualified"))
            else:
                raise CommandError(f"Thermal-reference sentence changed unexpectedly in {lang}; refusing to overwrite")

        slot_article = articles["choose-2020-3030-4040-4545-t-slot-profiles"]
        for lang, (old, new) in SLOT_REPLACEMENTS.items():
            current = slot_article.content if lang == "en" else translations[lang].get(f"content_{slot_article.id}")
            if not current:
                raise CommandError(f"Missing {lang} T-slot comparison content")
            if old in current:
                if current.count(old) != 1:
                    raise CommandError(f"Expected one old T-slot paragraph in {lang}, got {current.count(old)}")
                updated = current.replace(old, new, 1)
                if lang == "en":
                    english_new[slot_article.slug] = updated
                else:
                    translated_new[lang][f"content_{slot_article.id}"] = updated
                planned.append((lang, slot_article.slug, "qualify-size-claim"))
            elif new in current:
                planned.append((lang, slot_article.slug, "already-qualified"))
            else:
                raise CommandError(f"T-slot paragraph changed unexpectedly in {lang}; refusing to overwrite")

        if not apply:
            for lang, slug, action in planned:
                self.stdout.write(f"DRY-RUN {lang} {slug}: {action}")
            return

        backup = root / "backups" / "seo-20261118-article-citations-before"
        if backup.exists():
            raise CommandError(f"Backup already exists; refusing to overwrite: {backup}")
        backup.mkdir(parents=True, exist_ok=False)
        try:
            records = {}
            for slug, article in articles.items():
                records[slug] = {"id": article.id, "slug": article.slug, "title": article.title, "content": article.content, "updated_at": article.updated_at.isoformat()}
            (backup / "articles-en.json").write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
            for lang, path in translation_paths.items():
                shutil.copy2(path, backup / path.name)

            for lang, data in translated_new.items():
                path = translation_paths[lang]
                temp = path.with_suffix(path.suffix + ".tmp")
                temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                os.replace(temp, path)
            with transaction.atomic():
                for slug, content in english_new.items():
                    article = articles[slug]
                    article.content = content
                    article.save(update_fields=["content", "updated_at"])
        except Exception:
            for lang, path in translation_paths.items():
                saved = backup / path.name
                if saved.exists():
                    shutil.copy2(saved, path)
            raise

        self.stdout.write(self.style.SUCCESS(f"Applied {len(planned)} localized content updates. Backup: {backup}"))
        for lang, slug, action in planned:
            self.stdout.write(f"{lang} {slug}: {action}")

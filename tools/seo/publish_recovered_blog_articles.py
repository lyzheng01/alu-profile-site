"""Publish two GSC-missing blog topics after checking live article conflicts.

Run through run_aluminum_manage_with_service_env.py so Django receives the
active service environment. This intentionally creates new records only.
"""

import json
import shutil
import sqlite3
from pathlib import Path

from django.conf import settings
from django.core.management.base import CommandError
from django.db import connection, transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag
from apps.products.services import translation_service


ARTICLES = [
    {
        "slug": "industrial-aluminum-extrusions-supplier-guide-for-quality-control",
        "keyword": "aluminum extrusion supplier quality control",
        "translations": {
            "en": {
                "title": "Aluminum Extrusion Supplier Quality Control: A Buyer’s Checklist",
                "excerpt": "A practical checklist for agreeing inspection records, sample approval, dimensional checks and shipment release with an aluminum extrusion supplier.",
                "meta_title": "Aluminum Extrusion Supplier Quality Control Checklist",
                "meta_description": "Evaluate an aluminum extrusion supplier’s quality process: agree drawings, inspection records, samples, acceptance criteria and shipment release before production.",
                "keywords": "aluminum extrusion supplier quality control, extrusion inspection checklist, aluminum profile inspection, supplier quality records",
                "tags": ["Aluminium Extrusion", "Quality Control", "Engineering Buyer Guide"],
                "content": """
<p>A quality-control discussion is useful only when the buyer and supplier agree what will be checked, how acceptance will be decided, and which records will be available. This checklist focuses on supplier evidence and project checkpoints. For dimensional tolerance definitions, see our <a href=\"/en/news/aluminum-extrusion-drawing-tolerances\">aluminum extrusion drawing guide</a>; for machined features, see the <a href=\"/en/news/cnc-machined-aluminium-profile-tolerances-inspection\">CNC profile inspection guide</a>.</p>
<h2>1. Release one controlled drawing revision</h2>
<p>Identify the drawing number, revision, units, alloy and temper requirements, finish, cut length and any secondary operations. Mark the dimensions and surfaces that affect fit, safety or visible appearance. If a requirement is not yet fixed, record it as an open question rather than allowing either side to assume an acceptance limit.</p>
<h2>2. Agree the inspection plan before the order</h2>
<p>Ask the supplier to identify the characteristics to inspect, the measurement method, the sampling stage and the acceptance rule. Separate cross-section dimensions from length-related straightness or twist, and separate as-extruded requirements from machined or finished-part requirements. Applicable tolerances depend on the agreed specification and product details; do not copy a single generic value to every feature.</p>
<h2>3. Review sample and first-article approval</h2>
<p>For a new die or changed drawing, decide whether a sample, first-article report or fit check is needed before regular production. State who approves it, which revision it represents, and whether approval covers appearance, dimensions, assembly fit, or all three. A sample approval should not silently replace a drawing requirement.</p>
<h2>4. Request traceable records that match the order</h2>
<p>Depending on the project and contract, records may include material or alloy documentation, inspection results, finish or coating information, and the order or batch reference. Ask how the supplier connects these records to the delivered lot, how long they are retained, and how a changed or nonconforming item is identified. Request only records relevant to the specified product and market requirements.</p>
<h2>5. Define visual and finish acceptance with a reference</h2>
<p>Words such as “good surface” or “uniform color” are difficult to inspect consistently. Identify the visible face, viewing condition, approved sample or color reference, and unacceptable defects. For anodized finishes, alloy and surface preparation can affect appearance; agree sample approval and inspection criteria before committing to a large batch. See our <a href=\"/en/news/aluminum-extrusion-surface-finishes\">extrusion finish selection guide</a>.</p>
<h2>6. Set a clear release and nonconformance process</h2>
<p>Confirm who releases the lot, what happens when a check fails, and how rework, replacement or concession requests are documented and approved. Before shipment, align quantity, packaging identification and any inspection documents required with the purchase order.</p>
<h2>Copy-ready supplier questions</h2>
<ul><li>Which drawing revision and acceptance criteria will your inspection use?</li><li>Which critical dimensions, finish attributes and process steps will be checked?</li><li>Can you provide a sample or first-article evidence before full production?</li><li>Which records will identify the material and delivered lot?</li><li>How are nonconforming items reported, contained and approved for disposition?</li></ul>
<p>For a complete inquiry package, use the <a href=\"/en/news/aluminium-extrusion-rfq-checklist\">aluminum extrusion RFQ checklist</a>. The goal is a shared, reviewable quality plan—not an unsupported promise that every supplier or order follows the same process.</p>
""",
            },
            "pt": {
                "title": "Controle de qualidade de fornecedores de extrusão de alumínio: checklist de compra",
                "excerpt": "Checklist prático para combinar registros de inspeção, aprovação de amostras, verificações dimensionais e liberação do lote com o fornecedor.",
                "meta_title": "Checklist de qualidade para extrusão de alumínio",
                "meta_description": "Avalie o processo de qualidade de um fornecedor de extrusão de alumínio: alinhe desenho, registros, amostras, critérios de aceitação e liberação do lote.",
                "keywords": "controle de qualidade extrusão alumínio, inspeção perfil de alumínio, checklist inspeção extrusão, registros de qualidade fornecedor",
                "tags": ["Perfis de alumínio", "Controle de qualidade", "Guia técnico de compra"],
                "content": """
<p>Uma conversa sobre controle de qualidade só é útil quando comprador e fornecedor combinam o que será verificado, como a aceitação será decidida e quais registros estarão disponíveis. Este checklist concentra-se nas evidências do fornecedor e nos pontos de controle do projeto. Para tolerâncias dimensionais, consulte nosso <a href=\"/pt/news/aluminum-extrusion-drawing-tolerances\">guia de desenho de extrusão</a>; para características usinadas, veja o <a href=\"/pt/news/cnc-machined-aluminium-profile-tolerances-inspection\">guia de inspeção de perfis usinados</a>.</p>
<h2>1. Libere uma revisão controlada do desenho</h2>
<p>Identifique o número e a revisão do desenho, as unidades, a liga e a têmpera requeridas, o acabamento, o comprimento de corte e as operações secundárias. Marque as dimensões e superfícies que afetam o encaixe, a segurança ou a aparência visível. Se algum requisito ainda não estiver definido, registre-o como questão em aberto em vez de deixar que cada parte suponha um limite de aceitação.</p>
<h2>2. Combine o plano de inspeção antes do pedido</h2>
<p>Peça ao fornecedor que indique as características a inspecionar, o método de medição, a etapa de amostragem e a regra de aceitação. Separe as dimensões da seção transversal da retilineidade ou torção ao longo do comprimento, e diferencie requisitos do perfil extrudado dos requisitos da peça usinada ou acabada. As tolerâncias aplicáveis dependem da especificação acordada e dos detalhes do produto; não aplique um único valor genérico a todas as características.</p>
<h2>3. Analise a amostra e a aprovação da primeira peça</h2>
<p>Para uma matriz nova ou um desenho revisado, decida se será necessária uma amostra, um relatório da primeira peça ou uma verificação de encaixe antes da produção regular. Defina quem aprova, qual revisão está sendo avaliada e se a aprovação cobre aparência, dimensões, montagem ou os três itens. A aprovação de uma amostra não deve substituir silenciosamente um requisito do desenho.</p>
<h2>4. Solicite registros rastreáveis ligados ao pedido</h2>
<p>Conforme o projeto e o contrato, os registros podem incluir documentação do material ou da liga, resultados de inspeção, informações de acabamento ou revestimento e a referência do pedido ou lote. Pergunte como esses documentos são relacionados ao lote entregue, por quanto tempo são guardados e como uma peça alterada ou não conforme é identificada. Solicite apenas registros relevantes ao produto especificado e aos requisitos do mercado.</p>
<h2>5. Defina a aceitação visual e do acabamento com uma referência</h2>
<p>Expressões como “boa superfície” ou “cor uniforme” são difíceis de inspecionar de forma consistente. Identifique a face visível, as condições de observação, a amostra ou referência de cor aprovada e os defeitos inaceitáveis. Em acabamentos anodizados, a liga e a preparação superficial podem afetar a aparência; combine a aprovação de amostras e os critérios de inspeção antes de confirmar um lote grande. Consulte nosso <a href=\"/pt/news/aluminum-extrusion-surface-finishes\">guia de acabamentos para extrusão</a>.</p>
<h2>6. Defina a liberação do lote e o tratamento de não conformidades</h2>
<p>Confirme quem libera o lote, o que ocorre quando uma verificação falha e como retrabalho, substituição ou pedido de concessão serão registrados e aprovados. Antes do envio, alinhe a quantidade, a identificação da embalagem e os documentos de inspeção exigidos no pedido de compra.</p>
<h2>Perguntas prontas para enviar ao fornecedor</h2>
<ul><li>Qual revisão do desenho e quais critérios de aceitação serão usados na inspeção?</li><li>Quais dimensões críticas, atributos de acabamento e etapas do processo serão verificados?</li><li>É possível fornecer uma amostra ou evidência da primeira peça antes da produção completa?</li><li>Quais registros identificarão o material e o lote entregue?</li><li>Como itens não conformes são comunicados, segregados e aprovados para uma decisão?</li></ul>
<p>Para preparar a solicitação completa, use o <a href=\"/pt/news/aluminium-extrusion-rfq-checklist\">checklist de RFQ para extrusão de alumínio</a>. O objetivo é estabelecer um plano de qualidade compartilhado e verificável, sem prometer que todo fornecedor ou pedido siga o mesmo processo.</p>
""",
            },
            "zh": {
                "title": "铝型材供应商质量控制：采购方检查清单",
                "excerpt": "采购前与供应商对齐检验记录、样品认可、尺寸检查和批次放行要求。",
                "meta_title": "铝型材供应商质量控制采购清单",
                "meta_description": "核对铝型材供应商的质量流程：明确图纸、检验记录、样品、验收标准和出货放行要求。",
                "keywords": "铝型材供应商质量控制，铝型材检验清单，型材尺寸检查，供应商质量记录",
                "tags": ["铝型材", "质量控制", "工程采购指南"],
                "content": """
<p>质量控制沟通只有在买卖双方明确检查项目、验收方式和可提供的记录后才有实际意义。本文聚焦供应商质量证据和项目检查节点。尺寸公差请参阅<a href=\"/zh/news/aluminum-extrusion-drawing-tolerances\">铝型材图纸检查指南</a>；机加工特征请参阅<a href=\"/zh/news/cnc-machined-aluminium-profile-tolerances-inspection\">CNC 型材检验指南</a>。</p>
<h2>1. 使用受控的图纸版本</h2><p>注明图号、版本、单位、合金和状态要求、表面处理、切割长度及二次加工。标出影响装配、安全或外观的关键尺寸和表面。尚未确定的要求应列为待确认事项，不要让双方各自猜测验收限值。</p>
<h2>2. 下单前约定检验计划</h2><p>请供应商说明检验特性、测量方法、抽样阶段和验收规则。将截面尺寸与沿长度方向的直线度或扭拧度分开，也要区分挤压态与机加工、成品状态的要求。适用公差取决于双方确认的规范和产品细节，不应把一个通用数值套用到所有特征。</p>
<h2>3. 确认样品和首件认可</h2><p>新模具或图纸变更时，提前决定量产前是否需要样品、首件报告或装配验证。明确批准人、对应版本，以及认可范围是外观、尺寸、装配还是三者。样品获批不应被默认视为图纸要求已被替代。</p>
<h2>4. 索取与订单可追溯的记录</h2><p>根据项目和合同，记录可包括材料或合金文件、检验结果、表面处理信息以及订单或批次编号。询问文件如何对应到交付批次、保存多久，以及变更件或不合格品如何识别。只索取与产品规范和目标市场要求相关的资料。</p>
<h2>5. 用参照样明确外观与表面处理验收</h2><p>“表面良好”“颜色一致”等说法难以稳定检验。请明确可视面、观察条件、批准样板或颜色参照，以及不可接受的缺陷。阳极氧化外观可能受合金和表面预处理影响；批量生产前应确认样品和检验标准。可参阅<a href=\"/zh/news/aluminum-extrusion-surface-finishes\">铝型材表面处理选择指南</a>。</p>
<h2>6. 明确批次放行和不合格处理</h2><p>确认谁负责放行、检查失败后如何处理，以及返工、替换或让步接收如何记录和批准。发货前，核对数量、包装标识及采购订单要求的检验文件。</p>
<h2>可直接发给供应商的问题</h2><ul><li>检验会使用哪个图纸版本和哪些验收标准？</li><li>会检查哪些关键尺寸、表面特征和工序？</li><li>量产前能否提供样品或首件证据？</li><li>哪些记录用于识别材料和交付批次？</li><li>不合格品如何报告、隔离并批准处置？</li></ul>
<p>准备完整询价资料时，可使用<a href=\"/zh/news/aluminium-extrusion-rfq-checklist\">铝型材 RFQ 清单</a>。目标是建立双方可核查的质量计划，而不是假定所有供应商和订单都采用相同流程。</p>
""",
            },
            "es": {
                "title": "Control de calidad de proveedores de extrusión de aluminio: lista para compradores",
                "excerpt": "Una lista práctica para acordar registros de inspección, aprobación de muestras, verificaciones dimensionales y liberación del lote.",
                "meta_title": "Lista de control de calidad para extrusión de aluminio",
                "meta_description": "Evalúe el proceso de calidad del proveedor: acuerde planos, registros, muestras, criterios de aceptación y liberación del envío.",
                "keywords": "control de calidad extrusión aluminio, inspección perfil aluminio, lista inspección extrusión, registros calidad proveedor",
                "tags": ["Perfiles de aluminio", "Control de calidad", "Guía técnica de compra"],
                "content": """
<p>Una conversación sobre control de calidad solo es útil si comprador y proveedor acuerdan qué se comprobará, cómo se decidirá la aceptación y qué registros estarán disponibles. Esta lista se centra en las evidencias del proveedor y los puntos de control del proyecto. Para tolerancias dimensionales, consulte la <a href=\"/es/news/aluminum-extrusion-drawing-tolerances\">guía de planos de extrusión</a>; para características mecanizadas, consulte la <a href=\"/es/news/cnc-machined-aluminium-profile-tolerances-inspection\">guía de inspección CNC</a>.</p>
<h2>1. Libere una revisión controlada del plano</h2><p>Indique número y revisión del plano, unidades, requisitos de aleación y temple, acabado, longitud de corte y operaciones secundarias. Marque las dimensiones y superficies que afectan al montaje, la seguridad o la apariencia visible. Registre los requisitos aún abiertos como preguntas, en vez de permitir que cada parte suponga un límite de aceptación.</p>
<h2>2. Acuerde el plan de inspección antes del pedido</h2><p>Pida al proveedor que identifique las características que se medirán, el método, la etapa de muestreo y la regla de aceptación. Separe las dimensiones de la sección de la rectitud o torsión a lo largo de la pieza, y distinga los requisitos del perfil extruido de los de la pieza mecanizada o acabada. Las tolerancias aplicables dependen de la especificación acordada y del producto; no aplique un valor genérico a todas las características.</p>
<h2>3. Revise la muestra y la aprobación de primera pieza</h2><p>Para una matriz nueva o un plano revisado, decida si hace falta una muestra, un informe de primera pieza o una comprobación de ajuste antes de la producción regular. Defina quién aprueba, qué revisión representa y si la aprobación cubre apariencia, dimensiones, montaje o los tres aspectos. La aprobación de una muestra no debe sustituir implícitamente un requisito del plano.</p>
<h2>4. Solicite registros trazables vinculados al pedido</h2><p>Según el proyecto y el contrato, los registros pueden incluir documentación del material o la aleación, resultados de inspección, información del acabado y la referencia del pedido o lote. Pregunte cómo se vinculan al lote entregado, cuánto tiempo se conservan y cómo se identifican las piezas modificadas o no conformes. Solicite solo documentos pertinentes a la especificación y al mercado de destino.</p>
<h2>5. Defina la aceptación visual y del acabado con una referencia</h2><p>Expresiones como “buena superficie” o “color uniforme” son difíciles de inspeccionar de forma consistente. Identifique la cara visible, las condiciones de observación, la muestra o referencia de color aprobada y los defectos inaceptables. La aleación y la preparación superficial pueden influir en el aspecto anodizado; acuerde una muestra y los criterios antes de una producción grande. Consulte la <a href=\"/es/news/aluminum-extrusion-surface-finishes\">guía de acabados</a>.</p>
<h2>6. Establezca la liberación del lote y el proceso de no conformidad</h2><p>Confirme quién libera el lote, qué ocurre si falla una comprobación y cómo se documentan y aprueban el retrabajo, el reemplazo o una concesión. Antes del envío, alinee la cantidad, la identificación del embalaje y los documentos de inspección exigidos en la orden.</p>
<h2>Preguntas listas para enviar al proveedor</h2><ul><li>¿Qué revisión del plano y criterios de aceptación se usarán?</li><li>¿Qué dimensiones críticas, atributos de acabado y etapas se comprobarán?</li><li>¿Pueden entregar una muestra o evidencia de primera pieza antes de la producción completa?</li><li>¿Qué registros identificarán el material y el lote entregado?</li><li>¿Cómo se notifican, aíslan y aprueban las piezas no conformes?</li></ul>
<p>Para completar la consulta, use la <a href=\"/es/news/aluminium-extrusion-rfq-checklist\">lista RFQ para extrusión de aluminio</a>. El objetivo es acordar un plan de calidad verificable, no prometer que todos los proveedores o pedidos siguen el mismo proceso.</p>
""",
            },
        },
    },
    {
        "slug": "plum-blossom-aluminum-tube-design-features-applications-and-surface-treatment-options",
        "keyword": "plum blossom aluminum tube profile",
        "translations": {
            "en": {
                "title": "Plum Blossom Aluminum Tube Profiles: How to Define the Section, Fit and Finish",
                "excerpt": "A drawing-first guide to specifying a plum blossom or multi-lobed aluminum tube profile without relying on an ambiguous shape name or assumed standard dimensions.",
                "meta_title": "Plum Blossom Aluminum Tube Profile Design Guide",
                "meta_description": "Specify a plum blossom aluminum tube by its cross-section drawing, critical dimensions, fit, finish and sample criteria. Avoid assumptions based on the shape name alone.",
                "keywords": "plum blossom aluminum tube, flower shaped aluminum tube, multi-lobed aluminum extrusion, custom aluminum tube profile",
                "tags": ["Aluminium Extrusion", "Profile Design", "Engineering Buyer Guide"],
                "content": """
<p>“Plum blossom tube” is a shape description, not enough information to define a purchasable extrusion. Suppliers may interpret the number, depth and radius of lobes differently. Start with a controlled cross-section drawing and identify what the profile must do in the assembly. This guide focuses on specification decisions; it does not imply that a particular standard size or stock item exists.</p>
<h2>Define the cross-section, not just the name</h2>
<p>Show the complete end view with units, overall diameter or width, lobe count and orientation, wall thickness, internal opening, corner radii and any seams or hollow features. Mark critical dimensions and datums that control mating parts. If the section is based on an existing component, include a measured drawing or a sample and state which features must be preserved.</p>
<h2>Explain the fit and function</h2>
<p>Describe the mating component, insertion direction, required clearance and whether rotation or alignment matters. If a multi-lobed shape is intended to locate, cover or resist rotation, state that as a functional requirement and define how it will be checked. Do not assume the shape name alone guarantees a particular mechanical function. Include the assembly environment and any contact, load or exposure conditions needed for engineering review.</p>
<h2>Review extrusion feasibility with the production source</h2>
<p>Extrusion shape and dimensional control depend on the section, alloy, die design and process conditions. Ask the proposed source to review wall balance, narrow grooves, radii, hollow features and the relationship between internal and external dimensions. The practical limits are project-specific; a drawing review should confirm what can be made and measured before tooling is authorized. See our <a href=\"/en/news/aluminium-extrusion-cross-section-die-design-guide\">cross-section die-readiness checklist</a>.</p>
<h2>Choose the finish with a representative sample</h2>
<p>State whether the requirement is mill finish, anodizing, painting or another specified treatment, and identify visible faces, colour, gloss or texture. Alloy and surface preparation can influence the appearance of an anodized part, so approve a production-representative sample when appearance matters. Also confirm whether finish thickness affects a close fit or opening. Our <a href=\"/en/news/aluminum-extrusion-surface-finishes\">finish selection guide</a> explains the questions to include.</p>
<h2>What to send in an RFQ</h2>
<ul><li>Dimensioned cross-section drawing with revision and units.</li><li>Alloy and temper requirement, or the functional requirements for review.</li><li>Critical fit dimensions, datums and acceptance method.</li><li>Cut length, order quantity, finish and any secondary operations.</li><li>Application, sample requirements, packaging and destination market.</li></ul>
<p>Use the <a href=\"/en/news/aluminium-extrusion-rfq-checklist\">extrusion RFQ checklist</a> to complete the inquiry. If the design is not fixed, ask for a feasibility review before treating a catalogue image or informal shape name as a production specification.</p>
""",
            },
            "pt": {
                "title": "Tubos de alumínio em forma de flor de ameixeira: como definir seção, encaixe e acabamento",
                "excerpt": "Guia baseado no desenho para especificar um tubo de alumínio com lóbulos sem depender de um nome ambíguo ou de dimensões padrão presumidas.",
                "meta_title": "Guia de projeto para tubo de alumínio tipo flor de ameixeira",
                "meta_description": "Especifique o tubo de alumínio tipo flor de ameixeira pelo desenho da seção, dimensões críticas, encaixe, acabamento e critérios de amostra. Não dependa apenas do nome do formato.",
                "keywords": "tubo de alumínio flor de ameixeira, tubo de alumínio formato flor, extrusão de alumínio multilobada, perfil tubular personalizado de alumínio",
                "tags": ["Perfis de alumínio", "Projeto de perfis", "Guia técnico de compra"],
                "content": """
<p>“Tubo tipo flor de ameixeira” descreve um formato, mas não fornece informação suficiente para definir uma extrusão pronta para compra. Fornecedores podem interpretar de maneiras diferentes o número, a profundidade e o raio dos lóbulos. Comece com um desenho controlado da seção transversal e identifique a função do perfil na montagem. Este guia trata das decisões de especificação; ele não afirma que exista uma dimensão padrão ou um item de estoque específico.</p>
<h2>Defina a seção transversal, não apenas o nome</h2>
<p>Mostre a vista completa da extremidade com unidades, diâmetro ou largura total, número e orientação dos lóbulos, espessura da parede, abertura interna, raios de canto e eventuais emendas ou cavidades. Marque as dimensões críticas e as referências que controlam as peças de encaixe. Se a seção for baseada em um componente existente, inclua um desenho medido ou uma amostra e indique quais características devem ser mantidas.</p>
<h2>Explique o encaixe e a função</h2>
<p>Descreva o componente de acoplamento, a direção de inserção, a folga necessária e se a rotação ou o alinhamento são importantes. Se o formato multilobado tiver a finalidade de posicionar, cobrir ou resistir à rotação, declare isso como requisito funcional e defina como será verificado. Não presuma que o nome do formato garanta uma função mecânica específica. Inclua o ambiente de montagem e as condições de contato, carga ou exposição necessárias para a análise de engenharia.</p>
<h2>Analise a viabilidade da extrusão com a fonte produtiva</h2>
<p>O formato e o controle dimensional da extrusão dependem da seção, da liga, do projeto da matriz e das condições do processo. Peça à fonte proposta que analise o equilíbrio das paredes, ranhuras estreitas, raios, cavidades e a relação entre dimensões internas e externas. Os limites práticos dependem de cada projeto; a análise do desenho deve confirmar o que pode ser produzido e medido antes da autorização da matriz. Consulte nosso <a href=\"/pt/news/aluminium-extrusion-cross-section-die-design-guide\">checklist de viabilidade da seção e da matriz</a>.</p>
<h2>Escolha o acabamento usando uma amostra representativa</h2>
<p>Indique se o requisito é acabamento de extrusão, anodização, pintura ou outro tratamento especificado, e identifique faces visíveis, cor, brilho ou textura. A liga e a preparação superficial podem influenciar a aparência de uma peça anodizada; por isso, aprove uma amostra representativa da produção quando a aparência for importante. Confirme também se a camada de acabamento afeta um encaixe ou abertura estreita. Nosso <a href=\"/pt/news/aluminum-extrusion-surface-finishes\">guia de seleção de acabamento</a> apresenta as perguntas a incluir.</p>
<h2>O que enviar em uma RFQ</h2>
<ul><li>Desenho cotado da seção transversal, com revisão e unidades.</li><li>Requisito de liga e têmpera ou requisitos funcionais para análise.</li><li>Dimensões críticas de encaixe, referências e método de aceitação.</li><li>Comprimento de corte, quantidade, acabamento e operações secundárias.</li><li>Aplicação, necessidade de amostras, embalagem e mercado de destino.</li></ul>
<p>Use o <a href=\"/pt/news/aluminium-extrusion-rfq-checklist\">checklist de RFQ para extrusão</a> para completar a solicitação. Se o projeto ainda não estiver definido, peça uma análise de viabilidade antes de tratar uma imagem de catálogo ou um nome informal do formato como especificação de produção.</p>
""",
            },
            "zh": {
                "title": "梅花形铝管型材：如何定义截面、配合与表面处理",
                "excerpt": "以图纸为基础的选型指南，说明如何定义梅花形或多瓣铝管，避免仅凭形状名称假设标准尺寸。",
                "meta_title": "梅花形铝管截面设计与选型指南",
                "meta_description": "通过截面图、关键尺寸、装配配合、表面处理和样品标准来定义梅花形铝管，不要只依赖形状名称。",
                "keywords": "梅花形铝管，花形铝管，多瓣铝挤压型材，定制铝管截面",
                "tags": ["铝型材", "型材设计", "工程采购指南"],
                "content": """
<p>“梅花管”是一种形状描述，单靠名称不足以定义可采购的挤压型材。不同供应商可能对瓣数、瓣深和圆角作出不同理解。应从受控的截面图开始，并说明型材在装配中的功能。本指南讨论规格定义，不表示存在某个通用标准尺寸或现货产品。</p>
<h2>定义完整截面，而不只是名称</h2><p>提供完整端面图，标注单位、总直径或宽度、瓣数和方向、壁厚、内孔、圆角，以及可能存在的接缝或中空结构。标出控制配合件的关键尺寸和基准。如果截面来自现有部件，应附测绘图或样品，并注明必须保留的特征。</p>
<h2>说明装配配合与功能</h2><p>描述配合部件、插入方向、所需间隙，以及旋转或定位是否重要。如果多瓣形状用于定位、覆盖或防转，应把它写成功能要求，并定义验证方法。不能仅凭形状名称推断机械功能。还应提供工程评审所需的装配环境、接触、载荷或暴露条件。</p>
<h2>与生产方评审挤压可行性</h2><p>挤压截面和尺寸控制受截面形状、合金、模具设计及工艺条件影响。请生产方评审壁厚平衡、窄槽、圆角、中空结构，以及内外尺寸之间的关系。实际限制取决于项目；开模前应通过图纸评审确认可制造和可测量的要求。参阅<a href=\"/zh/news/aluminium-extrusion-cross-section-die-design-guide\">截面与模具可行性清单</a>。</p>
<h2>用代表性样品选择表面处理</h2><p>注明所需的是挤压原色、阳极氧化、喷涂还是其他处理，并标出可视面、颜色、光泽或纹理。合金和表面预处理可能影响阳极氧化外观；外观重要时应批准具有代表性的生产样品。还要确认涂层厚度是否影响紧配合或开口。可参阅<a href=\"/zh/news/aluminum-extrusion-surface-finishes\">型材表面处理选择指南</a>。</p>
<h2>询价时应提供什么</h2><ul><li>带版本和单位的截面尺寸图。</li><li>合金和状态要求，或供评审的功能要求。</li><li>关键配合尺寸、基准及验收方法。</li><li>切割长度、订购数量、表面处理和二次加工。</li><li>应用、样品要求、包装和目的市场。</li></ul>
<p>可用<a href=\"/zh/news/aluminium-extrusion-rfq-checklist\">铝型材询价清单</a>补齐资料。如果设计尚未定稿，应先要求可行性评审，不要把目录图片或非正式形状名称当作生产规格。</p>
""",
            },
            "es": {
                "title": "Perfiles tubulares de aluminio tipo flor de ciruelo: cómo definir sección, ajuste y acabado",
                "excerpt": "Guía basada en planos para especificar un tubo de aluminio multilobulado sin depender de un nombre ambiguo ni asumir dimensiones estándar.",
                "meta_title": "Guía de diseño para tubo de aluminio tipo flor de ciruelo",
                "meta_description": "Defina el tubo tipo flor de ciruelo mediante el plano de sección, dimensiones críticas, ajuste, acabado y criterios de muestra. No se base solo en el nombre.",
                "keywords": "tubo aluminio flor de ciruelo, tubo aluminio forma flor, extrusión aluminio multilobulada, perfil tubular aluminio a medida",
                "tags": ["Perfiles de aluminio", "Diseño de perfiles", "Guía técnica de compra"],
                "content": """
<p>“Tubo tipo flor de ciruelo” describe una forma, pero no basta para definir una extrusión que pueda comprarse. Distintos proveedores pueden interpretar de manera diferente el número, la profundidad y el radio de los lóbulos. Empiece con un plano controlado de la sección e indique la función del perfil en el conjunto. Esta guía aborda decisiones de especificación; no afirma que exista una dimensión estándar o un producto en stock concreto.</p>
<h2>Defina la sección completa, no solo el nombre</h2><p>Muestre la vista completa del extremo con unidades, diámetro o ancho total, número y orientación de lóbulos, espesor de pared, abertura interior, radios y posibles uniones o cavidades. Marque las dimensiones críticas y referencias que controlan las piezas acopladas. Si la sección se basa en un componente existente, incluya un plano medido o una muestra e indique qué características deben conservarse.</p>
<h2>Explique el ajuste y la función</h2><p>Describa el componente de acoplamiento, la dirección de inserción, la holgura necesaria y si importan la rotación o la alineación. Si la forma multilobulada debe posicionar, cubrir o resistir el giro, indíquelo como requisito funcional y defina cómo se verificará. No suponga que el nombre de la forma garantiza una función mecánica específica. Incluya las condiciones de montaje, contacto, carga o exposición necesarias para la revisión técnica.</p>
<h2>Revise la viabilidad de extrusión con la fuente de producción</h2><p>La forma y el control dimensional dependen de la sección, la aleación, el diseño de matriz y las condiciones del proceso. Pida revisar el equilibrio de paredes, ranuras estrechas, radios, cavidades y la relación entre dimensiones internas y externas. Los límites prácticos dependen del proyecto; la revisión del plano debe confirmar qué puede fabricarse y medirse antes de autorizar la matriz. Consulte la <a href=\"/es/news/aluminium-extrusion-cross-section-die-design-guide\">lista de viabilidad de sección y matriz</a>.</p>
<h2>Elija el acabado con una muestra representativa</h2><p>Indique si necesita acabado de extrusión, anodizado, pintura u otro tratamiento, y señale las caras visibles, color, brillo o textura. La aleación y la preparación superficial pueden influir en el aspecto anodizado; apruebe una muestra representativa cuando la apariencia sea importante. Confirme también si el espesor del acabado afecta a un ajuste cerrado o a una abertura. Consulte la <a href=\"/es/news/aluminum-extrusion-surface-finishes\">guía de acabados</a>.</p>
<h2>Qué enviar en una RFQ</h2><ul><li>Plano acotado de la sección, con revisión y unidades.</li><li>Requisito de aleación y temple o requisitos funcionales para revisar.</li><li>Dimensiones críticas de ajuste, referencias y método de aceptación.</li><li>Longitud de corte, cantidad, acabado y operaciones secundarias.</li><li>Aplicación, muestras, embalaje y mercado de destino.</li></ul>
<p>Use la <a href=\"/es/news/aluminium-extrusion-rfq-checklist\">lista RFQ de extrusión de aluminio</a> para completar la consulta. Si el diseño aún no está definido, solicite una revisión de viabilidad antes de tratar una imagen de catálogo o un nombre informal como especificación de producción.</p>
""",
            },
        },
    },
]


def main():
    expected_locales = {"en", "zh", "es", "pt"}
    for item in ARTICLES:
        if set(item["translations"]) != expected_locales:
            raise CommandError(f"Missing required localized copy for {item['slug']}")
        if Article.objects.filter(slug=item["slug"]).exists():
            raise CommandError(f"Refusing to overwrite existing article: {item['slug']}")
        if AluminumBlogTopic.objects.filter(slug=item["slug"]).exists():
            raise CommandError(f"Refusing to overwrite existing topic: {item['slug']}")
        for locale, fields in item["translations"].items():
            for required in ("title", "excerpt", "meta_title", "meta_description", "content"):
                if not fields.get(required):
                    raise CommandError(f"Missing {required}: {item['slug']} ({locale})")

    if "sqlite" not in connection.settings_dict["ENGINE"]:
        raise CommandError("Expected the production SQLite database; aborting backup/publish flow.")

    backup_dir = Path(settings.BASE_DIR).parent / "backups" / "20261126_gsc_blog_recovery"
    backup_dir.mkdir(parents=True, exist_ok=True)
    connection.ensure_connection()
    db_backup = sqlite3.connect(backup_dir / "database-before.sqlite3")
    connection.connection.backup(db_backup)
    db_backup.close()
    translation_paths = {}
    for locale in ("zh", "es", "pt"):
        path = translation_service._get_translation_file_path("article", locale)
        translation_paths[locale] = path
        if path.exists():
            shutil.copy2(path, backup_dir / path.name)

    created = []
    with transaction.atomic():
        for item in ARTICLES:
            en = item["translations"]["en"]
            article = Article.objects.create(
                slug=item["slug"], title=en["title"], content=en["content"].strip(),
                excerpt=en["excerpt"], status="published", is_featured=False,
                meta_title=en["meta_title"], meta_description=en["meta_description"],
                meta_keywords=en["keywords"],
            )
            tags = []
            for index, name in enumerate(en["tags"]):
                tag, _ = Tag.objects.get_or_create(name=name, defaults={"slug": slugify(name)[:50]})
                tags.append(tag)
            article.tags.set(tags)

            for locale in ("zh", "es", "pt"):
                localized = item["translations"][locale]
                translations = translation_service._load_translations_from_file("article", locale)
                for field in ("title", "content", "excerpt", "meta_title", "meta_description"):
                    translations[f"{field}_{article.id}"] = localized[field].strip()
                translations[f"meta_keywords_{article.id}"] = localized["keywords"]
                for tag, localized_name in zip(tags, localized["tags"]):
                    translations[f"tag_{tag.id}"] = localized_name
                if not translation_service._save_translations_to_file("article", locale, translations):
                    raise CommandError(f"Failed to save {locale} translation for {item['slug']}")

            AluminumBlogTopic.objects.create(
                slug=item["slug"], title=en["title"], primary_keyword=item["keyword"],
                status="published", article=article,
                notes="Created as a focused GSC 404 recovery article after checking the live 22-article catalog; scoped to avoid overlap with existing RFQ, tolerance, finish and inspection guides.",
            )
            created.append({"id": article.id, "slug": article.slug})

    print(json.dumps({"created": created, "backup": str(backup_dir)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

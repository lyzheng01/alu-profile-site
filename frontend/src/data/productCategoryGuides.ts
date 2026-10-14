export interface ProductCategoryGuide {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  checksTitle: string;
  checks: Array<{ title: string; description: string }>;
  rfqTitle: string;
  rfqItems: string[];
  serviceNote: string;
  articleLabel: string;
  articlePath?: string;
  heroImageAlt: string;
  heroImageNote: string;
}

type GuideCopy = Pick<ProductCategoryGuide, 'title' | 'metaTitle' | 'metaDescription' | 'intro' | 'checksTitle' | 'checks' | 'rfqTitle' | 'rfqItems' | 'serviceNote' | 'articleLabel'>;

const catalogMeta: Record<string, { title: string; description: string }> = {
  en: { title: 'Aluminum Profile Product Catalog | LingYe', description: 'Browse aluminum profiles by application, compare verified project details, and prepare a clearer sourcing inquiry.' },
  zh: { title: '铝型材产品目录与采购询价 | 凌烨铝业', description: '按应用浏览铝型材产品，核对项目所需资料，并整理清晰的采购询价要求。' },
  es: { title: 'Catálogo de perfiles de aluminio | LingYe', description: 'Explore perfiles de aluminio por aplicación, revise los datos del proyecto y prepare una consulta de abastecimiento.' },
  pt: { title: 'Catálogo de perfis de alumínio | LingYe', description: 'Explore perfis de alumínio por aplicação, confira os dados do projeto e prepare uma solicitação de cotação.' },
};

export const getProductCatalogMeta = (language: string) => catalogMeta[language] || catalogMeta.en;

const windowDoorGuides: Record<string, ProductCategoryGuide> = {
  en: {
    title: 'Window & Door Aluminum Profiles: Selection and RFQ Guide',
    metaTitle: 'Window & Door Aluminum Profiles | LingYe',
    metaDescription: 'Compare window and door profile systems by opening type, mating sections, hardware, glazing, finish, and evidence. Prepare a clearer aluminum profile RFQ.',
    intro: 'A profile name alone is not enough to compare window and door quotations. Start with the complete system and its interfaces; confirm project-specific dimensions and performance from approved drawings and documents.',
    checksTitle: 'What to check before choosing a system',
    checks: [
      { title: 'Opening type and system series', description: 'Define sliding, casement, folding, or another configuration, then identify the exact frame, sash, interlock, track, and bead sections required.' },
      { title: 'Mating sections and hardware', description: 'Check how profiles engage and identify roller, lock, hinge, gasket, screw, and drainage interfaces. Similar-looking sections are not proof of compatibility.' },
      { title: 'Glazing and project performance', description: 'Specify glass build-up and project targets. Request evidence that applies to the quoted complete window configuration; a profile description alone does not establish whole-window performance.' },
      { title: 'Alloy, temper, finish, and appearance', description: 'State required alloy and temper, coating or anodizing system, color reference, visible faces, and sample-approval criteria. Confirm availability and acceptance limits in the quotation.' },
      { title: 'Scope and delivery', description: 'Separate extrusion, thermal-break assembly, machining, fabrication, hardware, inspection, packaging, and freight so quotations can be compared on the same basis.' },
    ],
    rfqTitle: 'RFQ information that makes quotations comparable',
    rfqItems: ['Destination country and project application', 'Opening schedule, quantities, and target lengths', 'Dimensioned section drawings with revision and units', 'Critical interfaces, glass, gasket, and hardware requirements', 'Alloy/temper, finish, color reference, and acceptance criteria', 'Required tests or documents and the configuration they must cover', 'Machining/fabrication scope, sample approval, packaging, and delivery terms'],
    serviceNote: 'LingYe coordinates sourcing and supplier communication. Final section, system compatibility, availability, and project requirements must be confirmed against supplier documents and approved drawings.',
    articleLabel: 'Read the thermal-break window RFQ guide',
    articlePath: 'news/thermal-break-window-profile-rfq-guide',
    heroImageAlt: 'Illustrative window profile system cross-section',
    heroImageNote: 'Illustrative reference only; confirm the final section and system interfaces against approved drawings.',
  },
  zh: {
    title: '门窗铝型材选型与询价指南',
    metaTitle: '门窗铝型材选型与询价指南 | 凌烨铝业',
    metaDescription: '从开启方式、型材配合、五金、玻璃、表面处理和证明文件评估门窗型材系统，整理更可比的铝型材询价资料。',
    intro: '仅凭产品名称无法有效比较门窗型材报价。先明确完整系统及各接口，再依据确认版图纸和项目文件核对具体尺寸与性能要求。',
    checksTitle: '选型前建议核对的事项',
    checks: [
      { title: '开启方式与系统系列', description: '明确推拉、平开、折叠或其他配置，并列出所需的框、扇、中梃、轨道和压线截面。' },
      { title: '配合型材与五金接口', description: '核对型材之间的咬合关系，并标明滚轮、锁具、铰链、胶条、螺钉及排水接口。外观相似不代表可以互换。' },
      { title: '玻璃配置与项目性能', description: '说明玻璃构成和项目目标，并索取适用于所报整窗配置的依据。仅凭型材描述不能证明整窗性能。' },
      { title: '合金、状态、表面处理与外观', description: '注明合金及状态、喷涂或氧化体系、颜色参考、可视面和样品验收标准；供应可行性与验收范围应在报价中确认。' },
      { title: '报价范围与交付', description: '分别列明挤压、隔热复合、机加工、门窗制作、五金、检验、包装和运输，便于按同一范围比较报价。' },
    ],
    rfqTitle: '让报价更可比的询价资料',
    rfqItems: ['目的国家、项目用途及使用环境', '开启表、配置数量和所需长度', '标明版本与单位的尺寸截面图', '关键配合接口、玻璃、胶条和五金要求', '合金/状态、表面处理、颜色参考和验收标准', '要求提供的测试或文件及其适用配置', '机加工/制作范围、样品审批、包装和交付条款'],
    serviceNote: '凌烨负责采购协调与供应商沟通。最终截面、系统兼容性、供应情况及项目要求，应以供应商资料和确认版图纸为准。',
    articleLabel: '阅读断桥门窗型材询价指南',
    articlePath: 'news/thermal-break-window-profile-rfq-guide',
    heroImageAlt: '门窗型材系统截面示意图',
    heroImageNote: '图片仅供示意参考；最终截面及系统接口以确认后的图纸为准。',
  },
  es: {
    title: 'Perfiles de aluminio para ventanas y puertas: guía de selección y cotización',
    metaTitle: 'Perfiles de aluminio para ventanas y puertas | LingYe',
    metaDescription: 'Evalúe sistemas de perfiles según apertura, uniones, herrajes, acristalamiento, acabado y documentación. Prepare una solicitud de cotización más comparable.',
    intro: 'El nombre de un perfil no basta para comparar cotizaciones de ventanas y puertas. Defina primero el sistema completo y sus interfaces; confirme las dimensiones y prestaciones del proyecto mediante planos aprobados y documentos aplicables.',
    checksTitle: 'Qué revisar antes de elegir un sistema',
    checks: [
      { title: 'Tipo de apertura y serie', description: 'Defina si será corredera, abatible, plegable u otra configuración, e identifique los perfiles necesarios de marco, hoja, encuentro, guía y junquillo.' },
      { title: 'Perfiles acoplados y herrajes', description: 'Compruebe cómo encajan los perfiles y especifique interfaces de ruedas, cierres, bisagras, juntas, tornillos y drenaje. Un aspecto parecido no demuestra compatibilidad.' },
      { title: 'Acristalamiento y prestaciones del proyecto', description: 'Indique la composición del vidrio y los objetivos del proyecto. Solicite documentación aplicable a la configuración completa cotizada; la descripción del perfil no demuestra por sí sola el rendimiento de la ventana.' },
      { title: 'Aleación, temple, acabado y apariencia', description: 'Indique aleación y temple, sistema de pintura o anodizado, referencia de color, caras vistas y criterios de aprobación de muestras. Confirme disponibilidad y aceptación en la oferta.' },
      { title: 'Alcance y entrega', description: 'Separe extrusión, ensamblaje de rotura térmica, mecanizado, fabricación, herrajes, inspección, embalaje y transporte para comparar ofertas equivalentes.' },
    ],
    rfqTitle: 'Datos RFQ para comparar ofertas en igualdad de condiciones',
    rfqItems: ['País de destino y aplicación del proyecto', 'Cuadro de aperturas, cantidades y longitudes requeridas', 'Planos de sección acotados, con revisión y unidades', 'Interfaces críticas, vidrio, juntas y requisitos de herrajes', 'Aleación/temple, acabado, referencia de color y criterios de aceptación', 'Ensayos o documentos solicitados y configuración que deben cubrir', 'Alcance de mecanizado/fabricación, aprobación de muestras, embalaje y entrega'],
    serviceNote: 'LingYe coordina el abastecimiento y la comunicación con proveedores. La sección final, compatibilidad, disponibilidad y requisitos del proyecto deben confirmarse con documentos del proveedor y planos aprobados.',
    articleLabel: 'Leer la guía RFQ para perfiles de ventana con rotura de puente térmico',
    articlePath: 'news/thermal-break-window-profile-rfq-guide',
    heroImageAlt: 'Sección ilustrativa de un sistema de perfiles para ventanas',
    heroImageNote: 'Imagen ilustrativa; confirme la sección final y las interfaces del sistema con los planos aprobados.',
  },
  pt: {
    title: 'Perfis de alumínio para janelas e portas: guia de seleção e cotação',
    metaTitle: 'Perfis de alumínio para janelas e portas | LingYe',
    metaDescription: 'Avalie sistemas de perfis considerando abertura, encaixes, ferragens, envidraçamento, acabamento e documentação. Prepare uma solicitação de cotação comparável.',
    intro: 'O nome de um perfil, por si só, não permite comparar cotações de janelas e portas. Defina primeiro o sistema completo e as suas interfaces; confirme as dimensões e o desempenho do projeto com desenhos aprovados e documentos aplicáveis.',
    checksTitle: 'O que verificar antes de escolher um sistema',
    checks: [
      { title: 'Tipo de abertura e série', description: 'Defina se será de correr, de abrir, sanfonada ou outra configuração e identifique os perfis necessários de marco, folha, encontro, trilho e baguete.' },
      { title: 'Perfis conjugados e ferragens', description: 'Verifique como os perfis se encaixam e especifique as interfaces de roldanas, fechaduras, dobradiças, vedações, parafusos e drenagem. Aparência semelhante não comprova compatibilidade.' },
      { title: 'Envidraçamento e desempenho do projeto', description: 'Informe a composição do vidro e os objetivos do projeto. Solicite evidências aplicáveis à configuração completa cotada; a descrição do perfil, sozinha, não comprova o desempenho da janela.' },
      { title: 'Liga, têmpera, acabamento e aparência', description: 'Informe liga e têmpera, sistema de pintura ou anodização, referência de cor, faces aparentes e critérios de aprovação de amostras. Confirme disponibilidade e aceitação na proposta.' },
      { title: 'Escopo e entrega', description: 'Separe extrusão, montagem da barreira térmica, usinagem, fabricação, ferragens, inspeção, embalagem e frete para comparar propostas com o mesmo escopo.' },
    ],
    rfqTitle: 'Informações de RFQ para comparar propostas',
    rfqItems: ['País de destino e aplicação do projeto', 'Quadro de aberturas, quantidades e comprimentos necessários', 'Desenhos cotados da seção, com revisão e unidades', 'Interfaces críticas, vidro, vedações e requisitos de ferragens', 'Liga/têmpera, acabamento, referência de cor e critérios de aceitação', 'Ensaios ou documentos solicitados e configuração que devem abranger', 'Escopo de usinagem/fabricação, aprovação de amostras, embalagem e condições de entrega'],
    serviceNote: 'A LingYe coordena o fornecimento e a comunicação com fornecedores. A seção final, a compatibilidade, a disponibilidade e os requisitos do projeto devem ser confirmados nos documentos do fornecedor e nos desenhos aprovados.',
    articleLabel: 'Leia o guia RFQ para perfis de janela com ruptura térmica',
    articlePath: 'news/thermal-break-window-profile-rfq-guide',
    heroImageAlt: 'Seção ilustrativa de um sistema de perfis para janelas',
    heroImageNote: 'Imagem ilustrativa; confirme a seção final e as interfaces do sistema com os desenhos aprovados.',
  },
};

export const getWindowDoorGuide = (language: string): ProductCategoryGuide =>
  windowDoorGuides[language] || windowDoorGuides.en;

const categoryGuides: Record<string, Record<string, GuideCopy>> = {
  'cabinet-profiles': {
    en: {
      title: 'Cabinet & Wardrobe Aluminum Profiles',
      metaTitle: 'Cabinet & Wardrobe Aluminum Profiles | LingYe',
      metaDescription: 'Compare cabinet and wardrobe aluminum profiles by panel fit, section geometry, hardware interfaces, finish, and fabrication scope. Prepare a drawing-led RFQ.',
      intro: 'For cabinet and wardrobe systems, the visible frame is only one part of the fit. Check the panel edge, joinery, hardware, and installation clearances together before comparing profile quotations.',
      checksTitle: 'Check the full cabinet interface',
      checks: [
        { title: 'Panel and frame fit', description: 'Specify panel material and thickness, edge condition, insertion depth, and the visible frame face. Confirm dimensions from the section drawing rather than a product name.' },
        { title: 'Corner and joining method', description: 'Show corner joints, end conditions, and any joining keys or machining. Confirm whether the profile is supplied cut-to-length or requires further fabrication.' },
        { title: 'Handle and accessory interfaces', description: 'Identify handleless channels, pulls, hinges, rollers, seals, and fastener positions. Similar-looking channels may not accept the same hardware.' },
        { title: 'Finish on visible faces', description: 'Mark exposed faces and specify color reference, gloss, texture, and sample approval. Confirm protection requirements for packing and installation.' },
      ],
      rfqTitle: 'Information to include in a cabinet-profile RFQ',
      rfqItems: ['Section drawing with revision and units', 'Panel material, thickness, and edge detail', 'Corner joint and machining requirements', 'Hardware model or interface drawing', 'Cut lengths, quantities, and packaging method', 'Finish sample, visible-face, and acceptance requirements'],
      serviceNote: 'LingYe coordinates sourcing and supplier communication. Final fit, hardware compatibility, and finish acceptance should be confirmed against approved drawings and samples.',
      articleLabel: 'Browse matching cabinet and wardrobe profiles',
    },
    zh: {
      title: '橱柜与衣柜铝型材',
      metaTitle: '橱柜与衣柜铝型材选型与询价 | 凌烨铝业',
      metaDescription: '从板材适配、截面结构、五金接口、表面处理和加工范围评估橱柜与衣柜铝型材，并整理图纸化询价资料。',
      intro: '橱柜和衣柜系统是否适配，不只取决于可见边框。比较型材报价前，应同时核对板材边缘、连接方式、五金接口及安装间隙。',
      checksTitle: '先核对完整的柜体配合关系',
      checks: [
        { title: '板材与框料配合', description: '注明板材材质、厚度、边部处理、插入深度和外露框面。尺寸应以截面图确认，不要只凭产品名称判断。' },
        { title: '转角与连接方式', description: '标出转角接头、端部结构、连接键及所需机加工，并确认型材是定尺供应还是还需后续加工。' },
        { title: '拉手与配件接口', description: '列出无拉手槽、拉手、铰链、滑轮、密封件和紧固件位置。外形相似的槽口不一定兼容同一套五金。' },
        { title: '可视面的表面要求', description: '标注外露面，明确颜色参考、光泽、纹理和样品确认要求，并说明包装及安装期间的表面保护需求。' },
      ],
      rfqTitle: '柜体型材询价建议提供',
      rfqItems: ['注明版本与单位的截面图', '板材材质、厚度及边部细节', '转角连接与机加工要求', '五金型号或接口图', '定尺长度、数量及包装方式', '表面样板、可视面和验收要求'],
      serviceNote: '凌烨负责采购协调与供应商沟通。最终配合、五金兼容性和表面验收，应以确认版图纸及样品为准。',
      articleLabel: '查看相关橱柜与衣柜型材',
    },
    es: {
      title: 'Perfiles de aluminio para muebles y armarios',
      metaTitle: 'Perfiles de aluminio para muebles | LingYe',
      metaDescription: 'Compare perfiles para muebles según el encaje del panel, la geometría, los herrajes, el acabado y el mecanizado. Prepare una RFQ basada en planos.',
      intro: 'En muebles y armarios, el marco visible es solo una parte del ajuste. Antes de comparar ofertas, revise conjuntamente el canto del panel, las uniones, los herrajes y las holguras de montaje.',
      checksTitle: 'Revise todas las interfaces del mueble',
      checks: [
        { title: 'Ajuste del panel y el marco', description: 'Indique material y espesor del panel, acabado del canto, profundidad de inserción y cara visible. Confirme las medidas en el plano de sección, no solo por el nombre.' },
        { title: 'Uniones y esquinas', description: 'Muestre las uniones de esquina, extremos, llaves de unión y mecanizados. Confirme si el perfil se entrega cortado o requiere fabricación posterior.' },
        { title: 'Interfaces de tiradores y accesorios', description: 'Identifique canales gola, tiradores, bisagras, rodajes, juntas y posiciones de fijación. Un canal de aspecto similar no garantiza compatibilidad.' },
        { title: 'Acabado de las caras vistas', description: 'Marque las caras expuestas e indique color, brillo, textura y aprobación de muestra. Confirme la protección durante embalaje e instalación.' },
      ],
      rfqTitle: 'Datos para una RFQ de perfiles para muebles',
      rfqItems: ['Plano de sección con revisión y unidades', 'Material, espesor y detalle del canto del panel', 'Uniones de esquina y mecanizado requerido', 'Modelo de herraje o plano de interfaz', 'Longitudes de corte, cantidades y embalaje', 'Muestra de acabado, caras vistas y aceptación'],
      serviceNote: 'LingYe coordina el abastecimiento y la comunicación con proveedores. El ajuste final, la compatibilidad de herrajes y la aceptación del acabado deben confirmarse con planos aprobados y muestras.',
      articleLabel: 'Ver perfiles relacionados para muebles y armarios',
    },
    pt: {
      title: 'Perfis de alumínio para móveis e armários',
      metaTitle: 'Perfis de alumínio para móveis | LingYe',
      metaDescription: 'Compare perfis para móveis considerando encaixe do painel, geometria, ferragens, acabamento e usinagem. Prepare uma RFQ baseada em desenhos.',
      intro: 'Em móveis e armários, a moldura aparente é apenas parte do encaixe. Antes de comparar propostas, verifique em conjunto a borda do painel, as uniões, as ferragens e as folgas de montagem.',
      checksTitle: 'Confira todas as interfaces do móvel',
      checks: [
        { title: 'Encaixe do painel e da moldura', description: 'Informe material e espessura do painel, acabamento da borda, profundidade de encaixe e face aparente. Confirme as dimensões no desenho da seção.' },
        { title: 'Cantos e método de união', description: 'Mostre uniões de canto, extremidades, conectores e usinagens. Confirme se o perfil será fornecido cortado ou se exige fabricação posterior.' },
        { title: 'Interfaces de puxadores e acessórios', description: 'Identifique canais gola, puxadores, dobradiças, roldanas, vedações e posições de fixação. A semelhança visual não garante compatibilidade.' },
        { title: 'Acabamento das faces aparentes', description: 'Marque as faces expostas e especifique referência de cor, brilho, textura e aprovação de amostra. Confirme a proteção durante embalagem e instalação.' },
      ],
      rfqTitle: 'Dados para uma RFQ de perfis para móveis',
      rfqItems: ['Desenho da seção com revisão e unidades', 'Material, espessura e detalhe da borda do painel', 'Uniões de canto e usinagem necessária', 'Modelo da ferragem ou desenho da interface', 'Comprimentos de corte, quantidades e embalagem', 'Amostra de acabamento, faces aparentes e critérios de aceitação'],
      serviceNote: 'A LingYe coordena o fornecimento e a comunicação com fornecedores. O encaixe final, a compatibilidade das ferragens e a aceitação do acabamento devem ser confirmados com desenhos aprovados e amostras.',
      articleLabel: 'Ver perfis relacionados para móveis e armários',
    },
  },
  'industrial-profiles': {
    en: {
      title: 'Industrial Aluminum Extrusion Profiles', metaTitle: 'Industrial Aluminum Profiles for Equipment | LingYe',
      metaDescription: 'Specify industrial aluminum extrusions for equipment, enclosures, heat sinks, and OEM assemblies with drawing-based dimensions, machining, finish, and inspection requirements.',
      intro: 'Industrial profile selection starts with the assembly and its loads, not a generic alloy claim. Define the interfaces and inspection points on the drawing so suppliers can quote the same scope.',
      checksTitle: 'Turn the application into checkable requirements',
      checks: [
        { title: 'Load path and support points', description: 'Show how the section is supported and loaded, including fasteners and contact surfaces. Structural suitability must be reviewed for the actual assembly.' },
        { title: 'Critical dimensions and tolerances', description: 'Identify datum faces, fit dimensions, straightness, and machining references. Call out tolerances only where the assembly needs them.' },
        { title: 'Heat, airflow, or enclosure needs', description: 'For heat sinks, share the component footprint and airflow constraints; for enclosures, show panel, sealing, and access interfaces.' },
        { title: 'Processing and inspection scope', description: 'Separate extrusion, cutting, drilling, CNC, finishing, inspection records, and packaging in the quotation.' },
      ],
      rfqTitle: 'Industrial extrusion RFQ checklist', rfqItems: ['Dimensioned section and assembly drawing', 'Alloy and temper requirement or approval process', 'Critical dimensions, datums, and tolerance notes', 'Machining operations and deburring requirements', 'Finish, color, and appearance sample', 'Inspection records, quantity, packaging, and destination'],
      serviceNote: 'LingYe coordinates project sourcing. Load capacity, thermal performance, and compliance are not inferred from the profile alone; define the applicable test or engineering review in the project scope.',
      articleLabel: 'Explore industrial extrusion and machining references',
    },
    zh: {
      title: '工业铝挤压型材', metaTitle: '工业铝型材与设备项目选型 | 凌烨铝业',
      metaDescription: '面向设备、机箱、散热器和 OEM 组件，按图纸明确工业铝挤压型材的尺寸、加工、表面处理与检验要求。',
      intro: '工业型材选型应从组件结构和受力方式出发，而不是依赖笼统的合金描述。把配合接口和检验点标在图纸上，供应商才能按同一范围报价。',
      checksTitle: '把应用需求转成可核对的技术要求',
      checks: [
        { title: '受力路径与支撑位置', description: '标出截面的支撑、受力位置、紧固件和接触面。承载适用性需要结合实际组件进行评估。' },
        { title: '关键尺寸与公差', description: '明确基准面、配合尺寸、直线度和机加工基准。仅对装配真正需要控制的尺寸标注公差。' },
        { title: '散热、气流或箱体需求', description: '散热器项目提供器件接触区域和气流限制；机箱项目标明面板、密封及检修接口。' },
        { title: '加工与检验范围', description: '报价中分别列明挤压、切割、钻孔、CNC、表面处理、检验记录和包装。' },
      ],
      rfqTitle: '工业挤压型材询价清单', rfqItems: ['标注尺寸的截面图和组件图', '合金及状态要求或确认流程', '关键尺寸、基准和公差备注', '机加工工序及去毛刺要求', '表面处理、颜色及外观样板', '检验记录、数量、包装和目的地'],
      serviceNote: '凌烨负责项目采购协调。承载能力、热性能和合规性不能仅凭型材截面推断；请在项目范围中明确适用测试或工程评审。',
      articleLabel: '查看工业挤压与机加工参考内容',
    },
    es: {
      title: 'Perfiles industriales de aluminio extrusionado', metaTitle: 'Perfiles industriales de aluminio para equipos | LingYe',
      metaDescription: 'Defina extrusiones industriales para equipos, envolventes, disipadores y conjuntos OEM mediante planos, mecanizado, acabado e inspección.',
      intro: 'La selección industrial parte del conjunto y de sus cargas, no de una afirmación genérica sobre la aleación. Defina interfaces y puntos de inspección en el plano para comparar ofertas con el mismo alcance.',
      checksTitle: 'Convierta la aplicación en requisitos verificables',
      checks: [
        { title: 'Recorrido de carga y apoyos', description: 'Indique apoyos, cargas, fijaciones y superficies de contacto. La aptitud estructural debe evaluarse para el conjunto real.' },
        { title: 'Dimensiones críticas y tolerancias', description: 'Defina caras de referencia, cotas de ajuste, rectitud y referencias de mecanizado. Especifique tolerancias donde el montaje las requiera.' },
        { title: 'Refrigeración o envolvente', description: 'Para disipadores, comparta la huella del componente y las restricciones de flujo de aire; para envolventes, detalle paneles, sellado y acceso.' },
        { title: 'Procesos e inspección', description: 'Separe extrusión, corte, taladrado, CNC, acabado, registros de inspección y embalaje en la oferta.' },
      ],
      rfqTitle: 'Lista RFQ para extrusión industrial', rfqItems: ['Plano acotado de sección y conjunto', 'Aleación y temple requeridos o proceso de aprobación', 'Cotas críticas, referencias y tolerancias', 'Operaciones de mecanizado y desbarbado', 'Acabado, color y muestra visual', 'Registros de inspección, cantidad, embalaje y destino'],
      serviceNote: 'LingYe coordina el abastecimiento del proyecto. La capacidad de carga, el rendimiento térmico y la conformidad no se deducen solo del perfil; defina las pruebas o revisiones de ingeniería aplicables.',
      articleLabel: 'Consultar referencias de extrusión y mecanizado industrial',
    },
    pt: {
      title: 'Perfis industriais de alumínio extrudado', metaTitle: 'Perfis industriais de alumínio para equipamentos | LingYe',
      metaDescription: 'Especifique extrusões industriais para equipamentos, gabinetes, dissipadores e conjuntos OEM com requisitos de desenho, usinagem, acabamento e inspeção.',
      intro: 'A seleção industrial começa pelo conjunto e pelos esforços envolvidos, não por uma afirmação genérica sobre a liga. Defina interfaces e pontos de inspeção no desenho para comparar propostas com o mesmo escopo.',
      checksTitle: 'Transforme a aplicação em requisitos verificáveis',
      checks: [
        { title: 'Caminho de carga e apoios', description: 'Indique apoios, cargas, fixadores e superfícies de contato. A adequação estrutural deve ser avaliada para o conjunto real.' },
        { title: 'Dimensões críticas e tolerâncias', description: 'Defina faces de referência, dimensões de encaixe, retilineidade e referências de usinagem. Indique tolerâncias onde a montagem exigir.' },
        { title: 'Dissipação térmica ou gabinete', description: 'Para dissipadores, informe a área de contato do componente e as restrições de fluxo de ar; para gabinetes, detalhe painel, vedação e acesso.' },
        { title: 'Processos e inspeção', description: 'Separe extrusão, corte, furação, CNC, acabamento, registros de inspeção e embalagem na proposta.' },
      ],
      rfqTitle: 'Checklist RFQ para extrusão industrial', rfqItems: ['Desenho cotado da seção e do conjunto', 'Liga e têmpera ou processo de aprovação', 'Dimensões críticas, referências e tolerâncias', 'Operações de usinagem e rebarbação', 'Acabamento, cor e amostra visual', 'Registros de inspeção, quantidade, embalagem e destino'],
      serviceNote: 'A LingYe coordena o fornecimento do projeto. Capacidade de carga, desempenho térmico e conformidade não podem ser inferidos apenas pelo perfil; defina os ensaios ou a análise de engenharia aplicáveis.',
      articleLabel: 'Consultar referências de extrusão e usinagem industrial',
    },
  },
  't-slot-profiles': {
    en: {
      title: 'T-Slot Aluminum Framing Profiles', metaTitle: 'T-Slot Aluminum Profiles and Connectors | LingYe',
      metaDescription: 'Select T-slot framing profiles and compatible connectors by series, slot opening, center spacing, load path, fasteners, and assembly drawings.',
      intro: 'A nominal profile size does not prove that two T-slot systems fit together. Verify the slot interface, series geometry, fasteners, and connection method before combining profiles or accessories.',
      checksTitle: 'Verify the T-slot system interface',
      checks: [
        { title: 'Series and slot geometry', description: 'Compare the slot opening, slot depth, center spacing, and outer section dimensions against the supplier drawing.' },
        { title: 'Connector and fastener fit', description: 'Specify slot nuts, T-bolts, brackets, joining plates, and access for installation. Confirm fit for the exact series rather than relying on a nominal 20/30/40 size.' },
        { title: 'Frame layout and loading', description: 'Share the frame drawing, unsupported spans, mounted equipment, and support points. A profile size alone does not establish frame rigidity.' },
        { title: 'Cutting and assembly scope', description: 'Clarify cut lengths, end machining, tapping, joining hardware, assembly, and packaging responsibilities.' },
      ],
      rfqTitle: 'T-slot profile and accessory RFQ checklist', rfqItems: ['Series drawing with slot and center dimensions', 'Frame layout and mounted-load information', 'Connector, nut, bolt, and bracket schedule', 'Cut lengths, drilling, tapping, or end machining', 'Finish, quantities, and sample-fit approval', 'Packaging, destination, and requested delivery basis'],
      serviceNote: 'A LingYe coordena o fornecimento de perfis e acessórios. Não se presume intercambiabilidade entre marcas; confirme a interface com desenhos ou uma amostra de encaixe.',
      articleLabel: 'Read the T-slot series and connector compatibility guide',
    },
    zh: {
      title: 'T型槽铝型材与框架系统', metaTitle: 'T型槽铝型材、连接件与配件选型 | 凌烨铝业',
      metaDescription: '按系列、槽口、中心距、受力路径、紧固件和装配图选择 T 型槽框架型材及配件。',
      intro: '型材标称尺寸相同，并不代表不同 T 型槽系统可以拼接。组合型材和配件前，应核对槽口接口、系列截面、紧固件及连接方式。',
      checksTitle: '先确认 T 型槽系统接口',
      checks: [
        { title: '系列与槽型尺寸', description: '根据供应商截面图比对槽口宽度、槽深、中心距和型材外形尺寸。' },
        { title: '连接件与紧固件适配', description: '明确 T 型螺母、T 型螺栓、角件、连接板和安装工具空间。应按具体系列确认，不要只凭 20/30/40 等标称规格判断。' },
        { title: '框架布局与载荷', description: '提供框架图、悬空跨度、安装设备及支撑点。仅凭型材规格无法确定框架刚度。' },
        { title: '切割与装配范围', description: '说明定尺切割、端部加工、攻牙、连接配件、装配和包装由哪一方负责。' },
      ],
      rfqTitle: 'T型槽型材及配件询价清单', rfqItems: ['包含槽口与中心尺寸的系列图', '框架布局及安装载荷信息', '连接件、螺母、螺栓和角件清单', '切割长度、钻孔、攻牙或端部加工', '表面处理、数量及试装确认', '包装、目的地和交付口径'],
      serviceNote: '凌烨可协调型材与配件采购。不默认不同品牌之间可以互换；请通过图纸或试装样件确认接口。',
      articleLabel: '阅读 T 型槽系列与连接件兼容指南',
    },
    es: {
      title: 'Perfiles estructurales de aluminio con ranura en T', metaTitle: 'Perfiles de aluminio con ranura en T y conectores | LingYe',
      metaDescription: 'Seleccione perfiles estructurales con ranura en T y conectores según serie, abertura, distancia entre centros, cargas y plano de montaje.',
      intro: 'Que dos perfiles tengan la misma medida nominal no significa que sus sistemas de ranura en T sean compatibles. Verifique la interfaz, la geometría de la serie, los fijadores y el método de unión.',
      checksTitle: 'Compruebe la interfaz del sistema T-slot',
      checks: [
        { title: 'Serie y geometría de la ranura', description: 'Compare abertura y profundidad de la ranura, distancia entre centros y dimensiones exteriores con el plano del proveedor.' },
        { title: 'Compatibilidad de conectores y fijaciones', description: 'Especifique tuercas de ranura, pernos en T, escuadras, placas y acceso de montaje. Confirme la serie exacta; no basta una medida nominal 20/30/40.' },
        { title: 'Diseño del bastidor y cargas', description: 'Comparta el plano, los tramos sin apoyo, los equipos montados y los puntos de soporte. El tamaño del perfil por sí solo no determina la rigidez.' },
        { title: 'Corte y montaje', description: 'Aclare longitudes, mecanizado de extremos, roscado, herrajes, montaje y embalaje incluidos.' },
      ],
      rfqTitle: 'Checklist RFQ de perfiles y accesorios T-slot', rfqItems: ['Plano de la serie con ranura y distancia entre centros', 'Diseño del bastidor e información de carga', 'Lista de conectores, tuercas, pernos y escuadras', 'Longitudes, taladrado, roscado o mecanizado', 'Acabado, cantidades y aprobación de montaje de muestra', 'Embalaje, destino y condiciones de entrega solicitadas'],
      serviceNote: 'LingYe coordina el suministro de perfiles y accesorios. No se presupone la intercambiabilidad entre marcas; confirme la interfaz con planos o una muestra de ajuste.',
      articleLabel: 'Leer la guía de compatibilidad de series y conectores T-slot',
    },
    pt: {
      title: 'Perfis estruturais de alumínio com ranhura em T', metaTitle: 'Perfis de alumínio com ranhura em T e conectores | LingYe',
      metaDescription: 'Selecione perfis estruturais com ranhura em T e conectores por série, abertura, distância entre centros, cargas e desenho de montagem.',
      intro: 'Perfis com a mesma dimensão nominal não necessariamente pertencem a sistemas T-slot compatíveis. Verifique a interface, a geometria da série, os fixadores e o método de união.',
      checksTitle: 'Confira a interface do sistema T-slot',
      checks: [
        { title: 'Série e geometria da ranhura', description: 'Compare abertura e profundidade da ranhura, distância entre centros e dimensões externas com o desenho do fornecedor.' },
        { title: 'Encaixe de conectores e fixadores', description: 'Especifique porcas para ranhura, parafusos T, cantoneiras, placas e acesso de montagem. Confirme a série exata, não apenas a medida nominal 20/30/40.' },
        { title: 'Layout da estrutura e cargas', description: 'Envie o desenho, vãos sem apoio, equipamentos montados e pontos de suporte. A dimensão do perfil, sozinha, não determina a rigidez.' },
        { title: 'Corte e montagem', description: 'Esclareça comprimentos, usinagem das extremidades, roscas, ferragens, montagem e embalagem incluídas.' },
      ],
      rfqTitle: 'Checklist RFQ de perfis e acessórios T-slot', rfqItems: ['Desenho da série com ranhura e distância entre centros', 'Layout da estrutura e dados de carga', 'Lista de conectores, porcas, parafusos e cantoneiras', 'Comprimentos, furação, roscas ou usinagem', 'Acabamento, quantidades e aprovação de montagem da amostra', 'Embalagem, destino e condições de entrega solicitadas'],
      serviceNote: 'A LingYe coordena o fornecimento de perfis e acessórios. Não se presume intercambiabilidade entre marcas; confirme a interface com desenhos ou uma amostra de encaixe.',
      articleLabel: 'Ler o guia de compatibilidade de séries e conectores T-slot',
    },
  },
  'standard-aluminium-profiles': {
    en: {
      title: 'Standard Aluminum Profiles: Sections and Specifications', metaTitle: 'Standard Aluminum Profile Sections | LingYe',
      metaDescription: 'Review common aluminum channel, angle, tube, and bar profiles by section dimensions, wall thickness, length, alloy, temper, and finish requirements.',
      intro: 'Standard section names are useful for shortlisting, but suppliers may interpret dimensions and tolerances differently. Put the exact section drawing, length, and acceptance requirements in the RFQ.',
      checksTitle: 'Specify the section, not just its trade name',
      checks: [
        { title: 'Section dimensions and wall thickness', description: 'State outside dimensions, wall thickness, corner radii where critical, and the datum used to measure the section.' },
        { title: 'Length and straightness', description: 'Specify cut length, allowable length variation, straightness, and end condition needed for the next fabrication step.' },
        { title: 'Alloy, temper, and use', description: 'Request the alloy and temper required by the application and confirm supporting supplier documentation; do not infer mechanical properties from appearance.' },
        { title: 'Finish and acceptance', description: 'Define mill finish or the requested coating/anodizing, visible quality, inspection method, and how samples will be approved.' },
      ],
      rfqTitle: 'Standard-section RFQ checklist', rfqItems: ['Dimensioned section sketch or drawing', 'Wall thickness and critical radii', 'Alloy, temper, and documentation required', 'Cut length, tolerance, and end condition', 'Surface treatment and appearance criteria', 'Quantity, packing, and destination'],
      serviceNote: 'LingYe coordinates supplier quotations. Confirm that the quoted section drawing, material documentation, finish, and acceptance criteria match the project before ordering.',
      articleLabel: 'Browse common aluminum profile sections',
    },
    zh: {
      title: '常用铝型材截面与规格', metaTitle: '常用铝型材截面与规格 | 凌烨铝业',
      metaDescription: '按截面尺寸、壁厚、长度、合金状态和表面要求核对常见槽铝、角铝、方管及扁条型材。',
      intro: '常用截面名称适合初步筛选，但不同供应商对尺寸和公差的理解可能不同。询价时应附准确截面图、长度和验收要求。',
      checksTitle: '按截面图确认，不只报商品名称',
      checks: [
        { title: '截面尺寸与壁厚', description: '标明外形尺寸、壁厚、关键圆角，以及截面尺寸的测量基准。' },
        { title: '长度与直线度', description: '注明定尺长度、长度偏差、直线度和端部状态，以满足后续加工装配。' },
        { title: '合金、状态与用途', description: '根据用途提出合金及状态要求，并确认供应商证明文件；不能凭外观判断力学性能。' },
        { title: '表面处理与验收', description: '明确本色或所需喷涂/氧化处理、可视质量、检验方法和样品确认方式。' },
      ],
      rfqTitle: '常用截面型材询价清单', rfqItems: ['标注尺寸的截面草图或图纸', '壁厚及关键圆角', '合金、状态及所需文件', '定尺长度、公差和端部要求', '表面处理与外观验收标准', '数量、包装和目的地'],
      serviceNote: '凌烨负责供应商报价协调。下单前请核对报价中的截面图、材料文件、表面要求和验收标准与项目一致。',
      articleLabel: '浏览常用铝型材截面',
    },
    es: {
      title: 'Perfiles estándar de aluminio: secciones y especificaciones', metaTitle: 'Perfiles estándar de aluminio | LingYe',
      metaDescription: 'Revise perfiles comunes en U, ángulo, tubo y barra según dimensiones, espesor, longitud, aleación, temple y acabado.',
      intro: 'Los nombres comerciales ayudan a filtrar opciones, pero cada proveedor puede interpretar de forma distinta las dimensiones y tolerancias. Incluya el plano exacto, la longitud y los criterios de aceptación en la RFQ.',
      checksTitle: 'Especifique la sección, no solo su nombre comercial',
      checks: [
        { title: 'Dimensiones y espesor de pared', description: 'Indique dimensiones exteriores, espesor, radios críticos y referencia de medición de la sección.' },
        { title: 'Longitud y rectitud', description: 'Defina longitud de corte, variación admisible, rectitud y condición de los extremos para la siguiente operación.' },
        { title: 'Aleación, temple y aplicación', description: 'Solicite la aleación y el temple adecuados al uso y confirme la documentación del proveedor; la apariencia no demuestra propiedades mecánicas.' },
        { title: 'Acabado y aceptación', description: 'Defina acabado de laminación o anodizado/pintura, calidad visible, método de inspección y aprobación de muestras.' },
      ],
      rfqTitle: 'Checklist RFQ para secciones estándar', rfqItems: ['Croquis o plano acotado de la sección', 'Espesor de pared y radios críticos', 'Aleación, temple y documentación requerida', 'Longitud de corte, tolerancia y extremos', 'Tratamiento superficial y criterios visuales', 'Cantidad, embalaje y destino'],
      serviceNote: 'LingYe coordina las ofertas de proveedores. Antes de pedir, confirme que el plano de sección, la documentación del material, el acabado y los criterios de aceptación coincidan con el proyecto.',
      articleLabel: 'Consultar secciones comunes de perfiles de aluminio',
    },
    pt: {
      title: 'Perfis padrão de alumínio: seções e especificações', metaTitle: 'Perfis padrão de alumínio | LingYe',
      metaDescription: 'Confira perfis comuns em U, cantoneiras, tubos e barras por dimensões, espessura, comprimento, liga, têmpera e acabamento.',
      intro: 'Os nomes comerciais ajudam na seleção inicial, mas fornecedores podem interpretar dimensões e tolerâncias de forma diferente. Inclua o desenho exato, o comprimento e os critérios de aceitação na RFQ.',
      checksTitle: 'Especifique a seção, não apenas o nome comercial',
      checks: [
        { title: 'Dimensões da seção e espessura', description: 'Informe dimensões externas, espessura da parede, raios críticos e a referência de medição da seção.' },
        { title: 'Comprimento e retilineidade', description: 'Defina comprimento de corte, variação admissível, retilineidade e condição das extremidades para a próxima etapa.' },
        { title: 'Liga, têmpera e aplicação', description: 'Solicite a liga e a têmpera adequadas à aplicação e confirme a documentação do fornecedor; a aparência não comprova propriedades mecânicas.' },
        { title: 'Acabamento e aceitação', description: 'Defina acabamento natural ou pintura/anodização, qualidade visual, método de inspeção e aprovação de amostras.' },
      ],
      rfqTitle: 'Checklist RFQ para seções padrão', rfqItems: ['Esboço ou desenho cotado da seção', 'Espessura da parede e raios críticos', 'Liga, têmpera e documentação necessária', 'Comprimento de corte, tolerância e extremidades', 'Tratamento superficial e critérios visuais', 'Quantidade, embalagem e destino'],
      serviceNote: 'A LingYe coordena as cotações com fornecedores. Antes do pedido, confirme se o desenho da seção, a documentação do material, o acabamento e os critérios de aceitação correspondem ao projeto.',
      articleLabel: 'Consultar seções comuns de perfis de alumínio',
    },
  },
};

export const getProductCategoryGuide = (slug: string, language: string): ProductCategoryGuide | null => {
  if (slug === 'windows-doors') return getWindowDoorGuide(language);
  const localized = categoryGuides[slug]?.[language] || categoryGuides[slug]?.en;
  if (!localized) return null;
  return {
    ...localized,
    articlePath: undefined,
    heroImageAlt: localized.title,
    heroImageNote: '',
  };
};

const categoryLabels: Record<string, Record<string, string>> = {
  'cabinet-profiles': {
    en: 'Cabinet & Wardrobe', zh: '柜体与衣柜', es: 'Muebles y armarios', pt: 'Móveis e armários',
  },
  'industrial-profiles': {
    en: 'Industrial Profiles', zh: '工业型材', es: 'Perfiles industriales', pt: 'Perfis industriais',
  },
  't-slot-profiles': {
    en: 'T-Slot Framing', zh: 'T型槽框架', es: 'Estructuras T-slot', pt: 'Estruturas T-slot',
  },
  'windows-doors': {
    en: 'Windows & Doors', zh: '门窗型材', es: 'Ventanas y puertas', pt: 'Janelas e portas',
  },
  'standard-aluminium-profiles': {
    en: 'Standard Profiles', zh: '标准型材', es: 'Perfiles estándar', pt: 'Perfis padrão',
  },
};

export const getProductCategoryLabel = (slug: string | undefined, language: string, fallback = ''): string =>
  (slug && (categoryLabels[slug]?.[language] || categoryLabels[slug]?.en)) || fallback;

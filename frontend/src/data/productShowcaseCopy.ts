export interface ProductShowcaseCopy {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  heroEyebrow: string;
  heroFacts: string[];
  heroImageAlt: string;
  productImageAlt: string;
  specificationsTitle: string;
  specifications: Array<{ label: string; value: string }>;
  servicesTitle: string;
  services: string[];
  finishesTitle: string;
  finishes: Array<{ title: string; note: string; description: string }>;
  applicationsTitle: string;
  applications: Array<{ title: string; detail: string }>;
  checklistTitle: string;
  checklist: string[];
  qualityImageAlt: string;
  coordinationTitle: string;
  steps: Array<{ title: string; description: string }>;
  supportEyebrow: string;
  supportTitle: string;
  supportDescription: string;
  supportBullets: string[];
  inquiryProductName: string;
}

const copy: Record<string, ProductShowcaseCopy> = {
  en: {
    title: 'Aluminum Window & Door Profile Systems',
    metaTitle: 'Aluminum Window and Door Profiles | Project Sourcing | LingYe',
    metaDescription: 'Review aluminum window and door profile systems by section drawing, glazing, hardware, thermal-break design, finish, and project scope. LingYe coordinates supplier sourcing.',
    intro: 'Window and facade systems must be reviewed as assemblies, not as isolated profile names. Share the sections, opening schedule, glazing and hardware interfaces so the sourcing scope can be checked against your project.',
    heroEyebrow: 'PROJECT-BASED WINDOW AND DOOR SYSTEMS',
    heroFacts: ['Drawing-based review', 'Supplier coordination', 'Export project support'],
    heroImageAlt: 'Aluminum window and door system reference',
    productImageAlt: 'Aluminum profile system application reference',
    specificationsTitle: 'Project Specifications to Confirm',
    specifications: [
      { label: 'Profile alloy and temper', value: 'Confirm against drawing or project specification' },
      { label: 'Section dimensions and wall thickness', value: 'Confirm for the selected profile and application' },
      { label: 'Thermal-break configuration', value: 'Select to match the specified system design' },
      { label: 'Hardware compatibility', value: 'Verify against the system and hardware drawings' },
    ],
    servicesTitle: 'Project Coordination',
    services: ['Review of drawings and opening schedules', 'Coordination of profile, finish, and processing requirements', 'Tooling or sample options confirmed during quotation', 'Order scope and export-document coordination'],
    finishesTitle: 'Surface Finishes and Textures',
    finishes: [
      { title: 'Anodizing', note: 'Project-confirmed', description: 'Confirm color, appearance, and coating requirements against the specification.' },
      { title: 'Powder coating', note: 'Project-confirmed', description: 'Specify the color reference, visible faces, and sample approval criteria.' },
      { title: 'PVDF coating', note: 'Project-confirmed', description: 'Confirm the coating system and performance requirements for the project.' },
      { title: 'Wood-grain transfer', note: 'Project-confirmed', description: 'Review available decorative references and approve a production sample.' },
    ],
    applicationsTitle: 'Window and Facade Applications',
    applications: [
      { title: 'Sliding doors', detail: 'Confirm opening size, panel arrangement, track, hardware, and finish.' },
      { title: 'Windows', detail: 'Review glazing, thermal-break details, and hardware interfaces by system.' },
      { title: 'Curtain walls', detail: 'Share elevations and project specifications for profile coordination.' },
      { title: 'Folding doors', detail: 'Confirm panel layout, hardware, and project-defined loading requirements.' },
    ],
    checklistTitle: 'Project Details to Include in an RFQ',
    checklist: ['Section drawings or opening schedule', 'Finish and appearance requirements', 'Hardware and glazing interfaces', 'Quantities, cut lengths, and destination'],
    qualityImageAlt: 'Aluminum profile quality-control inspection',
    coordinationTitle: 'How Project Coordination Works',
    steps: [
      { title: 'Share requirements', description: 'Provide drawings, dimensions, application, and estimated quantity.' },
      { title: 'Review profile needs', description: 'Check section geometry, system interfaces, alloy, and temper requirements.' },
      { title: 'Confirm finish options', description: 'Align color, surface appearance, and processing details to the project.' },
      { title: 'Review the quotation', description: 'Compare specification, quantity, packaging, and destination details.' },
      { title: 'Coordinate the order', description: 'Agree on order scope and export-document requirements.' },
    ],
    supportEyebrow: 'Custom Project Support',
    supportTitle: 'Discuss Your Window or Facade Requirements',
    supportDescription: 'Share a window schedule, facade elevation, section drawing, or reference. Profile configuration, finish, and system compatibility can then be reviewed against the project documents.',
    supportBullets: ['Drawing or schedule', 'Finish requirements', 'Quantity and destination'],
    inquiryProductName: 'Aluminum Window and Door Profile System',
  },
  zh: {
    title: '门窗与幕墙铝型材系统',
    metaTitle: '门窗与幕墙铝型材项目采购协调 | 凌烨铝业',
    metaDescription: '从截面图、玻璃、五金、隔热结构、表面处理和项目范围评估门窗铝型材系统。凌烨提供供应商采购协调。',
    intro: '门窗及幕墙系统应作为完整组件核对，而不是只看单根型材名称。请提供截面、门窗表、玻璃和五金接口资料，以便按项目要求核对采购范围。',
    heroEyebrow: '门窗与幕墙项目型材系统',
    heroFacts: ['按图纸核对', '供应商沟通协调', '出口项目支持'],
    heroImageAlt: '门窗铝型材系统参考图',
    productImageAlt: '铝型材系统应用参考图',
    specificationsTitle: '项目规格确认事项',
    specifications: [
      { label: '型材合金与状态', value: '依据图纸或项目规格确认' },
      { label: '截面尺寸与壁厚', value: '结合所选型材及应用确认' },
      { label: '隔热结构配置', value: '按指定系统设计选择' },
      { label: '五金兼容性', value: '对照系统图和五金图核验' },
    ],
    servicesTitle: '项目协调服务',
    services: ['图纸及门窗表核对', '型材、表面处理和加工要求沟通', '模具或样品方案在报价阶段确认', '订单范围及出口文件协调'],
    finishesTitle: '表面处理与纹理',
    finishes: [
      { title: '阳极氧化', note: '按项目确认', description: '依据规格确认颜色、外观和氧化要求。' },
      { title: '粉末喷涂', note: '按项目确认', description: '注明颜色参考、可视面及样品确认标准。' },
      { title: 'PVDF 涂层', note: '按项目确认', description: '按项目要求确认涂层体系及性能指标。' },
      { title: '木纹转印', note: '按项目确认', description: '核对可选纹理并确认生产样板。' },
    ],
    applicationsTitle: '门窗与幕墙应用',
    applications: [
      { title: '推拉门', detail: '确认洞口尺寸、扇型配置、轨道、五金和表面要求。' },
      { title: '窗系统', detail: '按系统核对玻璃、隔热结构和五金接口。' },
      { title: '幕墙', detail: '提供立面图和项目规格，以便协调型材要求。' },
      { title: '折叠门', detail: '确认扇型布局、五金及项目规定的荷载要求。' },
    ],
    checklistTitle: '询价时建议提供的项目资料',
    checklist: ['截面图或门窗表', '表面处理及外观要求', '五金和玻璃接口', '数量、定尺长度和目的地'],
    qualityImageAlt: '铝型材质量检验过程',
    coordinationTitle: '项目协调流程',
    steps: [
      { title: '提供需求', description: '提交图纸、尺寸、用途及预估数量。' },
      { title: '核对型材要求', description: '核对截面结构、系统接口、合金和状态要求。' },
      { title: '确认表面方案', description: '按项目对齐颜色、表面外观和加工细节。' },
      { title: '审核报价', description: '核对规格、数量、包装及目的地信息。' },
      { title: '协调订单', description: '确认订单范围和出口文件要求。' },
    ],
    supportEyebrow: '定制项目支持',
    supportTitle: '沟通您的门窗或幕墙需求',
    supportDescription: '请提供门窗表、幕墙立面图、截面图或参考资料，再依据项目文件核对型材配置、表面处理和系统兼容性。',
    supportBullets: ['图纸或门窗表', '表面处理要求', '数量与目的地'],
    inquiryProductName: '门窗铝型材系统',
  },
  es: {
    title: 'Sistemas de perfiles de aluminio para ventanas, puertas y fachadas',
    metaTitle: 'Perfiles de aluminio para ventanas y fachadas | LingYe',
    metaDescription: 'Revise sistemas de perfiles para ventanas y puertas según planos, vidrio, herrajes, rotura de puente térmico, acabado y alcance del proyecto.',
    intro: 'Los sistemas de ventanas y fachadas deben revisarse como conjuntos, no como perfiles aislados. Comparta secciones, cuadro de carpinterías e interfaces de vidrio y herrajes para comprobar el alcance de suministro.',
    heroEyebrow: 'SISTEMAS PARA PROYECTOS DE VENTANAS Y PUERTAS',
    heroFacts: ['Revisión basada en planos', 'Coordinación con proveedores', 'Apoyo a proyectos de exportación'],
    heroImageAlt: 'Referencia de un sistema de perfiles para ventanas y puertas',
    productImageAlt: 'Referencia de aplicación de un sistema de perfiles de aluminio',
    specificationsTitle: 'Especificaciones del proyecto por confirmar',
    specifications: [
      { label: 'Aleación y temple del perfil', value: 'Confirmar según plano o especificación del proyecto' },
      { label: 'Dimensiones y espesor de pared', value: 'Confirmar para el perfil y la aplicación seleccionados' },
      { label: 'Configuración de rotura térmica', value: 'Seleccionar según el diseño del sistema especificado' },
      { label: 'Compatibilidad de herrajes', value: 'Verificar con los planos del sistema y los herrajes' },
    ],
    servicesTitle: 'Coordinación del proyecto',
    services: ['Revisión de planos y cuadros de carpintería', 'Coordinación de perfiles, acabados y mecanizado', 'Opciones de matriz o muestras confirmadas durante la oferta', 'Coordinación del alcance del pedido y documentos de exportación'],
    finishesTitle: 'Acabados y texturas',
    finishes: [
      { title: 'Anodizado', note: 'A confirmar por proyecto', description: 'Confirme color, apariencia y requisitos del recubrimiento según la especificación.' },
      { title: 'Pintura en polvo', note: 'A confirmar por proyecto', description: 'Indique referencia de color, caras vistas y criterios de aprobación de muestras.' },
      { title: 'Recubrimiento PVDF', note: 'A confirmar por proyecto', description: 'Confirme el sistema de recubrimiento y los requisitos del proyecto.' },
      { title: 'Transferencia de acabado madera', note: 'A confirmar por proyecto', description: 'Revise las referencias decorativas disponibles y apruebe una muestra de producción.' },
    ],
    applicationsTitle: 'Aplicaciones en ventanas y fachadas',
    applications: [
      { title: 'Puertas correderas', detail: 'Confirme dimensiones del hueco, paneles, guía, herrajes y acabado.' },
      { title: 'Ventanas', detail: 'Revise acristalamiento, rotura térmica e interfaces de herrajes por sistema.' },
      { title: 'Muros cortina', detail: 'Comparta alzados y especificaciones para coordinar los perfiles.' },
      { title: 'Puertas plegables', detail: 'Confirme disposición de hojas, herrajes y cargas definidas por el proyecto.' },
    ],
    checklistTitle: 'Datos del proyecto para incluir en la RFQ',
    checklist: ['Planos de sección o cuadro de carpinterías', 'Requisitos de acabado y apariencia', 'Interfaces de herrajes y acristalamiento', 'Cantidades, longitudes de corte y destino'],
    qualityImageAlt: 'Inspección de calidad de perfiles de aluminio',
    coordinationTitle: 'Cómo coordinamos el proyecto',
    steps: [
      { title: 'Compartir requisitos', description: 'Envíe planos, dimensiones, aplicación y cantidad estimada.' },
      { title: 'Revisar los perfiles', description: 'Compruebe geometría, interfaces, aleación y temple requeridos.' },
      { title: 'Confirmar acabados', description: 'Alinee color, apariencia superficial y procesos con el proyecto.' },
      { title: 'Revisar la oferta', description: 'Compare especificación, cantidad, embalaje y destino.' },
      { title: 'Coordinar el pedido', description: 'Acuerde el alcance del pedido y los documentos de exportación.' },
    ],
    supportEyebrow: 'Apoyo para proyectos a medida',
    supportTitle: 'Comente sus requisitos de ventanas o fachada',
    supportDescription: 'Comparta un cuadro de carpinterías, alzado de fachada, plano de sección o referencia. Así podremos revisar la configuración, el acabado y la compatibilidad con los documentos del proyecto.',
    supportBullets: ['Plano o cuadro de carpinterías', 'Requisitos de acabado', 'Cantidad y destino'],
    inquiryProductName: 'Sistema de perfiles para ventanas y puertas',
  },
  pt: {
    title: 'Sistemas de perfis de alumínio para janelas, portas e fachadas',
    metaTitle: 'Perfis de alumínio para janelas e fachadas | LingYe',
    metaDescription: 'Avalie sistemas de perfis para janelas e portas com base em desenhos, vidro, ferragens, ruptura térmica, acabamento e escopo do projeto.',
    intro: 'Sistemas de janelas e fachadas devem ser analisados como conjuntos, não como perfis isolados. Envie seções, quadro de esquadrias e interfaces de vidro e ferragens para conferir o escopo de fornecimento.',
    heroEyebrow: 'SISTEMAS PARA PROJETOS DE JANELAS E PORTAS',
    heroFacts: ['Análise baseada em desenhos', 'Coordenação com fornecedores', 'Suporte a projetos de exportação'],
    heroImageAlt: 'Referência de sistema de perfis para janelas e portas',
    productImageAlt: 'Referência de aplicação de sistema de perfis de alumínio',
    specificationsTitle: 'Especificações do projeto a confirmar',
    specifications: [
      { label: 'Liga e têmpera do perfil', value: 'Confirmar conforme desenho ou especificação do projeto' },
      { label: 'Dimensões e espessura da parede', value: 'Confirmar para o perfil e a aplicação selecionados' },
      { label: 'Configuração da ruptura térmica', value: 'Selecionar conforme o projeto do sistema especificado' },
      { label: 'Compatibilidade das ferragens', value: 'Verificar com os desenhos do sistema e das ferragens' },
    ],
    servicesTitle: 'Coordenação do projeto',
    services: ['Análise de desenhos e quadro de esquadrias', 'Coordenação de perfis, acabamentos e usinagem', 'Opções de matriz ou amostras confirmadas durante a cotação', 'Coordenação do escopo do pedido e documentos de exportação'],
    finishesTitle: 'Acabamentos e texturas',
    finishes: [
      { title: 'Anodização', note: 'A confirmar por projeto', description: 'Confirme cor, aparência e requisitos do revestimento conforme a especificação.' },
      { title: 'Pintura eletrostática', note: 'A confirmar por projeto', description: 'Informe referência de cor, faces aparentes e critérios de aprovação da amostra.' },
      { title: 'Revestimento PVDF', note: 'A confirmar por projeto', description: 'Confirme o sistema de revestimento e os requisitos do projeto.' },
      { title: 'Transferência de padrão amadeirado', note: 'A confirmar por projeto', description: 'Confira as referências decorativas disponíveis e aprove uma amostra de produção.' },
    ],
    applicationsTitle: 'Aplicações em janelas e fachadas',
    applications: [
      { title: 'Portas de correr', detail: 'Confirme dimensões do vão, painéis, trilho, ferragens e acabamento.' },
      { title: 'Janelas', detail: 'Avalie envidraçamento, ruptura térmica e interfaces das ferragens por sistema.' },
      { title: 'Fachadas-cortina', detail: 'Envie elevações e especificações para coordenar os perfis.' },
      { title: 'Portas articuladas', detail: 'Confirme disposição dos painéis, ferragens e cargas definidas pelo projeto.' },
    ],
    checklistTitle: 'Dados para incluir na RFQ do projeto',
    checklist: ['Desenhos das seções ou quadro de esquadrias', 'Requisitos de acabamento e aparência', 'Interfaces das ferragens e do envidraçamento', 'Quantidades, comprimentos de corte e destino'],
    qualityImageAlt: 'Inspeção de qualidade de perfis de alumínio',
    coordinationTitle: 'Como coordenamos o projeto',
    steps: [
      { title: 'Compartilhe os requisitos', description: 'Envie desenhos, dimensões, aplicação e quantidade estimada.' },
      { title: 'Analise os perfis', description: 'Confira geometria, interfaces, liga e têmpera necessários.' },
      { title: 'Confirme os acabamentos', description: 'Alinhe cor, aparência superficial e processos ao projeto.' },
      { title: 'Revise a cotação', description: 'Compare especificação, quantidade, embalagem e destino.' },
      { title: 'Coordene o pedido', description: 'Acorde o escopo do pedido e os documentos de exportação.' },
    ],
    supportEyebrow: 'Suporte a projetos personalizados',
    supportTitle: 'Converse sobre suas necessidades de janelas ou fachada',
    supportDescription: 'Envie um quadro de esquadrias, elevação da fachada, desenho de seção ou referência. A configuração, o acabamento e a compatibilidade poderão ser analisados conforme os documentos do projeto.',
    supportBullets: ['Desenho ou quadro de esquadrias', 'Requisitos de acabamento', 'Quantidade e destino'],
    inquiryProductName: 'Sistema de perfis para janelas e portas',
  },
};

export const getProductShowcaseCopy = (language: string): ProductShowcaseCopy => copy[language] || copy.en;

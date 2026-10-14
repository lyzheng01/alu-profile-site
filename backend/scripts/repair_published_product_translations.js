const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'translations');
const shared = {
  es: {
    range_param: 'Dimensiones y tolerancias: según el plano y la especificación del proyecto.',
    surface_treatment: 'Acabado superficial: según la especificación del proyecto.',
    colors: 'Color: según la especificación del proyecto.',
    grade: 'Aleación y grado: según la especificación del proyecto.',
    temper: 'Temple: según la especificación del proyecto.',
  },
  pt: {
    range_param: 'Dimensões e tolerâncias: conforme os desenhos e a especificação do projeto.',
    surface_treatment: 'Acabamento superficial: conforme a especificação do projeto.',
    colors: 'Cor: conforme a especificação do projeto.',
    grade: 'Liga: conforme a especificação do projeto.',
    temper: 'Têmpera: conforme a especificação do projeto.',
  },
};

const products = {
  es: {
    1: {
      name: 'Perfiles de marco para puertas de vidrio de muebles',
      description: 'Perfiles de aluminio para puertas de vidrio de armarios y muebles. La sección y el acabado se seleccionan según el panel, los herrajes y el detalle de instalación.',
      features: 'Canal para alojar el vidrio; geometría del marco adaptada al panel y a los herrajes; acabado coordinado con el diseño interior.',
      applications: 'Puertas de muebles; frentes de armario; divisiones interiores.',
      specifications: 'Sección para paneles de vidrio; compatibilidad del panel y geometría del marco por confirmar según plano.',
    },
    2: {
      name: 'Perfiles de aluminio para armarios',
      description: 'Gama de perfiles de aluminio para puertas de armario y sistemas de almacenamiento interior. Las dimensiones finales y el ajuste del panel se confirman con el plano del proyecto.',
      features: 'Varias geometrías para puertas de armario; ajuste del panel, uniones y acabado coordinados con el diseño.',
      applications: 'Puertas de armario; sistemas de clóset; carpintería interior.',
      specifications: 'Sección y ajuste del panel por confirmar según plano; acabado superficial definido para cada proyecto.',
    },
    3: {
      name: 'Perfiles Gola para muebles sin tiradores',
      description: 'Canales de aluminio estilo Gola para diseños de muebles sin tiradores. Comparta la construcción del mueble para revisar la sección y la posición de montaje adecuadas.',
      features: 'Canal de agarre integrado; frente limpio sin tiradores; interfaz con el mueble y posición de instalación verificadas según plano.',
      applications: 'Muebles de cocina; tocadores de baño; mobiliario sin tiradores.',
      specifications: 'Geometría del canal, interfaz con el mueble y acabado por confirmar según plano.',
    },
    4: {
      name: 'Perfiles con tirador integrado para armarios',
      description: 'Perfiles de aluminio con tirador integrado para puertas de armarios y muebles. La selección depende del espesor de la puerta y de la disposición de los herrajes.',
      features: 'Agarre integrado; ajuste en el canto coordinado con el espesor del panel y los herrajes.',
      applications: 'Armarios corredizos; muebles con puertas abatibles; mobiliario a medida.',
      specifications: 'Espesor de puerta e interfaz del tirador por confirmar según plano; acabados disponibles bajo consulta.',
    },
    5: {
      name: 'Perfiles disipadores de calor de aluminio',
      description: 'Perfiles extruidos con aletas para conjuntos de gestión térmica. El rendimiento depende de la geometría final, la aleación, el flujo de aire y las condiciones de operación, por lo que debe validarse para cada diseño.',
      features: 'Geometría extendida de aletas para transferencia de calor; rendimiento térmico que debe validarse en el diseño completo.',
      applications: 'Electrónica de potencia; carcasas para LED; equipos de control.',
      specifications: 'Geometría de aletas, aleación, dimensiones y requisitos térmicos revisados según plano.',
    },
    6: {
      name: 'Perfiles de aluminio a medida con mecanizado CNC',
      description: 'Perfiles extruidos a medida con operaciones CNC secundarias planificadas según el plano recibido. La posición de las características y las tolerancias se confirman durante la revisión de la cotización.',
      features: 'Extrusión y mecanizado secundario planificados en conjunto; posiciones de agujeros e interfaces revisadas con los planos del cliente.',
      applications: 'Equipos de automatización; bastidores de máquinas; conjuntos a medida.',
      specifications: 'Sección extruida y detalles de mecanizado conforme al plano aprobado; tolerancias por acordar.',
    },
    7: {
      name: 'Perfiles de aluminio para carcasas y envolventes',
      description: 'Perfiles y carcasas de aluminio para equipos. Defina la distribución de la envolvente, las dimensiones de las interfaces y las condiciones ambientales antes de especificar el perfil.',
      features: 'Secciones para carcasas de equipos; interfaces de paneles y disposición definidas según el conjunto.',
      applications: 'Controles eléctricos; instrumentación; carcasas de equipos.',
      specifications: 'Dimensiones de la carcasa, interfaces y acabado por confirmar para cada proyecto.',
    },
    8: {
      name: 'Componentes de aluminio mecanizados por CNC',
      description: 'Componentes de aluminio mecanizados conforme al plano del cliente. El material y el acabado se revisan antes de confirmar el pedido.',
      features: 'Mecanizado basado en plano; dimensiones críticas y requisitos de acabado identificados antes de confirmar el pedido.',
      applications: 'Maquinaria industrial; dispositivos de fijación; componentes para equipos.',
      specifications: 'Material, dimensiones críticas, notas de mecanizado y acabado definidos en el plano.',
    },
    9: {
      name: 'Perfil de aluminio con ranura en T 20 × 20 mm',
      description: 'Perfil estructural de la serie 20, con sección nominal de 20 × 20 mm para estructuras modulares compactas. Verifique la ranura, los conectores y la compatibilidad de la serie con el plano elegido.',
      features: 'Formato compacto de la serie 20; abertura de ranura, familia de conectores y sección por verificar antes del montaje.',
      applications: 'Bastidores compactos; resguardos; bancos de trabajo; utillajes.',
      specifications: 'Serie nominal 20 × 20 mm; ranura y compatibilidad de accesorios según plano.',
    },
    10: {
      name: 'Perfil de aluminio con ranura en T 30 × 30 mm',
      description: 'Perfil de la serie 30, con sección nominal de 30 × 30 mm para estructuras modulares. Confirme el estándar de ranura y el sistema de conectores antes de combinar componentes.',
      features: 'Formato estructural de la serie 30; ranura y accesorios compatibles con el sistema seleccionado.',
      applications: 'Bastidores de equipos; estaciones de trabajo; envolventes de máquinas.',
      specifications: 'Serie nominal 30 × 30 mm; ranura y compatibilidad de accesorios según plano.',
    },
    11: {
      name: 'Perfil de aluminio con ranura en T 40 × 40 mm',
      description: 'Perfil de la serie 40, con sección nominal de 40 × 40 mm para estructuras modulares generales. La sección exacta, la abertura de ranura y las cargas requeridas se confirman según el plano elegido.',
      features: 'Sección modular de la serie 40; geometría final de ranura y adecuación estructural por validar para la aplicación.',
      applications: 'Bastidores de automatización; equipos de producción; estaciones de trabajo.',
      specifications: 'Serie nominal 40 × 40 mm; sección y requisitos de carga según plano.',
    },
    12: {
      name: 'Perfil de aluminio con ranura en T 45 × 45 mm',
      description: 'Perfil de la serie 45, con sección nominal de 45 × 45 mm para conjuntos modulares que requieren una sección mayor. Verifique la compatibilidad del sistema y el diseño estructural para la aplicación prevista.',
      features: 'Formato de la serie 45 para conjuntos modulares de mayor sección; herrajes y diseño estructural por verificar antes del uso.',
      applications: 'Bastidores de máquinas; resguardos de seguridad; estructuras modulares.',
      specifications: 'Serie nominal 45 × 45 mm; ranura y compatibilidad del sistema según plano.',
    },
  },
  pt: {
    1: {
      name: 'Perfis de quadro para portas de vidro de móveis',
      description: 'Perfis de alumínio para portas de vidro de armários e móveis. A seção e o acabamento são definidos conforme o painel, as ferragens e o detalhe de instalação.',
      features: 'Canal para encaixe do vidro; geometria do quadro compatível com o painel e as ferragens; acabamento alinhado ao projeto de interiores.',
      applications: 'Portas de móveis; frentes de armários; divisórias internas.',
      specifications: 'Seção para painéis de vidro; compatibilidade do painel e geometria do quadro a confirmar no desenho.',
    },
    2: {
      name: 'Perfis de alumínio para guarda-roupas',
      description: 'Linha de perfis de alumínio para portas de guarda-roupas e sistemas de armazenamento interno. As dimensões finais e o encaixe do painel são confirmados conforme o desenho do projeto.',
      features: 'Várias geometrias para portas de guarda-roupas; encaixe do painel, uniões e acabamento coordenados com o projeto.',
      applications: 'Portas de guarda-roupas; closets; marcenaria de interiores.',
      specifications: 'Seção do perfil e encaixe do painel a confirmar no desenho; acabamento definido para cada projeto.',
    },
    3: {
      name: 'Perfis Gola para armários sem puxador',
      description: 'Canais de alumínio estilo Gola para projetos de armários sem puxadores. Envie os detalhes construtivos do móvel para avaliar a seção e a posição de instalação adequadas.',
      features: 'Canal de pega embutido; visual limpo sem puxadores; interface com o móvel e posição de instalação verificadas no desenho.',
      applications: 'Armários de cozinha; gabinetes de banheiro; móveis sem puxador.',
      specifications: 'Geometria do canal, interface com o móvel e acabamento a confirmar conforme o desenho.',
    },
    4: {
      name: 'Perfis com puxador integrado para guarda-roupas',
      description: 'Perfis de alumínio com puxador integrado para portas de guarda-roupas e armários. A seleção considera a espessura da porta e a disposição das ferragens.',
      features: 'Pega integrada; encaixe na borda coordenado com a espessura do painel e as ferragens.',
      applications: 'Guarda-roupas de correr; armários com portas de abrir; móveis planejados.',
      specifications: 'Espessura da porta e interface do puxador a confirmar no desenho; acabamentos sob consulta.',
    },
    5: {
      name: 'Perfis dissipadores de calor de alumínio',
      description: 'Perfis extrudados com aletas para conjuntos de gerenciamento térmico. O desempenho depende da geometria final, da liga, do fluxo de ar e das condições de operação, devendo ser validado para cada projeto.',
      features: 'Geometria estendida de aletas para transferência de calor; desempenho térmico a validar no projeto completo.',
      applications: 'Eletrônica de potência; carcaças para LED; equipamentos de controle.',
      specifications: 'Geometria das aletas, liga, dimensões e requisitos térmicos revisados conforme o desenho.',
    },
    6: {
      name: 'Perfis de alumínio sob medida com usinagem CNC',
      description: 'Perfis extrudados sob medida com operações secundárias de usinagem CNC planejadas conforme o desenho recebido. A posição dos detalhes e as tolerâncias são confirmadas durante a análise da cotação.',
      features: 'Extrusão e usinagem secundária planejadas em conjunto; posições dos furos e interfaces revisadas nos desenhos do cliente.',
      applications: 'Equipamentos de automação; estruturas de máquinas; conjuntos sob medida.',
      specifications: 'Seção extrudada e detalhes de usinagem conforme desenho aprovado; tolerâncias a acordar.',
    },
    7: {
      name: 'Perfis de alumínio para carcaças e gabinetes',
      description: 'Perfis e carcaças de alumínio para equipamentos. Defina o layout do gabinete, as dimensões das interfaces e as condições ambientais antes de especificar o perfil.',
      features: 'Seções para carcaças de equipamentos; interfaces dos painéis e layout definidos conforme o conjunto.',
      applications: 'Controles elétricos; instrumentação; carcaças de equipamentos.',
      specifications: 'Dimensões da carcaça, interfaces e acabamento a confirmar para cada projeto.',
    },
    8: {
      name: 'Componentes de alumínio usinados em CNC',
      description: 'Componentes de alumínio usinados conforme o desenho do cliente. O material e o acabamento são revisados antes da confirmação do pedido.',
      features: 'Usinagem orientada pelo desenho; dimensões críticas e requisitos de acabamento identificados antes da confirmação do pedido.',
      applications: 'Máquinas industriais; dispositivos de fixação; componentes de equipamentos.',
      specifications: 'Material, dimensões críticas, notas de usinagem e acabamento definidos no desenho.',
    },
    9: {
      name: 'Perfil de alumínio com ranhura em T 20 × 20 mm',
      description: 'Perfil estrutural da série 20, com seção nominal de 20 × 20 mm para estruturas modulares compactas. Verifique a ranhura, os conectores e a compatibilidade da série conforme o desenho selecionado.',
      features: 'Formato compacto da série 20; abertura da ranhura, família de conectores e seção a verificar antes da montagem.',
      applications: 'Estruturas compactas; proteções; bancadas; dispositivos de montagem.',
      specifications: 'Série nominal 20 × 20 mm; ranhura e compatibilidade dos acessórios conforme o desenho.',
    },
    10: {
      name: 'Perfil de alumínio com ranhura em T 30 × 30 mm',
      description: 'Perfil da série 30, com seção nominal de 30 × 30 mm para estruturas modulares. Confirme o padrão da ranhura e o sistema de conectores antes de combinar componentes.',
      features: 'Formato estrutural da série 30; ranhura e acessórios compatíveis com o sistema selecionado.',
      applications: 'Estruturas de equipamentos; bancadas de trabalho; gabinetes de máquinas.',
      specifications: 'Série nominal 30 × 30 mm; ranhura e compatibilidade dos acessórios conforme o desenho.',
    },
    11: {
      name: 'Perfil de alumínio com ranhura em T 40 × 40 mm',
      description: 'Perfil da série 40, com seção nominal de 40 × 40 mm para estruturas modulares gerais. A seção exata, a abertura da ranhura e os requisitos de carga são confirmados conforme o desenho escolhido.',
      features: 'Seção modular da série 40; geometria final da ranhura e adequação estrutural a validar para a aplicação.',
      applications: 'Estruturas de automação; equipamentos de produção; bancadas de trabalho.',
      specifications: 'Série nominal 40 × 40 mm; seção e requisitos de carga conforme o desenho.',
    },
    12: {
      name: 'Perfil de alumínio com ranhura em T 45 × 45 mm',
      description: 'Perfil da série 45, com seção nominal de 45 × 45 mm para conjuntos modulares que exigem uma seção maior. Verifique a compatibilidade do sistema e o dimensionamento estrutural para a aplicação prevista.',
      features: 'Formato da série 45 para conjuntos modulares de seção maior; ferragens e dimensionamento estrutural a verificar antes do uso.',
      applications: 'Estruturas de máquinas; proteções de segurança; estruturas modulares.',
      specifications: 'Série nominal 45 × 45 mm; ranhura e compatibilidade do sistema conforme o desenho.',
    },
  },
};

const additionalProducts = {
  es: {
    13: {
      name: 'Perfiles de aluminio a medida para ventanas y puertas',
      description: 'Perfiles extruidos a medida para sistemas de ventanas y puertas. Envíe los planos de sección, las interfaces de herrajes, el acabado y el mercado de destino para revisar el ajuste.',
      features: 'Selección basada en planos; las interfaces de herrajes y los detalles de acristalamiento se revisan junto con la sección.',
      applications: 'Ventanas residenciales y comerciales; puertas; sistemas definidos para cada proyecto.',
      specifications: 'Dimensiones del sistema, interfaces de herrajes, aleación, temple y acabado según el plano.',
    },
    14: {
      name: 'Perfiles de aluminio para muro cortina',
      description: 'Perfiles extruidos para fachadas y sistemas de muro cortina. El diseño estructural, el acristalamiento, el drenaje y el cumplimiento normativo se deben revisar para cada proyecto.',
      features: 'Secciones definidas según el acristalamiento, el drenaje y las conexiones; la validación estructural depende del proyecto.',
      applications: 'Fachadas comerciales; muros cortina; cerramientos acristalados.',
      specifications: 'Sección, interfaz de acristalamiento, criterios estructurales y acabado según la documentación del proyecto.',
    },
    15: {
      name: 'Perfiles para ventanas y puertas en Sudamérica',
      description: 'Orientación para compradores que coordinan perfiles de ventanas y puertas para proyectos sudamericanos. La selección se basa en los planos del sistema y los requisitos aplicables del país de destino.',
      features: 'Coordinación de consultas según el mercado de destino, la serie local y los planos del cliente.',
      applications: 'Fabricantes de ventanas y puertas; distribuidores; proyectos de construcción en Sudamérica.',
      specifications: 'País, serie del sistema, dimensiones, herrajes y acabado por confirmar para cada proyecto.',
    },
    16: {
      name: 'Perfiles para ventanas y puertas en África',
      description: 'Orientación para consultas de perfiles de ventanas y puertas destinadas a mercados africanos. Indique el país, el plano del sistema, la cantidad y el acabado para revisar los requisitos.',
      features: 'Coordinación de consultas según el país, los detalles del sistema y los requisitos de acabado.',
      applications: 'Fabricantes de ventanas y puertas; distribuidores; proyectos de construcción en mercados africanos.',
      specifications: 'País, serie del sistema, dimensiones, herrajes y acabado por confirmar para cada proyecto.',
    },
    17: {
      name: 'Canal U de aluminio',
      description: 'Perfiles de aluminio en U para proteger bordes, formar marcos y realizar trabajos generales. Especifique las dimensiones exteriores, el espesor de pared, la aleación y el acabado.',
      features: 'Sección abierta en U para alojar bordes y guiar conjuntos; indique las dimensiones de las alas y la base junto con el espesor.',
      applications: 'Marcos; remates; guías; conjuntos fabricados.',
      specifications: 'Ancho de alas y base, espesor de pared, longitud, aleación y acabado según la especificación.',
    },
    18: {
      name: 'Perfil H de aluminio',
      description: 'Perfiles en H para unir o sostener paneles y secciones compatibles. Confirme las dimensiones de acoplamiento, el espesor de pared y la carga prevista antes de elegir.',
      features: 'Sección H de dos canales para unir paneles; adapte el espesor compatible y la profundidad de encaje al conjunto.',
      applications: 'Unión de paneles; divisiones; estructuras y trabajos de fabricación.',
      specifications: 'Dimensiones de la sección, espesor de pared, aleación y acabado según el plano.',
    },
    19: {
      name: 'Tubo cuadrado de aluminio',
      description: 'Perfiles huecos cuadrados de aluminio para fabricación y construcción de marcos. El espesor de pared, la aleación, el temple y la longitud de corte se seleccionan según la aplicación.',
      features: 'Sección hueca cerrada; especifique el tamaño exterior, el espesor de pared, la longitud y el estado del material requerido.',
      applications: 'Marcos; soportes; mobiliario; fabricación general.',
      specifications: 'Dimensiones exteriores, espesor de pared, longitud, aleación y temple según la especificación.',
    },
    20: {
      name: 'Barra plana de aluminio',
      description: 'Barra maciza de aluminio para soportes, separadores, tiras y trabajos generales. Confirme el ancho, el espesor, la longitud, el material y el acabado de cada pedido.',
      features: 'Sección rectangular maciza para piezas cortadas o fabricadas; el ancho y el espesor se definen según la aplicación.',
      applications: 'Soportes; separadores; remates; trabajos de taller.',
      specifications: 'Ancho, espesor, longitud, aleación, temple y acabado según la especificación.',
    },
  },
  pt: {
    13: {
      name: 'Perfis de alumínio extrudado sob medida para janelas e portas',
      description: 'Perfis extrudados sob medida para sistemas de janelas e portas. Envie os desenhos da seção, as interfaces das ferragens, o acabamento e o mercado de destino para análise de compatibilidade.',
      features: 'Seleção orientada por desenho; interfaces de ferragens e detalhes de envidraçamento analisados junto com a seção.',
      applications: 'Janelas residenciais e comerciais; portas; sistemas definidos para cada projeto.',
      specifications: 'Dimensões do sistema, interfaces de ferragens, liga, têmpera e acabamento conforme o desenho.',
    },
    14: {
      name: 'Perfis de alumínio para fachadas-cortina',
      description: 'Perfis extrudados para fachadas e sistemas de fachada-cortina. O projeto estrutural, o envidraçamento, a drenagem e o atendimento às normas locais precisam ser avaliados para cada projeto.',
      features: 'Seções definidas considerando envidraçamento, drenagem e conexões; a validação estrutural depende do projeto.',
      applications: 'Fachadas comerciais; fachadas-cortina; envoltórias envidraçadas.',
      specifications: 'Seção, interface do vidro, critérios estruturais e acabamento conforme os documentos do projeto.',
    },
    15: {
      name: 'Perfis para janelas e portas na América do Sul',
      description: 'Orientação para compradores que coordenam perfis de janelas e portas para projetos na América do Sul. A seleção considera os desenhos do sistema e os requisitos aplicáveis do país de destino.',
      features: 'Coordenação de consultas considerando o mercado de destino, a série local e os desenhos do cliente.',
      applications: 'Fabricantes de janelas e portas; distribuidores; projetos de construção na América do Sul.',
      specifications: 'País, série do sistema, dimensões, ferragens e acabamento a confirmar em cada projeto.',
    },
    16: {
      name: 'Perfis para janelas e portas em mercados africanos',
      description: 'Orientação para consultas de perfis de janelas e portas destinados a mercados africanos. Informe o país, o desenho do sistema, a quantidade e o acabamento para que os requisitos sejam analisados.',
      features: 'Coordenação de consultas considerando o país, os detalhes do sistema e os requisitos de acabamento.',
      applications: 'Fabricantes de janelas e portas; distribuidores; projetos de construção em mercados africanos.',
      specifications: 'País, série do sistema, dimensões, ferragens e acabamento a confirmar em cada projeto.',
    },
    17: {
      name: 'Perfil U de alumínio',
      description: 'Perfis de alumínio em U para proteção de bordas, estruturas e aplicações gerais de fabricação. Especifique as dimensões externas, a espessura da parede, a liga e o acabamento.',
      features: 'Seção aberta em U para encaixe de bordas e conjuntos guiados; informe as dimensões das abas e da base junto com a espessura.',
      applications: 'Estruturas; arremates; guias; conjuntos fabricados.',
      specifications: 'Largura das abas e da base, espessura da parede, comprimento, liga e acabamento conforme a especificação.',
    },
    18: {
      name: 'Perfil H de alumínio',
      description: 'Perfis em H para unir ou apoiar painéis e seções compatíveis. Confirme as dimensões de encaixe, a espessura da parede e a carga prevista antes da seleção.',
      features: 'Seção H com dois canais para união de painéis; compatibilidade de espessura e profundidade de encaixe definidas pelo conjunto.',
      applications: 'União de painéis; divisórias; estruturas e fabricação em geral.',
      specifications: 'Dimensões da seção, espessura da parede, liga e acabamento conforme o desenho.',
    },
    19: {
      name: 'Tubo quadrado de alumínio',
      description: 'Perfis ocos quadrados de alumínio para fabricação e montagem de estruturas. A espessura da parede, a liga, a têmpera e o comprimento de corte são definidos conforme a aplicação.',
      features: 'Seção quadrada oca; especifique dimensão externa, espessura da parede, comprimento de corte e condição do material.',
      applications: 'Estruturas; suportes; móveis; fabricação em geral.',
      specifications: 'Dimensões externas, espessura da parede, comprimento, liga e têmpera conforme a especificação.',
    },
    20: {
      name: 'Barra chata de alumínio',
      description: 'Barra maciça de alumínio para suportes, espaçadores, tiras e fabricação em geral. Confirme largura, espessura, comprimento, material e acabamento de cada pedido.',
      features: 'Seção retangular maciça para peças cortadas ou fabricadas; largura e espessura definidas conforme a aplicação.',
      applications: 'Suportes; espaçadores; arremates; fabricação em oficina.',
      specifications: 'Largura, espessura, comprimento, liga, têmpera e acabamento conforme a especificação.',
    },
  },
};

const currentSlugIds = {
  '2040-t-slot-aluminium-profile': 21,
  '2060-t-slot-aluminium-profile': 22,
  '3060-t-slot-aluminium-profile': 23,
  '4080-t-slot-aluminium-profile': 24,
  '5050-t-slot-aluminium-profile': 25,
  '6060-t-slot-aluminium-profile': 26,
  '8080-t-slot-aluminium-profile': 27,
  '9090-t-slot-aluminium-profile': 28,
  '90-degree-external-corner-bracket': 29,
  'three-way-connector': 30,
  'angle-bracket': 31,
  'flat-joining-plate': 32,
  't-slot-nut': 33,
  't-bolt': 34,
  'anchor-fastener-set': 35,
  'profile-end-cap': 36,
  'panel-fastener': 37,
  hinge: 38,
  'leveling-foot': 39,
  'caster-wheel': 40,
  'sliding-window-system': 41,
  'casement-window-system': 42,
  'thermal-break-window-system': 43,
  'sliding-door-system': 44,
  'folding-door-system': 45,
  'commercial-entrance-shopfront-system': 46,
};

for (const locale of ['es', 'pt']) {
  const file = path.join(dir, `product_${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [id, translation] of Object.entries(products[locale])) {
    const values = { ...translation, ...shared[locale], type_param: translation.name };
    for (const [field, value] of Object.entries(values)) data[`${field}_${id}`] = value;
  }
  for (const [id, translation] of Object.entries(additionalProducts[locale])) {
    const values = { ...translation, ...shared[locale], type_param: translation.name };
    for (const [field, value] of Object.entries(values)) data[`${field}_${id}`] = value;
  }
  for (const [slug, id] of Object.entries(currentSlugIds)) {
    const translation = data._catalog_by_slug?.[slug];
    if (!translation) throw new Error(`${locale} source is missing ${slug}`);
    for (const field of ['name', 'description', 'features', 'applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper']) {
      if (typeof translation[field] !== 'string' || !translation[field].trim()) throw new Error(`${locale}/${slug} is missing ${field}`);
      data[`${field}_${id}`] = translation[field];
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const zhFile = path.join(dir, 'product_zh.json');
const zhData = JSON.parse(fs.readFileSync(zhFile, 'utf8'));
for (const [slug, id] of Object.entries(currentSlugIds)) {
  const translation = zhData._catalog_by_slug?.[slug];
  if (!translation) throw new Error(`zh source is missing ${slug}`);
  for (const field of ['name', 'description', 'features', 'applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper']) {
    if (typeof translation[field] !== 'string' || !translation[field].trim()) throw new Error(`zh/${slug} is missing ${field}`);
    zhData[`${field}_${id}`] = translation[field];
  }
}
fs.writeFileSync(zhFile, `${JSON.stringify(zhData, null, 2)}\n`, 'utf8');

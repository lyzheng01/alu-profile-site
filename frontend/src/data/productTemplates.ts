/**
 * 产品模板系统
 * 包含按分类/子分类的产品通用信息模板
 * 避免每次调用API获取重复数据
 */

export interface ProductTemplate {
  // 模板标识
  categoryId?: number;
  categorySlug?: string;
  subcategoryId?: number;
  subcategorySlug?: string;
  
  // 通用参数（参考后端Product模型的参数字段）
  range_param?: string;
  type_param?: string;
  surface_treatment?: string;
  colors?: string;
  grade?: string;
  temper?: string;
  
  // 通用描述和内容
  defaultDescription?: string;
  defaultFeatures?: string;
  defaultApplications?: string;
  defaultSpecifications?: string;
  packagingDetails?: string;
  
  // 结构化数据
  specificationItems?: Array<{
    name: string;
    value: string;
    order: number;
  }>;
  
  featureItems?: Array<{
    name: string;
    description: string;
    order: number;
  }>;
  
  applicationItems?: Array<{
    name: string;
    description: string;
    image?: string; // 应用场景图片
    order: number;
  }>;
  
  // 商业信息
  oemAvailable?: boolean;
  freeSamples?: string;
  supplyAbility?: string;
  paymentTerms?: string;
  productOrigin?: string;
  shippingPort?: string;
  leadTime?: string;
  
  // 工厂图片（可以按分类展示不同的工厂场景）
  factoryImages?: Array<{
    title: string;
    description?: string;
    image: string;
    category?: string; // 工厂场景、质检、包装等
  }>;
}

/**
 * 产品模板数据库
 * 按分类/子分类组织
 */
export const productTemplates: Record<string, ProductTemplate> = {
  // T-Slot铝型材模板（工业铝型材）
  't-slot-aluminum-profiles': {
    categorySlug: 'industrial-aluminum-profiles',
    range_param: 'OEM factory supply aluminium profiles',
    type_param: 'T-Slot V-Slot Aluminium Profile',
    surface_treatment: 'Mill Finished, Anodized, Powder Coated, Electrophoresis, Wood Grain',
    colors: 'Silver, Champagne, Bronze, Golden, Black, Sand coating, Anodized Acid and alkali or Customized',
    grade: 'Alloy 6063-T5, 6061-T6',
    temper: 'T5, T6',
    
    defaultDescription: 'Our t slot profile v-slot adopts corrosion-resistant 6063-T5, 6061-T6 Aluminum Alloy with a clear anodize finish. Not only do our Slotted Aluminum Profiles come in a variety of standard lengths and sizes, we also offer cut to length services to better meet your projects specific needs.',
    
    specificationItems: [
      { name: 'Material & Temper', value: 'Alloy 6063-T5, 6061-T6, We will never use aluminum scrap.', order: 1 },
      { name: 'Surface Treatment', value: 'Mill-Finished, Anodizing, Powder Coating, Electrophoresis, Wood Grain, Polishing, Brushing, etc.', order: 2 },
      { name: 'Colour', value: 'Silver, Champage, Bronze, Golden, Black, Sand coating, Anodized Acid and alkali or Customized.', order: 3 },
      { name: 'Film Standard', value: 'Anodized:7-23 μ, Powder coating: 60-120 μ, Electrophoresis film: 12-25 μ.', order: 4 },
      { name: 'Lifetime', value: 'Anodized for 12-15 years outdoor, Powder coating for 18-20 years outdoor.', order: 5 },
      { name: 'MOQ', value: '500 kgs. Usually 10-12 tons for a 20\'FT; 20-23 tons for a 40HQ.', order: 6 },
      { name: 'Length', value: '5.8M or Customized.', order: 7 },
      { name: 'Thickness', value: '0.4mm-20mm or Customized.', order: 8 },
      { name: 'Application', value: 'Building and Construction and Decoration.', order: 9 },
      { name: 'Extrusion Machine', value: '600-3600 tons all together 6 extrusion lines.', order: 10 },
      { name: 'Capability', value: 'Output 1200 tons per month.', order: 11 },
      { name: 'New Moulds', value: 'Opening new mould about 7-10 days, absolutely moulds cost can be refund.', order: 12 },
      { name: 'Free Samples', value: 'Can be available all the time, about 1 days can be sent.', order: 13 },
      { name: 'Fabrication', value: 'Die designing→ Die making→ Smelting & alloying→ QC→ Extruding→ Cutting→ Heat Treatment→ QC→ Surface treatment→ QC→ Packing→ QC→ Shipping→ After Sale Service', order: 14 },
      { name: 'Deep Processing', value: 'CNC / Cutting / Punching / Checking / Tapping / Drilling / Milling', order: 15 },
      { name: 'Certification', value: 'ISO9001-2008/ISO 9001:2008; GB/T28001-2001(including all the standard of OHSAS18001:1999); GB/T24001-2004/ISO 14001:2004; GMC.', order: 16 },
      { name: 'Payment', value: 'T/T: 30% deposite, the balance will be paid before delivery; L/C: the balance irrevocable L/C at sight.', order: 17 },
      { name: 'Delivery time', value: '15 days production; If opening mould, plus 7-10 days.', order: 18 },
      { name: 'OEM', value: 'Available.', order: 19 },
    ],
    
    applicationItems: [
      {
        name: 'Factory assembly line',
        description: 'Ideal for building assembly line structures',
        order: 1
      },
      {
        name: 'Workstations and test stations',
        description: 'Perfect for workstations, test stations, and tables',
        order: 2
      },
      {
        name: 'Materials handling systems',
        description: 'Used in various materials handling systems',
        order: 3
      },
      {
        name: 'Machine bases and frames',
        description: 'Suitable for machine bases and frames',
        order: 4
      },
      {
        name: 'Equipment safety enclosures',
        description: 'Used in equipment safety enclosures and guard systems',
        order: 5
      },
      {
        name: 'Office and workshop furniture',
        description: 'Perfect for desks, cabinets, and storage units',
        order: 6
      }
    ],
    
    packagingDetails: 'PE film for each profile/ Shrink PE film for each bundle, Slot packing, Craft paper/ Foam Paper/Carton box',
    
    oemAvailable: true,
    freeSamples: 'Available, about 1 days can be sent',
    supplyAbility: '1200-1600 tons per month',
    paymentTerms: 'T/T, L/C',
    productOrigin: 'Foshan China',
    shippingPort: 'Shenzhen/Guangzhou/Foshan',
    leadTime: '7-15 Days',
    
    // 工厂图片（这些可以通过分类获取，也可以在这里定义）
    factoryImages: [
      {
        title: 'Factory Scene',
        description: 'Modern production facility',
        category: 'factory',
        image: '/images/factory/factory-scene.jpg'
      },
      {
        title: 'Production Process',
        description: 'Advanced extrusion process',
        category: 'production',
        image: '/images/factory/production-process.jpg'
      },
      {
        title: 'Quality Check',
        description: 'Strict quality inspection',
        category: 'quality',
        image: '/images/factory/quality-check.jpg'
      },
      {
        title: 'Packing',
        description: 'Professional packaging',
        category: 'packaging',
        image: '/images/factory/packing.jpg'
      }
    ]
  },
  
  // 门窗型材模板（建筑铝型材）
  'window-door-profiles': {
    categorySlug: 'building-profiles',
    subcategorySlug: 'window-door-profiles',
    range_param: 'OEM factory supply aluminium profiles',
    type_param: 'For door and window profiles',
    surface_treatment: 'Mill Finished, Anodized, Powder Coated, Electrohoresis, Wood Grain',
    colors: 'Silver, White, Black, Bronze, Champagne, Golden or customized',
    grade: '6063 Series',
    temper: 'T5, T6',
    
    specificationItems: [
      { name: 'Material & Temper', value: '6063-T5, 6063-T6 Aluminum Alloy', order: 1 },
      { name: 'Surface Treatment', value: 'Anodizing, Powder Coating, Wood Grain, Brushed', order: 2 },
      { name: 'Application', value: 'Residential and commercial windows and doors', order: 3 },
    ],
    
    applicationItems: [
      {
        name: 'Sliding Windows',
        description: 'For sliding window systems',
        order: 1
      },
      {
        name: 'Casement Windows',
        description: 'For casement window frames',
        order: 2
      },
      {
        name: 'Doors',
        description: 'For door frame systems',
        order: 3
      }
    ],
    
    oemAvailable: true,
    freeSamples: 'Available, about 1 days can be sent',
    productOrigin: 'Foshan China',
    shippingPort: 'Shenzhen/Guangzhou/Foshan',
  },
  
  // 默认模板（如果没有匹配的模板，使用这个）
  'default': {
    range_param: 'OEM factory supply aluminium profiles',
    type_param: 'Custom aluminum extrusion',
    surface_treatment: 'Mill Finished, Anodized, Powder Coated',
    colors: 'Silver, White, Black or customized',
    grade: '6063 Series',
    temper: 'T5, T6',
    oemAvailable: true,
    freeSamples: 'Available',
    productOrigin: 'Foshan China',
  }
};

/**
 * 根据产品信息获取匹配的模板
 */
export function getProductTemplate(product: {
  category?: { id?: number; slug?: string };
  subcategory?: { id?: number; slug?: string };
}): ProductTemplate {
  // 优先匹配子分类
  if (product.subcategory?.slug) {
    const subcategoryTemplate = productTemplates[product.subcategory.slug];
    if (subcategoryTemplate) return subcategoryTemplate;
  }
  
  // 其次匹配分类
  if (product.category?.slug) {
    const categoryTemplate = productTemplates[product.category.slug];
    if (categoryTemplate) return categoryTemplate;
  }
  
  // 使用默认模板
  return productTemplates['default'] || {};
}

/**
 * 合并产品数据和模板数据
 * 产品数据优先级高于模板数据
 */
export function mergeProductWithTemplate(
  product: any,
  template: ProductTemplate
): any {
  return {
    ...product,
    // 如果产品有自定义值，使用产品值；否则使用模板值
    range_param: product.range_param || template.range_param || '',
    type_param: product.type_param || template.type_param || '',
    surface_treatment: product.surface_treatment || template.surface_treatment || '',
    colors: product.colors || template.colors || '',
    grade: product.grade || template.grade || '',
    temper: product.temper || template.temper || '',
    
    // 描述和内容
    description: product.description || template.defaultDescription || '',
    features: product.features || template.defaultFeatures || '',
    applications: product.applications || template.defaultApplications || '',
    specifications: product.specifications || template.defaultSpecifications || '',
    
    // 结构化数据：如果产品有，使用产品的；否则使用模板的
    specification_items: product.specification_items?.length 
      ? product.specification_items 
      : template.specificationItems || [],
    
    feature_items: product.feature_items?.length
      ? product.feature_items
      : template.featureItems || [],
    
    application_items: product.application_items?.length
      ? product.application_items
      : template.applicationItems || [],
    
    // 扩展字段
    packaging_details: product.packaging_details || template.packagingDetails || '',
    oem_available: product.oem_available ?? template.oemAvailable ?? true,
    free_samples: product.free_samples || template.freeSamples || '',
    supply_ability: product.supply_ability || template.supplyAbility || '',
    payment_terms: product.payment_terms || template.paymentTerms || '',
    product_origin: product.product_origin || template.productOrigin || '',
    shipping_port: product.shipping_port || template.shippingPort || '',
    lead_time: product.lead_time || template.leadTime || '',
    
    // 工厂图片
    factory_images: product.factory_images || template.factoryImages || [],
  };
}


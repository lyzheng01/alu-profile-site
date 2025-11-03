import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { usePageTitle } from '../hooks/usePageTitle';

interface Product {
  id: number;
  name: string;
  description: string;
  category: {
    id: number;
    name: string;
  };
  subcategory?: {
    id: number;
    name: string;
  };
  features: string;
  applications: string;
  specifications: Record<string, any>;
  // Product parameter fields
  range_param: string;
  type_param: string;
  surface_treatment: string;
  colors: string;
  grade: string;
  temper: string;
  specification_items: Array<{
    id: number;
    name: string;
    value: string;
    order: number;
  }>;
  feature_items: Array<{
    id: number;
    name: string;
    description: string;
    order: number;
  }>;
  application_items: Array<{
    id: number;
    name: string;
    description: string;
    order: number;
  }>;
  images: Array<{
    id: number;
    image: string;
  }>;
  created_at: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('zh');

  // Get current language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'zh';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Set page title
  usePageTitle('products', product ? `${product.name} - Products` : undefined);

  // Get product details and related products
  useEffect(() => {
    const fetchProductAndRelated = async () => {
      if (!productId) return;
      
      try {
        // Get product details
        const productResponse = await fetch(`${API_ENDPOINTS.PRODUCTS}${productId}/?lang=${currentLanguage}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProduct(productData);
          
          // Get other products in the same category
          if (productData.category?.id) {
            const relatedResponse = await fetch(`${API_ENDPOINTS.PRODUCTS}?category=${productData.category.id}&lang=${currentLanguage}&limit=4`);
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              // Filter out current product
              const filteredRelated = relatedData.results?.filter((p: Product) => p.id !== productData.id) || [];
              setRelatedProducts(filteredRelated.slice(0, 4));
            }
          }
        } else {
          console.error('Product not found');
          navigate('/products');
        }
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [productId, currentLanguage, navigate]);


  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Product not found</p>
            <Link to="/products" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="pt-20">
      {/* Breadcrumb navigation */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/products" className="ml-4 text-gray-500 hover:text-gray-700">
                    Products
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-700">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Product title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-gray-600">
            Categories: All Product, {product.category.name}
          </p>
        </div>

        {/* Product images and basic information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product images */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <div>
                  {/* Main image */}
                  <div className="relative h-96 bg-gray-200">
                    <img
                      src={product.images[currentImageIndex].image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {product.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={image.image}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Product information - only includes product parameters */}
          <div>
            {/* Product parameters */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Parameters</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                
                <div className="p-6">
                  <div className="space-y-3">
                    {product.range_param && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Specification Range</span>
                        <span className="text-gray-900 text-right flex-1">{product.range_param}</span>
                      </div>
                    )}
                    {product.type_param && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Product Type</span>
                        <span className="text-gray-900 text-right flex-1">{product.type_param}</span>
                      </div>
                    )}
                    {product.surface_treatment && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Surface Treatment</span>
                        <span className="text-gray-900 text-right flex-1">{product.surface_treatment}</span>
                      </div>
                    )}
                    {product.colors && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Color Specification</span>
                        <span className="text-gray-900 text-right flex-1">{product.colors}</span>
                      </div>
                    )}
                    {product.grade && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Quality Grade</span>
                        <span className="text-gray-900 text-right flex-1">{product.grade}</span>
                      </div>
                    )}
                    {product.temper && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">Temper State</span>
                        <span className="text-gray-900 text-right flex-1">{product.temper}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* If no parameter data, show prompt */}
                  {!product.range_param && !product.type_param && !product.surface_treatment && !product.colors && !product.grade && !product.temper && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">No product parameter information</p>
                      <p className="text-gray-400 text-sm mt-1">Please contact us for detailed technical specifications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Product description - full width display */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">PRODUCT DESCRIPTION</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Product features */}
        {product.features && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Features</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              
              <div className="p-6">
                {(() => {
                  try {
                    let featuresData;
                    if (typeof product.features === 'string') {
                      // Try to parse JSON
                      featuresData = JSON.parse(product.features);
                    } else {
                      featuresData = product.features;
                    }
                    
                    if (Array.isArray(featuresData) && featuresData.length > 0) {
                      return (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Specification Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Specification Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {featuresData.map((feature, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                {Object.entries(feature).map(([key, value], cellIndex) => (
                                  <React.Fragment key={cellIndex}>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <div className="flex items-center">
                                        <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {key}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {String(value)}
                                    </td>
                                  </React.Fragment>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    } else {
                      return (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-lg">No product feature data</p>
                        </div>
                      );
                    }
                  } catch (e) {
                    console.error('Failed to parse Features data:', e);
                    return (
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap text-gray-600">{String(product.features)}</pre>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Technical specifications */}
        {product.specifications && product.specifications.trim() && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              
              <div className="p-6">
                <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">{String(product.specifications)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Application areas */}
        {product.applications && product.applications.trim() && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Applications</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              
              <div className="p-6">
                <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">{String(product.applications)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Product display images */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">PRODUCT DISPLAY</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6">
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-[400px] object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No product display images</p>
                  <p className="text-gray-400 text-sm mt-1">Please contact us for product images</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Company background information */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">COMPANY BACKGROUND</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Factory scene */}
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Factory Scene</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">FACTORY SCENE</h3>
            </div>

            {/* Production process */}
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Production Process</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">PRODUCTION PROCESS</h3>
            </div>

            {/* Quality inspection */}
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Quality Check</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">QUALITY CHECK</h3>
            </div>

            {/* Packaging */}
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Packing</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">PACKING</h3>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0].image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-gray-500 text-sm">No Image</p>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${relatedProduct.id}`}
                        className="flex-1 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors text-center"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating contact buttons */}
      <FloatingContactButtons />
    </div>
  );
};

export default ProductDetail;

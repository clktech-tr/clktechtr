import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/types";
import { useTranslation } from "react-i18next";
import { OrderForm } from "@/components/order/order-form";
type LangMap = { en: string; tr: string };
function getLangField(field: string | LangMap, lang: string): string {
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && (lang in field)) return field[lang as keyof LangMap] || field.en;
  return field.en;
}

function safeParse(val: any, fallback = {}) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return val || fallback;
}

export default function Products() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  // useQuery ile ürünleri çek ve kategorileri hesapla
  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });
  const rawCategories = Array.from(new Set(products.map(p => p.category)));
  const categories = [null, ...rawCategories]; // null = All
  
  // Arama ve filtreleme işlemlerinde aktif dildeki alanları kullan
  const filteredProducts = products.filter(product => {
    const name = getLangField(product.name, lang);
    const description = getLangField(product.description, lang);
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("products.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 clk-bg-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold clk-text-black mb-4">
            {t("products.title")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("products.subtitle")}
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t("products.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category ?? 'all'}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? "bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200" : "btn-secondary"}
                    >
                      {category === null ? t("products.allCategory") : category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold clk-text-black mb-2">{t("products.noProducts")}</h3>
            <p className="text-gray-600">{t("products.noProductsDesc")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const nameObj = safeParse(product.name, { tr: '', en: '' });
              const priceObj = safeParse(product.price, { tr: '', en: '' });
              const parsedProduct = {
                ...product,
                id: product.id,
                productId: product.id,
                productName: nameObj.tr || nameObj.en || '',
                price: {
                  tr: priceObj.tr || '',
                  en: priceObj.en || ''
                },
                name: nameObj,
                description: safeParse(product.description, { tr: '', en: '' }),
                fullDescription: safeParse(product.fullDescription, { tr: '', en: '' }),
              };
              return (
                <ProductCard
                  key={product.id}
                  product={parsedProduct}
                  onOrderClick={() => {
                    setSelectedProduct(parsedProduct);
                    setIsOrderOpen(true);
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 text-center text-gray-600">
          <p>
            {t("products.showing", { count: filteredProducts.length, total: products.length })}
            {selectedCategory !== null && ` ${t("products.inCategory", { category: selectedCategory })}`}
          </p>
        </div>
      </div>
      {/* Order Form Dialog */}
      <OrderForm
        product={selectedProduct}
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
      />
    </div>
  );
}

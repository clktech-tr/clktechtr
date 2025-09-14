import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OrderForm } from "@/components/order/order-form";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Product as ProductBase } from "@shared/types";
import { useTranslation } from "react-i18next";
type LangMap = { en: string; tr: string };
function getLangField(field: string | LangMap, lang: string): string {
  if (typeof field === 'string' || typeof field === 'number') return String(field);
  if (typeof field === 'object' && field !== null && (lang in field)) return String(field[lang as keyof LangMap] || field.en);
  return field && typeof (field as any).en !== 'undefined' ? String((field as any).en) : '';
}
function safeParseObj(val: any) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}
export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const { id } = useParams();
  const [showOrderForm, setShowOrderForm] = useState(false);

  const { data: product, isLoading } = useQuery<ProductBase>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });
  
  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("productDetail.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold clk-text-black mb-4">{t("productDetail.notFoundTitle")}</h1>
            <p className="text-gray-600 mb-8">{t("productDetail.notFoundDesc")}</p>
            <Link to="/products">
              <Button className="btn-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("productDetail.backToProducts")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const productTyped: any = product;
  const name = safeParseObj(productTyped.name);
  const description = safeParseObj(productTyped.description);
  const fullDescription = safeParseObj(productTyped.fullDescription);
  const price = safeParseObj(productTyped.price);
  const specs = product.specs ? JSON.parse(product.specs) : {};
  const externalLinks = product.externalLinks ? JSON.parse(product.externalLinks) : {};

  return (
    <div className="min-h-screen py-20 clk-bg-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-orange-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("productDetail.backToProducts")}
          </Link>
        </div>

        {/* Product Detail */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div>
                <img
                  src={productTyped.image}
                  alt={getLangField(name, lang)}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              {/* Product Info */}
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold clk-text-black mb-4">{getLangField(name, lang)}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl font-bold clk-text-orange">{getLangField(price, lang)} {lang === 'tr' ? '₺' : '$'}</span>
                    <Badge className={productTyped.inStock ? "product-badge" : "bg-red-500"}>
                      {productTyped.inStock ? t("productDetail.inStock") : t("productDetail.outOfStock")}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-lg">{getLangField(description, lang)}</p>
                </div>

                {/* Technical Specifications */}
                <div className="tech-spec p-6 rounded-lg mb-8">
                  <h3 className="text-xl font-semibold clk-text-black mb-4">{t("productDetail.techSpecs")}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-gray-600">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold clk-text-black mb-4">{t("productDetail.details")}</h3>
                  <p className="text-gray-600 leading-relaxed">{getLangField(fullDescription, lang)}</p>
                </div>

                {/* Purchase Options */}
                <div className="space-y-4">
                  {settings?.havale !== false && (
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200 w-full py-4 text-lg"
                      onClick={() => setShowOrderForm(true)}
                      disabled={!productTyped.inStock}
                    >
                      {t("productDetail.buyBankTransfer")}
                    </Button>
                  )}

                  {Object.keys(externalLinks).length > 0 && settings?.harici !== false && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">{t("productDetail.alsoAvailable")}</h4>
                      <div className="grid gap-2">
                        {Object.entries(externalLinks).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="outline"
                            size="sm"
                            className="btn-secondary justify-start"
                            asChild
                          >
                            <a href={url as string} target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-gray-700 hover:text-gray-900 transition-colors duration-200">
                              {t("productDetail.buyFrom", { platform })}
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200 w-full py-4 text-lg mt-4"
                    asChild
                  >
                    <Link to="/contact" className="flex items-center justify-center w-full">
                      {t("productDetail.contactUs")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OrderForm
        product={{
          ...productTyped,
          name: getLangField(name, lang),
          price: getLangField(price, lang),
        }}
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
      />
    </div>
  );
}

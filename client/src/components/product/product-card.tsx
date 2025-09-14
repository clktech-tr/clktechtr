import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Product as ProductBase } from "@shared/types";
import { useTranslation } from "react-i18next";

type LangMap = { en: string; tr: string };
function getLangField(field: string | LangMap, lang: string): string {
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && (lang in field)) return field[lang as keyof LangMap] || field.en;
  return field.en;
}
function safeParseObj(val: any) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}
export function ProductCard({ product, onOrderClick }: { product: any, onOrderClick?: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const name = safeParseObj(product.name);
  const description = safeParseObj(product.description);
  const price = safeParseObj(product.price);
  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card className="card-hover bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105">
        <div className="relative">
          <img
            src={product.image}
            alt={getLangField(name, lang)}
            className="w-full h-60 object-contain rounded-t"
            style={{ background: "#f9fafb" }}
          />
          <Badge className="product-badge absolute top-4 right-4">
            {product.inStock ? t("productCard.inStock") : t("productCard.outOfStock")}
          </Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="text-base font-semibold clk-text-black mb-0.5">{getLangField(name, lang)}</h3>
          <p className="text-gray-600 mb-2 text-sm">{getLangField(description, lang)}</p>
          <div className="flex flex-row items-center justify-between gap-2 mt-2">
            <span className="text-sm text-orange-500 hover:text-orange-600 transition-colors">{t("productCard.viewDetails")}</span>
            <span className="text-2xl font-bold clk-text-orange ml-4">{getLangField(price, lang)} {lang === 'tr' ? '₺' : '$'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

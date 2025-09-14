import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import type { Product } from "@shared/types";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface AdminProductsProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

function getLangField(field: any, lang: string): string {
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (typeof parsed === 'object' && parsed !== null) {
        return String(parsed[lang] || parsed.en || '');
      }
    } catch {
      return String(field);
    }
  }
  if (typeof field === 'number') return String(field);
  if (typeof field === 'object' && field !== null && (lang in field)) return String(field[lang] || field.en);
  return field && typeof field.en !== 'undefined' ? String(field.en) : '';
}

export function AdminProducts({ onAddProduct, onEditProduct, onDeleteProduct }: AdminProductsProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  
  const { data: products = [], refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => fetch("/api/products").then(res => res.json()),
  });

  // Kategori listesi
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filtrelenmiş ürünler
  const filtered = products.filter(p => {
    const name = getLangField(p.name, lang).toLowerCase();
    const desc = getLangField(p.description, lang).toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  // Stok güncelleme
  async function toggleStock(product: Product) {
    const token = localStorage.getItem("admin_token");
    await fetch(`/api/admin/products/${product.id}`,
      {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: JSON.stringify({ inStock: !product.inStock })
      });
    refetch();
  }

  return (
    <div className="space-y-8">
      {/* Product Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ürün Yönetimi</CardTitle>
            <Button onClick={onAddProduct} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Ürün Ekle
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <input
              type="text"
              placeholder="Ürün adı veya açıklama ara..."
              className="border rounded px-3 py-1"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="border rounded px-3 py-1"
              value={category || ""}
              onChange={e => setCategory(e.target.value || null)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={String(product.image)}
                    alt={getLangField(product.name, lang)}
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => setPreviewImg(String(product.image))}
                  />
                  <div>
                    <h3 className="font-semibold">{getLangField(product.name, lang)}</h3>
                    <p className="text-sm text-gray-600">{getLangField(product.price, lang)} {lang === 'tr' ? '₺' : '$'}</p>
                    <Badge variant={product.inStock ? "default" : "destructive"} className="cursor-pointer" onClick={() => toggleStock(product)}>
                      {product.inStock ? "Stokta" : "Stokta Yok"}
                    </Badge>
                    <span className="ml-2 text-xs text-gray-400">({product.category})</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" onClick={(e) => e.stopPropagation()} />
                    <span>Düzenle</span>
                  </Button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log("Delete button clicked for product ID:", product.id);
                      onDeleteProduct(product.id);
                      return false;
                    }}
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Görsel önizleme modalı */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setPreviewImg(null)}>&times;</button>
            <img src={previewImg} alt="Ürün görseli" className="max-w-md max-h-[60vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductForm } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/types";
import { z } from "zod";
import { useEffect } from "react";

const productFormSchema = z.object({
  name: z.object({ tr: z.string().min(2), en: z.string().min(2) }),
  slug: z.string().min(2),
  description: z.object({ tr: z.string().min(2), en: z.string().min(2) }),
  fullDescription: z.object({ tr: z.string().min(2), en: z.string().min(2) }),
  price: z.object({ tr: z.string().min(1), en: z.string().min(1) }),
  image: z.string().optional(),
  imageFile: z.any().optional(),
  category: z.string().min(2),
  inStock: z.boolean(),
  specs: z.string().optional(),
  externalLinks: z.string().optional(),
});
type ProductFormData = ProductForm & { imageFile?: FileList };

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductForm({ product, isOpen, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || { tr: "", en: "" },
      slug: product?.slug || "",
      description: product?.description || { tr: "", en: "" },
      fullDescription: product?.fullDescription || { tr: "", en: "" },
      price: product?.price || { tr: "", en: "" },
      image: product?.image || "",
      category: product?.category || "",
      inStock: product?.inStock ?? true,
      specs: product?.specs || JSON.stringify({
        microcontroller: "",
        flash: "",
        ram: "",
        voltage: "",
        digital_io: "",
        analog_inputs: ""
      }),
      externalLinks: product?.externalLinks || JSON.stringify({
        "Etsy": "",
        "N11": "",
        "Trendyol": ""
      }),
    },
  });

  useEffect(() => {
    if (isOpen && product) {
      form.reset({
        name: product.name || { tr: "", en: "" },
        slug: product.slug || "",
        description: product.description || { tr: "", en: "" },
        fullDescription: product.fullDescription || { tr: "", en: "" },
        price: product.price || { tr: "", en: "" },
        image: product.image || "",
        category: product.category || "",
        inStock: product.inStock ?? true,
        specs: product.specs || JSON.stringify({
          microcontroller: "",
          flash: "",
          ram: "",
          voltage: "",
          digital_io: "",
          analog_inputs: ""
        }),
        externalLinks: product.externalLinks || JSON.stringify({
          "Etsy": "",
          "N11": "",
          "Trendyol": ""
        }),
      });
    }
    if (isOpen && !product) {
      form.reset({
        name: { tr: "", en: "" },
        slug: "",
        description: { tr: "", en: "" },
        fullDescription: { tr: "", en: "" },
        price: { tr: "", en: "" },
        image: "",
        category: "",
        inStock: true,
        specs: JSON.stringify({
          microcontroller: "",
          flash: "",
          ram: "",
          voltage: "",
          digital_io: "",
          analog_inputs: ""
        }),
        externalLinks: JSON.stringify({
          "Etsy": "",
          "N11": "",
          "Trendyol": ""
        }),
      });
    }
  }, [isOpen, product, form]);

  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Form verilerini konsola yazdır (debug için)
      console.log("Form data before processing:", data);
      
      const formData = new FormData();
      
      // Slug alanını kontrol et ve boşsa otomatik oluştur
      if (!data.slug || data.slug.trim() === "") {
        // İngilizce ürün adından slug oluştur
        const slugBase = data.name.en.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        data.slug = slugBase || "product-" + Date.now(); // Fallback
      }
      
      // Append all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === "imageFile" && value instanceof FileList && value.length > 0) {
          formData.append("image", value[0]);
        } else if (key === "inStock") {
          // inStock'u boolean olarak ekle
          formData.append("inStock", String(value === true || value === "true"));
        } else if (["name", "description", "fullDescription", "price"].includes(key)) {
          // Multilingual alanları JSON olarak ekle
          formData.append(key, JSON.stringify(value));
        } else if (["specs", "externalLinks"].includes(key)) {
          try {
            // Eğer zaten JSON string ise parse edip tekrar stringify yapalım
            const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
            formData.append(key, JSON.stringify(parsedValue));
          } catch (e) {
            // Parse edilemezse boş nesne olarak ekle
            formData.append(key, JSON.stringify({}));
          }
        } else if (key !== "imageFile") {
          formData.append(key, String(value));
        }
      });
      
      // FormData içeriğini konsola yazdır (debug için)
      console.log("FormData entries:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const url = isEditing ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const headersObj = (() => {
        const token = localStorage.getItem("admin_token");
        if (token) return { Authorization: `Bearer ${token}` };
        return undefined;
      })();
      const response = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
        ...(headersObj ? { headers: headersObj } : {}),
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Product Updated" : "Product Created",
        description: `Product has been ${isEditing ? "updated" : "created"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} product. ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    productMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold clk-text-black">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Product Name (TR)</Label>
              <Input
                id="name.tr"
                {...form.register("name.tr")}
                className="mt-1"
              />
              <Label className="mt-2">Product Name (EN)</Label>
              <Input
                id="name.en"
                {...form.register("name.en")}
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {(form.formState.errors.name as any)?.tr?.message || (form.formState.errors.name as any)?.en?.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="slug">Product Slug (URL-friendly)</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                className="mt-1"
                placeholder="product-name"
              />
              {form.formState.errors.slug && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>
            <div>
              <Label>Price (₺ - TR)</Label>
              <Input
                id="price.tr"
                {...form.register("price.tr")}
                className="mt-1"
                type="number"
                step="0.01"
              />
              <Label className="mt-2">Price ($ - EN)</Label>
              <Input
                id="price.en"
                {...form.register("price.en")}
                className="mt-1"
                type="number"
                step="0.01"
              />
              {form.formState.errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {(form.formState.errors.price as any)?.tr?.message || (form.formState.errors.price as any)?.en?.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label>Short Description (TR)</Label>
            <Textarea
              id="description.tr"
              {...form.register("description.tr")}
              rows={2}
              className="mt-1"
            />
            <Label className="mt-2">Short Description (EN)</Label>
            <Textarea
              id="description.en"
              {...form.register("description.en")}
              rows={2}
              className="mt-1"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {(form.formState.errors.description as any)?.tr?.message || (form.formState.errors.description as any)?.en?.message}
              </p>
            )}
          </div>
          <div>
            <Label>Full Description (TR)</Label>
            <Textarea
              id="fullDescription.tr"
              {...form.register("fullDescription.tr")}
              rows={3}
              className="mt-1"
            />
            <Label className="mt-2">Full Description (EN)</Label>
            <Textarea
              id="fullDescription.en"
              {...form.register("fullDescription.en")}
              rows={3}
              className="mt-1"
            />
            {form.formState.errors.fullDescription && (
              <p className="text-red-500 text-sm mt-1">
                {(form.formState.errors.fullDescription as any)?.tr?.message || (form.formState.errors.fullDescription as any)?.en?.message}
              </p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...form.register("category")}
                className="mt-1"
              />
              {form.formState.errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="imageFile">Product Image</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                {...form.register("imageFile")}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="specs">Technical Specifications (JSON)</Label>
            <Textarea
              id="specs"
              {...form.register("specs", {
                setValueAs: (value) => {
                  try {
                    // Boş değer kontrolü
                    if (!value || value.trim() === "") {
                      return JSON.stringify({});
                    }
                    // JSON formatını doğrula ve düzgün formatta döndür
                    const parsed = JSON.parse(value);
                    return JSON.stringify(parsed);
                  } catch (e) {
                    // Geçersiz JSON ise boş nesne döndür
                    return JSON.stringify({});
                  }
                }
              })}
              rows={6}
              className="mt-1 font-mono text-sm"
              placeholder='{"microcontroller": "ARM Cortex-M4", "flash": "256KB", "ram": "64KB"}'
            />
            {form.formState.errors.specs && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.specs.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="externalLinks">External Store Links (JSON)</Label>
            <Textarea
              id="externalLinks"
              {...form.register("externalLinks", {
                setValueAs: (value) => {
                  try {
                    // Boş değer kontrolü
                    if (!value || value.trim() === "") {
                      return JSON.stringify({});
                    }
                    // JSON formatını doğrula ve düzgün formatta döndür
                    const parsed = JSON.parse(value);
                    return JSON.stringify(parsed);
                  } catch (e) {
                    // Geçersiz JSON ise boş nesne döndür
                    return JSON.stringify({});
                  }
                }
              })}
              rows={4}
              className="mt-1 font-mono text-sm"
              placeholder='{"Etsy": "https://etsy.com/listing/...", "N11": "https://n11.com/...", "Trendyol": "https://trendyol.com/..."}'
            />
            {form.formState.errors.externalLinks && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.externalLinks.message}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="inStock"
              checked={form.watch("inStock")}
              onCheckedChange={(checked) => form.setValue("inStock", checked)}
            />
            <Label htmlFor="inStock">In Stock</Label>
          </div>
          
          <Button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={productMutation.isPending}
          >
            {productMutation.isPending
              ? (isEditing ? "Updating..." : "Creating...")
              : (isEditing ? "Update Product" : "Create Product")
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

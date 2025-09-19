import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminContacts from "@/components/admin/admin-contacts";
import AdminOrders from "@/components/admin/admin-orders";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminProducts } from "@/components/admin/admin-products";
import { ProductForm } from "@/components/admin/product-form";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import type { Product } from "@shared/types";
import { useTranslation } from "react-i18next";
import SiteSettings from '../components/admin/site-settings';

export default function Admin() {
  const baseUrl = import.meta.env.VITE_API_URL;
  const apiUrl = (!baseUrl || baseUrl === "undefined") ? "" : baseUrl;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders' | 'contacts' | 'settings'>('dashboard');
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const loginForm = useForm<{ email: string; password: string }>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      // apiRequest handles base URL (or same-origin fallback)
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsAuthenticated(true);
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
      }
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_token");
  };

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      console.log("Deleting product with ID in mutationFn:", productId);
      const token = localStorage.getItem("admin_token");
  const response = await fetch(`${apiUrl}/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: { email: string; password: string }) => {
    loginMutation.mutate(data);
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: number) => {
    // Confirm dialog'u kullanmak yerine doğrudan silme işlemini gerçekleştirelim
    // Böylece event propagation sorunlarını önleyebiliriz
    console.log("Deleting product with ID:", productId);
    deleteMutation.mutate(productId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20 clk-bg-gray flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold clk-text-black text-center">
              {t("admin.login.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("admin.login.username")}</Label>
                <Input
                  id="email"
                  {...loginForm.register("email")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("admin.login.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  {...loginForm.register("password")}
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200 w-full py-3"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? t("admin.login.loggingIn") : t("admin.login.login")}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-lg flex flex-col py-8 px-4 min-h-screen">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">CLKtech Admin</h1>
          <p className="text-gray-500 text-sm">Yönetim Paneli</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Button variant={tab === 'dashboard' ? 'default' : 'ghost'} className={`justify-start${tab === 'dashboard' ? ' text-white' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</Button>
          <Button variant={tab === 'products' ? 'default' : 'ghost'} className={`justify-start${tab === 'products' ? ' text-white' : ''}`} onClick={() => setTab('products')}>Ürünler</Button>
          <Button variant={tab === 'orders' ? 'default' : 'ghost'} className={`justify-start${tab === 'orders' ? ' text-white' : ''}`} onClick={() => setTab('orders')}>Siparişler</Button>
          <Button variant={tab === 'contacts' ? 'default' : 'ghost'} className={`justify-start${tab === 'contacts' ? ' text-white' : ''}`} onClick={() => setTab('contacts')}>İletişim Mesajları</Button>
          <Button variant={tab === 'settings' ? 'default' : 'ghost'} className={`justify-start${tab === 'settings' ? ' text-white' : ''}`} onClick={() => setTab('settings')}>Site Ayarları</Button>
        </nav>
        <div className="mt-auto pt-8">
          <Button onClick={handleLogout} variant="outline" className="w-full">Çıkış Yap</Button>
          </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold clk-text-black mb-2">{t("admin.panel.title")}</h2>
          <p className="text-xl text-gray-600">{t("admin.panel.subtitle")}</p>
        </div>
        {tab === 'products' && (
          <>
        <AdminProducts
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
        <ProductForm
          product={editingProduct}
          isOpen={showProductForm}
          onClose={() => setShowProductForm(false)}
        />
          </>
        )}
        {tab === 'dashboard' && (
          <AdminDashboard
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {tab === 'orders' && <AdminOrders />}
        {tab === 'contacts' && <AdminContacts />}
        {tab === 'settings' && <SiteSettings />}
      </main>
    </div>
  );
}

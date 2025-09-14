import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
// ...existing code...
import type { Order, Product } from "@shared/types";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminDashboardProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

function fetchWithAuth(url: string) {
  const token = localStorage.getItem("admin_token");
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  }).then(res => {
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  });
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

// Satış grafiği için tarih formatlama
function getMonthNameTR(dateStr: string): string {
  const date = new Date(dateStr);
  return String(date.toLocaleString("tr-TR", { month: "long" }));
}

export function AdminDashboard({ onAddProduct, onEditProduct, onDeleteProduct }: AdminDashboardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetchWithAuth("/api/admin/stats"),
  });
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: () => {
      console.log("Admin dashboard fetching orders...");
      return fetchWithAuth("/api/admin/orders");
    },
    enabled: !!localStorage.getItem("admin_token"),
  });

  // Gerçek sipariş verisiyle satış grafiği datası
  const salesData = orders.reduce((acc: { month: string, sales: number }[], order) => {
    if (!order.createdAt) return acc;
    const month = getMonthNameTR(String(order.createdAt));
    const found = acc.find(item => item.month === month);
    if (found) {
      found.sales += 1;
    } else {
      acc.push({ month, sales: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      {/* Dashboard Stats & Grafik */}
      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        <Card className="col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Satış Grafiği</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData.map(item => ({ ...item, month: String(item.month) }))} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#f59e42" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center items-center">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold clk-text-orange">{stats?.totalProducts || 0}</div></CardContent>
        </Card>
        <Card className="flex flex-col justify-center items-center">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold clk-text-orange">{stats?.totalOrders || 0}</div></CardContent>
        </Card>
        <Card className="flex flex-col justify-center items-center">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam Satış</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold clk-text-orange">₺{stats?.totalSales?.toFixed(2) || "0.00"}</div></CardContent>
        </Card>
      </div>



      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{order.orderId}</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.productName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${getLangField(order.price, lang)}</p>
                  <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

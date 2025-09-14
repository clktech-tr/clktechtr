import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  "pending",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
];

export function AdminOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [noteInput, setNoteInput] = useState("");
  
  // Debug: Log when component renders
  console.log("AdminOrders component rendered");
  const adminToken = localStorage.getItem("admin_token");
  console.log("Admin token present:", !!adminToken);
  
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      console.log("Fetching admin orders...");
      const token = localStorage.getItem("admin_token");
      if (!token) {
        console.log("No admin token found");
        return [];
      }
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      console.log("Admin orders fetched:", data);
      return data;
    },
    enabled: !!adminToken,
  });
  
  // Debug: Log when orders data changes
  console.log("Orders data updated:", orders);
  
  // Listen for order creation events
  useEffect(() => {
    const handleOrderCreated = (event: CustomEvent) => {
      console.log("Order created event received:", event.detail);
      // Force a refetch when a new order is created
      queryClient.refetchQueries({ queryKey: ["/api/admin/orders"] });
    };
    
    window.addEventListener('orderCreated', handleOrderCreated as EventListener);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated as EventListener);
    };
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status?: string; notes?: string }) => {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setSelectedOrder(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setSelectedOrder(null);
    },
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Siparişler</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Yükleniyor...</div>
        ) : error ? (
          <div>Hata: {String(error)}</div>
        ) : orders.length === 0 ? (
          <div>Hiç sipariş yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Sipariş No</th>
                  <th className="p-2 border">Müşteri</th>
                  <th className="p-2 border">E-posta</th>
                  <th className="p-2 border">Ürün</th>
                  <th className="p-2 border">Fiyat</th>
                  <th className="p-2 border">Durum</th>
                  <th className="p-2 border">Tarih</th>
                  <th className="p-2 border">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b">
                    <td className="p-2 border">{o.orderId}</td>
                    <td className="p-2 border">{o.customerName}</td>
                    <td className="p-2 border">{o.email}</td>
                    <td className="p-2 border">{o.productName}</td>
                    <td className="p-2 border">{o.price?.tr || o.price?.en || o.price}</td>
                    <td className="p-2 border">
                      <select
                        className="border rounded px-2 py-1"
                        value={o.status}
                        onChange={e => updateMutation.mutate({ id: o.id, status: e.target.value })}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="p-2 border">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedOrder(o); setNoteInput(o.notes || ""); }}>Detay</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => { if (window.confirm('Sipariş silinsin mi?')) deleteMutation.mutate(o.id); }}>Sil</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detay Modalı */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
              <h2 className="text-xl font-bold mb-4">Sipariş Detayı</h2>
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSelectedOrder(null)}>&times;</button>
              <div className="mb-2"><b>Sipariş No:</b> {selectedOrder.orderId}</div>
              <div className="mb-2"><b>Müşteri:</b> {selectedOrder.customerName}</div>
              <div className="mb-2"><b>E-posta:</b> {selectedOrder.email}</div>
              <div className="mb-2"><b>Telefon:</b> {selectedOrder.phone}</div>
              <div className="mb-2"><b>Adres:</b> {selectedOrder.address}</div>
              <div className="mb-2"><b>Ürün:</b> {selectedOrder.productName}</div>
              <div className="mb-2"><b>Fiyat:</b> {selectedOrder.price?.tr || selectedOrder.price?.en || selectedOrder.price}</div>
              <div className="mb-2"><b>Durum:</b> {selectedOrder.status}</div>
              <div className="mb-2"><b>Tarih:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              <div className="mb-4">
                <b>Not:</b>
                <textarea
                  className="w-full border rounded p-2 mt-1"
                  rows={3}
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                />
                <Button size="sm" className="mt-2" onClick={() => updateMutation.mutate({ id: selectedOrder.id, notes: noteInput })}>Notu Kaydet</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminOrders; 
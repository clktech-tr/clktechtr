import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function AdminContacts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/contacts"],
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/contacts", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    },
  });

  // Simüle edilen okundu/yanıtlandı durumu (gerçek backend ile entegre için ek alan gerekir)
  const getStatus = (id: number) => statusMap[id] || "unread";
  const setStatus = (id: number, status: string) => setStatusMap(s => ({ ...s, [id]: status }));

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete contact");
      return id;
    },
    onSuccess: (id: number) => {
      setStatusMap(s => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      setSelectedContact(null);
    },
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>İletişim Mesajları</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Yükleniyor...</div>
        ) : error ? (
          <div>Hata: {String(error)}</div>
        ) : contacts.length === 0 ? (
          <div>Hiç mesaj yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Ad</th>
                  <th className="p-2 border">Soyad</th>
                  <th className="p-2 border">E-posta</th>
                  <th className="p-2 border">Konu</th>
                  <th className="p-2 border">Durum</th>
                  <th className="p-2 border">Tarih</th>
                  <th className="p-2 border">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c: any) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2 border">{c.firstName}</td>
                    <td className="p-2 border">{c.lastName}</td>
                    <td className="p-2 border">{c.email}</td>
                    <td className="p-2 border">{c.subject}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${getStatus(c.id)==='unread' ? 'bg-gray-200' : getStatus(c.id)==='read' ? 'bg-blue-200' : 'bg-green-200'}`}>
                        {getStatus(c.id) === 'unread' ? 'Okunmadı' : getStatus(c.id) === 'read' ? 'Okundu' : 'Yanıtlandı'}
                      </span>
                    </td>
                    <td className="p-2 border">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="p-2 border">
                      <Button size="sm" variant="outline" onClick={() => setSelectedContact(c)}>Detay</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => { if(window.confirm('Mesaj silinsin mi?')) deleteMutation.mutate(c.id); }}>Sil</Button>
                      <Button size="sm" className="ml-2" onClick={() => setStatus(c.id, getStatus(c.id)==='unread' ? 'read' : getStatus(c.id)==='read' ? 'answered' : 'unread')}>
                        {getStatus(c.id) === 'unread' ? 'Okundu' : getStatus(c.id) === 'read' ? 'Yanıtlandı' : 'Okunmadı'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detay Modalı */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
              <h2 className="text-xl font-bold mb-4">Mesaj Detayı</h2>
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSelectedContact(null)}>&times;</button>
              <div className="mb-2"><b>Ad:</b> {selectedContact.firstName}</div>
              <div className="mb-2"><b>Soyad:</b> {selectedContact.lastName}</div>
              <div className="mb-2"><b>E-posta:</b> {selectedContact.email}</div>
              <div className="mb-2"><b>Konu:</b> {selectedContact.subject}</div>
              <div className="mb-2"><b>Tarih:</b> {new Date(selectedContact.createdAt).toLocaleString()}</div>
              <div className="mb-4"><b>Mesaj:</b><br />{selectedContact.message}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminContacts; 
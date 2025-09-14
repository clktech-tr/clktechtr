import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../../hooks/use-toast';

interface Settings {
  id: number;
  siteTitle: string;
  siteDesc: string;
  logoUrl: string;
  faviconUrl: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  bankName: string;
  bankAccountNumber: string;
  bankIban: string;
  bankReferencePrefix: string;
  blockCodeScreenshot1: string;
  blockCodeScreenshot2: string;
  blockCodeVideoUrl: string;
  aboutImage: string;
  downloadUrl: string; // Yeni eklenen alan
  havale?: boolean; // Havale ile satın al butonu gösterme/gizleme
  harici?: boolean; // Harici satın alma bağlantıları gösterme/gizleme
}

const SiteSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Değişikliği konsola yazdır
    console.log(`Input değişti: ${e.target.name} = ${e.target.value}`);
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  // ZIP dosyası yükleme fonksiyonu
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Dosya uzantısını kontrol et
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'zip') {
      toast({ title: 'Hata', description: 'Sadece .zip dosyası yükleyebilirsiniz.' });
      return;
    }
    
    // Dosya boyutunu kontrol et (200MB = 200 * 1024 * 1024 bytes)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      toast({ 
        title: 'Hata', 
        description: `Dosya boyutu çok büyük. Maksimum dosya boyutu: ${(maxSize / (1024 * 1024)).toFixed(0)}MB` 
      });
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('Dosya yükleniyor:', file.name, file.type, file.size);
      
      // Content-Type header'ı otomatik olarak ayarlanacak
      const res = await fetch('/api/admin/upload-download', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          // FormData ile multipart/form-data otomatik olarak ayarlanır, manuel Content-Type belirtmeyin
        },
        body: formData
      });
      
      setUploading(false);
      
      if (res.ok) {
        const data = await res.json();
        setSettings(s => ({ ...s, downloadUrl: data.url }));
        toast({ title: 'Başarılı', description: 'Dosya yüklendi.' });
      } else {
        let errorMessage = `Dosya yüklenemedi: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json();
          console.error('Dosya yükleme hatası:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.details) {
            errorMessage += ` (${errorData.details})`;
          }
        } catch (e) {
          const errorText = await res.text();
          console.error('Dosya yükleme hatası (text):', errorText);
        }
        toast({ title: 'Hata', description: errorMessage });
      }
    } catch (error) {
      setUploading(false);
      console.error('Dosya yükleme hatası:', error);
      toast({ title: 'Hata', description: `Dosya yüklenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sosyal medya URL'lerini kontrol et ve düzelt
      const updatedSettings = { ...settings };
      
      // URL'lerin başında http:// veya https:// yoksa ekle
      const socialMediaFields = ['socialFacebook', 'socialTwitter', 'socialInstagram', 'socialLinkedin'];
      socialMediaFields.forEach(field => {
        if (updatedSettings[field] && updatedSettings[field].trim() !== '') {
          // URL'nin başında http:// veya https:// yoksa https:// ekle
          if (!updatedSettings[field].match(/^https?:\/\//)) {
            updatedSettings[field] = `https://${updatedSettings[field]}`;
          }
        }
      });
      
      console.log('Ayarlar gönderiliyor:', updatedSettings);
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(updatedSettings)
      });
      
      setLoading(false);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Ayarlar başarıyla güncellendi:', data);
        // Güncellenmiş ayarları state'e kaydet
        setSettings(data);
        toast({ title: 'Başarılı', description: 'Ayarlar güncellendi.' });
      } else {
        let errorMessage = 'Ayarlar güncellenemedi.';
        let errorDetails = '';
        try {
          const errorData = await res.json();
          console.error('Ayarlar güncelleme hatası:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.details) {
            errorDetails = errorData.details;
          }
          
          // Veritabanı şema hatası için özel mesaj
          if (errorMessage.includes('downloadUrl')) {
            toast({ 
              title: 'Veritabanı Şema Hatası', 
              description: 'downloadUrl sütunu bulunamadı. Lütfen yönetici ile iletişime geçin.'
            });
            
            // Detayları konsola yazdır
            console.error('Veritabanı şema hatası detayları:', errorDetails);
            return;
          }
          
          toast({ title: 'Hata', description: errorMessage });
        } catch (e) {
          const errorText = await res.text();
          console.error('Ayarlar güncelleme hatası (text):', errorText);
          toast({ title: 'Hata', description: errorMessage });
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Ayarlar güncelleme hatası (genel):', error);
      
      // Hata mesajında downloadUrl geçiyorsa özel mesaj göster
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      if (errorMessage.includes('downloadUrl')) {
        toast({ 
          title: 'Veritabanı Şema Hatası', 
          description: 'downloadUrl sütunu bulunamadı. Lütfen yönetici ile iletişime geçin.'
        });
        return;
      }
      
      toast({ 
        title: 'Hata', 
        description: `Ayarlar güncellenemedi: ${errorMessage}` 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Site Ayarları</h2>
      <Input name="siteTitle" value={settings.siteTitle || ''} onChange={handleChange} placeholder="Site Başlığı" />
      <Input name="siteDesc" value={settings.siteDesc || ''} onChange={handleChange} placeholder="Site Açıklaması" />
      <Input name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} placeholder="Logo URL" />
      <Input name="faviconUrl" value={settings.faviconUrl || ''} onChange={handleChange} placeholder="Favicon URL" />
      <Input name="socialFacebook" value={settings.socialFacebook || ''} onChange={handleChange} placeholder="Facebook URL (örn: facebook.com/clktech)" />
      <Input name="socialTwitter" value={settings.socialTwitter || ''} onChange={handleChange} placeholder="Twitter URL (örn: twitter.com/clktech)" />
      <Input name="socialInstagram" value={settings.socialInstagram || ''} onChange={handleChange} placeholder="Instagram URL (örn: instagram.com/clktech)" />
      <Input name="socialLinkedin" value={settings.socialLinkedin || ''} onChange={handleChange} placeholder="LinkedIn URL (örn: linkedin.com/company/clktech)" />
      <hr className="my-4" />
      <h3 className="text-lg font-semibold mb-2">Banka Bilgileri ve Satın Alma Seçenekleri</h3>
      <Input name="bankName" value={settings.bankName || ''} onChange={handleChange} placeholder="Banka Adı" />
      <Input name="bankAccountNumber" value={settings.bankAccountNumber || ''} onChange={handleChange} placeholder="Hesap Numarası" />
      <Input name="bankIban" value={settings.bankIban || ''} onChange={handleChange} placeholder="IBAN" />
      <Input name="bankReferencePrefix" value={settings.bankReferencePrefix || ''} onChange={handleChange} placeholder="Referans (örn: Order #)" />
      
      <div className="flex items-center space-x-2 mt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="havale"
            checked={settings.havale || false}
            onCheckedChange={(checked) => setSettings({...settings, havale: checked === true})}
          />
          <label htmlFor="havale" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Banka Havalesi ile Satın Al</label>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="harici"
            checked={settings.harici || false}
            onCheckedChange={(checked) => setSettings({...settings, harici: checked === true})}
          />
          <label htmlFor="harici" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Harici Satın Alma Bağlantılarını Göster</label>
        </div>
      </div>
      <hr className="my-4" />
      <h3 className="text-lg font-semibold mb-2">Görseller ve Video</h3>
      {/* Block Code Ekran Görüntüsü 1 */}
      <label className="block text-sm font-medium mb-1">Block Code Ekran Görüntüsü 1</label>
      <Input type="file" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(s => ({ ...s, blockCodeScreenshot1: data.url }));
          toast({ title: 'Başarılı', description: 'Görsel yüklendi.' });
        } else {
          toast({ title: 'Hata', description: 'Görsel yüklenemedi.' });
        }
      }} />
      {settings.blockCodeScreenshot1 && (
        <div className="text-xs text-green-600 mb-2">Yüklü: <a href={settings.blockCodeScreenshot1} target="_blank" rel="noopener noreferrer">{settings.blockCodeScreenshot1}</a></div>
      )}
      {/* Block Code Ekran Görüntüsü 2 */}
      <label className="block text-sm font-medium mb-1">Block Code Ekran Görüntüsü 2</label>
      <Input type="file" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(s => ({ ...s, blockCodeScreenshot2: data.url }));
          toast({ title: 'Başarılı', description: 'Görsel yüklendi.' });
        } else {
          toast({ title: 'Hata', description: 'Görsel yüklenemedi.' });
        }
      }} />
      {settings.blockCodeScreenshot2 && (
        <div className="text-xs text-green-600 mb-2">Yüklü: <a href={settings.blockCodeScreenshot2} target="_blank" rel="noopener noreferrer">{settings.blockCodeScreenshot2}</a></div>
      )}
      {/* Block Code Video URL */}
      <Input name="blockCodeVideoUrl" value={settings.blockCodeVideoUrl || ''} onChange={handleChange} placeholder="Block Code Video URL" />
      {/* Hakkımızda Görseli */}
      <label className="block text-sm font-medium mb-1">Hakkımızda Görseli</label>
      <Input type="file" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(s => ({ ...s, aboutImage: data.url }));
          toast({ title: 'Başarılı', description: 'Görsel yüklendi.' });
        } else {
          toast({ title: 'Hata', description: 'Görsel yüklenemedi.' });
        }
      }} />
      {settings.aboutImage && (
        <div className="text-xs text-green-600 mb-2">Yüklü: <a href={settings.aboutImage} target="_blank" rel="noopener noreferrer">{settings.aboutImage}</a></div>
      )}
      <hr className="my-4" />
      <h3 className="text-lg font-semibold mb-2">İndirilebilir Dosya (.zip)</h3>
      <Input type="file" accept=".zip" onChange={handleFileChange} disabled={uploading} />
      {settings.downloadUrl && (
        <div className="text-sm text-green-600">Yüklü dosya: <a href={settings.downloadUrl} target="_blank" rel="noopener noreferrer">{settings.downloadUrl}</a></div>
      )}
      <Button 
        type="submit" 
        disabled={loading} 
        className="bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200 py-3"
      >
        {loading ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </form>
  );
};

export default SiteSettings;
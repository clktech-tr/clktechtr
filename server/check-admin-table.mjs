import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const supabaseUrl = process.env.SUPABASE_URL || 'https://iyxbhvbmcxpuaaamxjww.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5eGJodmJtY3hwdWFhYW14and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk3OTQ4NzcsImV4cCI6MjAxNTM3MDg3N30.Ij3yAJQCHQQvytAiT_yrH0PQBIUbxCmkLCjYQBqOG-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminTable() {
  try {
    console.log('Admins tablosunu kontrol ediyorum...');
    
    // Tablo yapısını kontrol et
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { query: 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'admins\' AND table_schema = \'public\'' });
    
    if (tableError) {
      if (tableError.message.includes('function "exec_sql" does not exist')) {
        console.log('exec_sql fonksiyonu bulunamadı. Alternatif yöntem kullanılıyor...');
        
        // Doğrudan tabloyu sorgula
        const { data: admins, error: adminsError } = await supabase
          .from('admins')
          .select('*')
          .limit(1);
        
        if (adminsError) {
          console.error('Admins tablosu sorgulanamadı:', adminsError.message);
          return;
        }
        
        console.log('Admins tablosu mevcut. Örnek kayıt:', admins);
        
        // Eğer kayıt varsa, sütunları göster
        if (admins && admins.length > 0) {
          console.log('Mevcut sütunlar:', Object.keys(admins[0]));
        } else {
          console.log('Tabloda kayıt bulunamadı.');
        }
      } else {
        console.error('Tablo yapısı sorgulanamadı:', tableError.message);
      }
      return;
    }
    
    console.log('Tablo yapısı:', tableInfo);
    
    // Admin kayıtlarını kontrol et
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*');
    
    if (adminsError) {
      console.error('Admin kayıtları sorgulanamadı:', adminsError.message);
      return;
    }
    
    console.log('Mevcut admin kayıtları:', admins);
    
    // Email sütunu yoksa ekle
    if (!tableInfo.some(col => col.column_name === 'email')) {
      console.log('Email sütunu ekleniyor...');
      
      const { error: alterError } = await supabase
        .rpc('exec_sql', { query: 'ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email TEXT' });
      
      if (alterError) {
        console.error('Email sütunu eklenemedi:', alterError.message);
        console.log('Manuel olarak aşağıdaki SQL sorgusunu çalıştırın:');
        console.log('ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email TEXT;');
      } else {
        console.log('Email sütunu başarıyla eklendi.');
      }
    }
    
    // Admin@clktech.com kaydını güncelle veya ekle
    if (admins && admins.length > 0) {
      // İlk admin kaydını güncelle
      const adminId = admins[0].id;
      console.log(`${adminId} ID'li admin kaydı güncelleniyor...`);
      
      const { error: updateError } = await supabase
        .from('admins')
        .update({ 
          email: 'admin@clktech.com',
          password: 'admin123'
        })
        .eq('id', adminId);
      
      if (updateError) {
        console.error('Admin kaydı güncellenemedi:', updateError.message);
      } else {
        console.log('Admin kaydı başarıyla güncellendi.');
      }
    } else {
      // Yeni admin kaydı ekle
      console.log('Yeni admin kaydı ekleniyor...');
      
      const { error: insertError } = await supabase
        .from('admins')
        .insert([{ 
          email: 'admin@clktech.com', 
          password: 'admin123',
          username: 'admin' // Geriye dönük uyumluluk için
        }]);
      
      if (insertError) {
        console.error('Admin kaydı eklenemedi:', insertError.message);
      } else {
        console.log('Yeni admin kaydı başarıyla eklendi.');
      }
    }
    
  } catch (error) {
    console.error('Beklenmeyen bir hata oluştu:', error);
  }
}

checkAdminTable();
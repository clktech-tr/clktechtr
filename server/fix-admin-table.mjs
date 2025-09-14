import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY'
);

async function fixAdminTable() {
  try {
    // Mevcut tabloyu kontrol et
    console.log('Mevcut tabloyu kontrol ediyorum...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('admins')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Tablo kontrol hatası:', tableError.message, tableError);
      process.exit(1);
    }
    
    console.log('Tablo bilgisi:', tableInfo);
    
    // SQL ile doğrudan sütun ekle
    console.log('SQL ile sütun eklemeyi deniyorum...');
    
    // Önce username sütununu ekle
    const addUsernameQuery = `
      ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
    `;
    
    const { error: addUsernameError } = await supabase.rpc('exec_sql', { query: addUsernameQuery });
    
    if (addUsernameError) {
      // RPC fonksiyonu yoksa, başka bir yöntem deneyelim
      console.error('SQL ile sütun ekleme hatası (RPC yok):', addUsernameError.message, addUsernameError);
      console.log('Alternatif yöntem deneniyor...');
      
      // Supabase REST API ile tablo yapısını değiştirmek mümkün değil
      // Bu durumda kullanıcıya bilgi verelim
      console.log('\n\nÖNEMLİ: Supabase yönetim panelinden aşağıdaki SQL sorgusunu çalıştırmanız gerekiyor:\n');
      console.log(addUsernameQuery);
      console.log('\nArdından aşağıdaki sorguyu çalıştırın:\n');
      console.log(`
        UPDATE admins SET username = 'admin' WHERE username IS NULL;
        ALTER TABLE admins ALTER COLUMN username SET NOT NULL;
      `);
      process.exit(1);
    }
    
    console.log('Username sütunu eklendi veya zaten vardı.');
    
    // Tüm kayıtlara varsayılan username değeri ata
    const updateUsernameQuery = `
      UPDATE admins SET username = 'admin' WHERE username IS NULL;
    `;
    
    const { error: updateUsernameError } = await supabase.rpc('exec_sql', { query: updateUsernameQuery });
    
    if (updateUsernameError) {
      console.error('Username güncelleme hatası:', updateUsernameError.message, updateUsernameError);
    } else {
      console.log('Username değerleri güncellendi.');
    }
    
    // Username sütununu NOT NULL yap
    const alterUsernameQuery = `
      ALTER TABLE admins ALTER COLUMN username SET NOT NULL;
    `;
    
    const { error: alterUsernameError } = await supabase.rpc('exec_sql', { query: alterUsernameQuery });
    
    if (alterUsernameError) {
      console.error('Username sütunu NOT NULL yapılamadı:', alterUsernameError.message, alterUsernameError);
    } else {
      console.log('Username sütunu NOT NULL yapıldı.');
    }
    
    // Admin kullanıcısını kontrol et veya ekle
    console.log('Admin kullanıcısını kontrol ediyorum...');
    
    // Önce mevcut kayıtları kontrol et
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*');
    
    if (adminsError) {
      console.error('Admin sorgulama hatası:', adminsError.message, adminsError);
      process.exit(1);
    }
    
    console.log('Mevcut adminler:', admins);
    
    if (admins && admins.length > 0) {
      // Şifreyi güncelle
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password: 'admin' })
        .eq('id', admins[0].id);
      
      if (updateError) {
        console.error('Şifre güncellenemedi:', updateError.message, updateError);
      } else {
        console.log('Mevcut admin şifresi güncellendi.');
      }
    } else {
      // Admin ekle
      const { error: insertError } = await supabase
        .from('admins')
        .insert([{ username: 'admin', password: 'admin' }]);
      
      if (insertError) {
        console.error('Admin eklenemedi:', insertError.message, insertError);
      } else {
        console.log('Yeni admin eklendi.');
      }
    }
    
    console.log('İşlem tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    process.exit(1);
  }
}

fixAdminTable();
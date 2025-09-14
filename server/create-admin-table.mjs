import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY'
);

async function createAdminTable() {
  try {
    // Admins tablosunu oluştur
    const { error } = await supabase.rpc('create_admin_table');
    
    if (error) {
      console.error('Tablo oluşturma hatası:', error.message, error);
      
      // Stored procedure yoksa, SQL ile doğrudan oluştur
      console.log('SQL ile tablo oluşturmayı deniyorum...');
      const { error: sqlError } = await supabase.from('admins').delete().eq('id', 0);
      
      if (sqlError && sqlError.code === '42P01') {
        // Tablo yok, oluşturalım
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', { query: createTableQuery });
        
        if (createError) {
          console.error('SQL ile tablo oluşturma hatası:', createError.message, createError);
          process.exit(1);
        } else {
          console.log('Admins tablosu başarıyla oluşturuldu!');
        }
      } else {
        console.log('Tablo zaten var gibi görünüyor.');
      }
    } else {
      console.log('Admins tablosu başarıyla oluşturuldu!');
    }
    
    // Admin kullanıcısını ekle
    const username = 'admin';
    const password = 'admin';
    
    const { data: admin, error: selectError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    
    if (selectError) {
      console.error('Admin sorgulama hatası:', selectError.message, selectError);
    }
    
    if (admin) {
      // Şifreyi güncelle
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password })
        .eq('username', username);
      
      if (updateError) {
        console.error('Şifre güncellenemedi:', updateError.message, updateError);
      } else {
        console.log('Mevcut admin şifresi güncellendi.');
      }
    } else {
      // Admin ekle
      const { error: insertError } = await supabase
        .from('admins')
        .insert([{ username, password }]);
      
      if (insertError) {
        console.error('Admin eklenemedi:', insertError.message, insertError);
      } else {
        console.log('Yeni admin eklendi.');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    process.exit(1);
  }
}

createAdminTable();
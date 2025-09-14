import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL veya Service Key bulunamadı. .env dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDownloadUrlColumn() {
  try {
    // Doğrudan SQL sorgusu çalıştır
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Settings tablosu kontrolü hatası:', error);
      process.exit(1);
    }

    // Eğer settings tablosu varsa, downloadUrl sütununu ekle
    if (data && data.length > 0) {
      // Önce sütunun var olup olmadığını kontrol et
      const { data: columnData, error: columnError } = await supabase
        .from('settings')
        .select('downloadUrl')
        .limit(1);

      if (columnError && columnError.message.includes("downloadUrl")) {
        console.log('downloadUrl sütunu bulunamadı, ekleniyor...');
        
        // PostgreSQL'de ALTER TABLE sorgusu çalıştırmak için REST API kullanılamaz
        // Bu nedenle, doğrudan Supabase'e gidip SQL Editor'da aşağıdaki sorguyu çalıştırmanız gerekiyor:
        // ALTER TABLE settings ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;
        
        console.log('Lütfen Supabase SQL Editor\'da aşağıdaki sorguyu çalıştırın:');
        console.log('ALTER TABLE settings ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;');
        
        // Alternatif olarak, downloadUrl sütununu eklemek için bir güncelleme yapalım
        const { error: updateError } = await supabase
          .from('settings')
          .update({ downloadUrl: '' })
          .eq('id', data[0].id);
        
        if (updateError) {
          console.error('Sütun ekleme hatası:', updateError);
          process.exit(1);
        } else {
          console.log('downloadUrl sütunu başarıyla eklendi ve boş değer atandı.');
        }
      } else {
        console.log('downloadUrl sütunu zaten var.');
      }
    } else {
      console.error('Settings tablosu bulunamadı.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    process.exit(1);
  }
}

addDownloadUrlColumn()
  .then(() => {
    console.log('İşlem tamamlandı.');
    process.exit(0);
  })
  .catch(error => {
    console.error('İşlem hatası:', error);
    process.exit(1);
  });
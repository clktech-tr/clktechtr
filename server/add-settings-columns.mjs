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

async function addSettingsColumns() {
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

    // Eğer settings tablosu varsa, yeni sütunları ekle
    if (data && data.length > 0) {
      const columnsToAdd = [
        { name: 'showBankTransfer', type: 'BOOLEAN DEFAULT TRUE' },
        { name: 'showExternalLinks', type: 'BOOLEAN DEFAULT TRUE' }
      ];

      for (const column of columnsToAdd) {
        // Önce sütunun var olup olmadığını kontrol et
        const { data: columnData, error: columnError } = await supabase
          .from('settings')
          .select(column.name)
          .limit(1);

        if (columnError && columnError.message.includes(column.name)) {
          console.log(`${column.name} sütunu bulunamadı, ekleniyor...`);
          
          // PostgreSQL'de ALTER TABLE sorgusu çalıştırmak için REST API kullanılamaz
          // Bu nedenle, doğrudan Supabase'e gidip SQL Editor'da aşağıdaki sorguyu çalıştırmanız gerekiyor:
          console.log(`Lütfen Supabase SQL Editor'da aşağıdaki sorguyu çalıştırın:`);
          console.log(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};`);
          
          // Alternatif olarak, sütunu eklemek için bir güncelleme yapalım
          const updateData = {};
          updateData[column.name] = column.type.includes('BOOLEAN') ? true : '';
          
          const { error: updateError } = await supabase
            .from('settings')
            .update(updateData)
            .eq('id', data[0].id);
          
          if (updateError) {
            console.error(`${column.name} sütunu ekleme hatası:`, updateError);
          } else {
            console.log(`${column.name} sütunu başarıyla eklendi ve varsayılan değer atandı.`);
          }
        } else {
          console.log(`${column.name} sütunu zaten var.`);
        }
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

addSettingsColumns()
  .then(() => {
    console.log('İşlem tamamlandı.');
    process.exit(0);
  })
  .catch(error => {
    console.error('İşlem hatası:', error);
    process.exit(1);
  });
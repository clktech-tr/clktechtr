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

async function createSettingsTable() {
  try {
    // Önce settings tablosunun var olup olmadığını kontrol et
    const { data: existingTable, error: tableError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('Settings tablosu bulunamadı, oluşturuluyor...');
      
      // Tabloyu oluştur (SQL sorgusu ile)
      const { error: createError } = await supabase.rpc('create_settings_table');
      
      if (createError) {
        console.error('Tablo oluşturma hatası:', createError);
        
        // SQL fonksiyonu yoksa, doğrudan SQL sorgusu çalıştır
        const { error: sqlError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS settings (
              id SERIAL PRIMARY KEY,
              "siteTitle" TEXT,
              "siteDesc" TEXT,
              "logoUrl" TEXT,
              "faviconUrl" TEXT,
              "socialFacebook" TEXT,
              "socialTwitter" TEXT,
              "socialInstagram" TEXT,
              "socialLinkedin" TEXT,
              "bankName" TEXT,
              "bankAccountNumber" TEXT,
              "bankIban" TEXT,
              "bankReferencePrefix" TEXT,
              "blockCodeScreenshot1" TEXT,
              "blockCodeScreenshot2" TEXT,
              "blockCodeVideoUrl" TEXT,
              "aboutImage" TEXT,
              "downloadUrl" TEXT,
              "showBankTransfer" BOOLEAN DEFAULT TRUE,
              "showExternalLinks" BOOLEAN DEFAULT TRUE,
              "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
        
        if (sqlError) {
          console.error('SQL sorgusu hatası:', sqlError);
          process.exit(1);
        }
      }
      
      // Varsayılan ayarları ekle
      const { error: insertError } = await supabase
        .from('settings')
        .insert([{
          siteTitle: 'CLKtech',
          siteDesc: 'Teknoloji Çözümleri',
          logoUrl: '',
          faviconUrl: '',
          socialFacebook: '',
          socialTwitter: '',
          socialInstagram: '',
          socialLinkedin: '',
          bankName: '',
          bankAccountNumber: '',
          bankIban: '',
          bankReferencePrefix: 'Sipariş #',
          blockCodeScreenshot1: '',
          blockCodeScreenshot2: '',
          blockCodeVideoUrl: '',
          aboutImage: '',
          downloadUrl: '',
          showBankTransfer: true,
          showExternalLinks: true
        }]);
      
      if (insertError) {
        console.error('Varsayılan ayarları ekleme hatası:', insertError);
        process.exit(1);
      }
      
      console.log('Settings tablosu başarıyla oluşturuldu ve varsayılan ayarlar eklendi.');
    } else if (tableError) {
      console.error('Tablo kontrolü hatası:', tableError);
      process.exit(1);
    } else {
      console.log('Settings tablosu zaten var. Gerekli sütunları kontrol ediyorum...');
      
      // Sütunları kontrol et ve ekle
      const columnsToCheck = [
        { name: 'downloadUrl', type: 'TEXT' },
        { name: 'showBankTransfer', type: 'BOOLEAN DEFAULT TRUE' },
        { name: 'showExternalLinks', type: 'BOOLEAN DEFAULT TRUE' }
      ];
      
      for (const column of columnsToCheck) {
        // Sütunu kontrol et
        const { data: columnInfo, error: columnError } = await supabase.rpc('check_column_exists', {
          table_name: 'settings',
          column_name: column.name
        });
        
        if (columnError) {
          console.error(`${column.name} sütun kontrolü hatası:`, columnError);
          
          // Alternatif olarak doğrudan SQL ile sütunu ekle
          const { error: alterError } = await supabase.rpc('exec_sql', {
            sql_query: `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};`
          });
          
          if (alterError) {
            console.error(`${column.name} sütun ekleme hatası:`, alterError);
          } else {
            console.log(`${column.name} sütunu başarıyla eklendi.`);
          }
        } else if (!columnInfo || !columnInfo.exists) {
          // Sütun yok, ekle
          const { error: alterError } = await supabase.rpc('exec_sql', {
            sql_query: `ALTER TABLE settings ADD COLUMN "${column.name}" ${column.type};`
          });
          
          if (alterError) {
            console.error(`${column.name} sütun ekleme hatası:`, alterError);
          } else {
            console.log(`${column.name} sütunu başarıyla eklendi.`);
          }
        } else {
          console.log(`${column.name} sütunu zaten var.`);
        }
      }
    }
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    process.exit(1);
  }
}

createSettingsTable()
  .then(() => {
    console.log('İşlem tamamlandı.');
    process.exit(0);
  })
  .catch(error => {
    console.error('İşlem hatası:', error);
    process.exit(1);
  });
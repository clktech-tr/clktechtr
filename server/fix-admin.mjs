import 'dotenv/config';
// Bu scripti node ile çalıştırabilirsin: node server/fix-admin.mjs
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY'
);

const username = 'admin';
const password = 'admin';

async function fixAdmin() {
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .maybeSingle(); // .single() yerine .maybeSingle() kullan

  if (error && error.code !== 'PGRST116') {
    // Sadece "no rows" hatası dışında hata varsa göster
    console.error('Admin sorgulama hatası:', error.message, error);
    process.exit(1);
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
}

fixAdmin(); 
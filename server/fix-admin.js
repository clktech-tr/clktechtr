// Bu scripti node ile çalıştırabilirsin: node server/fix-admin.js
const { createClient } = require('@supabase/supabase-js');

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
    .single();

  if (admin) {
    // Şifreyi güncelle
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password })
      .eq('username', username);
    if (updateError) {
      console.error('Şifre güncellenemedi:', updateError.message);
    } else {
      console.log('Mevcut admin şifresi güncellendi.');
    }
  } else {
    // Admin ekle
    const { error: insertError } = await supabase
      .from('admins')
      .insert([{ username, password }]);
    if (insertError) {
      console.error('Admin eklenemedi:', insertError.message);
    } else {
      console.log('Yeni admin eklendi.');
    }
  }
  process.exit(0);
}

fixAdmin(); 
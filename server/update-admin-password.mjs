import { createClient } from '@supabase/supabase-js';

// Supabase bağlantısı
const supabaseUrl = process.env.SUPABASE_URL || 'https://iyxbhvbmcxpuaaamxjww.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5eGJodmJtY3hwdWFhYW14and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk3OTQ4NzcsImV4cCI6MjAxNTM3MDg3N30.Ij3yAJQCHQQvytAiT_yrH0PQBIUbxCmkLCjYQBqOG-g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdminPassword() {
  try {
    console.log('Admin şifresini güncelliyorum...');
    
    // Admin kaydını güncelle
    const { data: admin, error: updateError } = await supabase
      .from('admins')
      .update({ password: 'admin123' })
      .eq('email', 'admin@clktech.com')
      .select();
    
    if (updateError) {
      console.error('Admin şifresi güncellenemedi:', updateError.message);
      return;
    }
    
    console.log('Admin şifresi başarıyla güncellendi:', admin);
    
  } catch (error) {
    console.error('Beklenmeyen bir hata oluştu:', error);
  }
}

updateAdminPassword();
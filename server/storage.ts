import { supabase } from './supabaseClient.js';
import bcrypt from 'bcryptjs';

// Ürünler
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getProduct(id: number) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
export async function createProduct(product: any) {
  const { data, error } = await supabase.from('products').insert([product]).select().single();
  if (error) throw error;
  return data;
}
export async function updateProduct(id: number, product: any) {
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteProduct(id: number) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Kullanıcılar
export async function getUsers() {
  const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getUser(id: number) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error) return undefined;
  return data;
}
export async function createUser(user: any) {
  // Şifreyi hash'le
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const userWithHashedPassword = { ...user, password: hashedPassword };
  
  const { data, error } = await supabase.from('users').insert([userWithHashedPassword]).select().single();
  if (error) throw error;
  return data;
}
export async function updateUser(id: number, user: any) {
  // Eğer şifre güncelleniyorsa hash'le
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  
  const { data, error } = await supabase.from('users').update(user).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteUser(id: number) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
  return true;
}
export async function verifyUserPassword(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

// Siparişler
export async function getOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getOrder(id: number) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
export async function getOrdersByUserId(userId: number) {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createOrder(order: any) {
  const { data, error } = await supabase.from('orders').insert([order]).select().single();
  if (error) throw error;
  return data;
}
export async function updateOrder(id: number, order: any) {
  const { data, error } = await supabase.from('orders').update(order).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteOrder(id: number) {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// İletişim Mesajları
export async function getContacts() {
  const { data, error } = await supabase.from('contacts').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}
export async function createContact(contact: any) {
  const { data, error } = await supabase.from('contacts').insert([contact]).select().single();
  if (error) throw error;
  return data;
}

// Adminler (örnek, şifre hash önerilir)
export async function getAdminByUsername(username: string) {
  // Bu fonksiyon artık doğrudan routes.ts içinde Supabase sorgusu ile değiştirildi
  // Geriye dönük uyumluluk için boş bırakıyoruz
  return undefined;
}
export async function createAdmin(admin: any) {
  const { data, error } = await supabase.from('admins').insert([admin]).select().single();
  if (error) throw error;
  return data;
}

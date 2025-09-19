import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Frontend hata ve network hatalarını backend'e loglamak için fonksiyon
export async function logClientError(error: any) {
  try {
    const raw = import.meta.env.VITE_API_URL as string | undefined;
    const base = typeof raw === 'string' && raw.trim() && raw.trim() !== 'undefined' ? raw.trim() : '';
    const url = base ? `${base}/api/log-client-error` : '/api/log-client-error';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        typeof error === 'object' && error !== null ? error : { message: String(error) }
      ),
    });
  } catch (e) {
    // Sunucuya log gönderilemezse sessizce yut
  }
}

// Örnek kullanım (fetch ile):
// fetch('/api/data')
//   .then(res => { if (!res.ok) throw new Error('Network response was not ok'); return res.json(); })
//   .catch(logClientError);
//
// axios ile de benzer şekilde catch(logClientError) kullanılabilir.

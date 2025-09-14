# CLKtech Deployment Guide

Bu rehber, CLKtech projesinin Vercel (frontend) ve Render (backend) üzerinde nasıl deploy edileceğini açıklar.

## Ön Gereksinimler

1. GitHub hesabı ve repository
2. Vercel hesabı
3. Render hesabı
4. Supabase projesi

## 1. GitHub Repository

Repository'yi GitHub'a yükleyin:

```bash
git remote add origin https://github.com/clktechtr/clktechtr.git
git push -u origin main
```

## 2. Render (Backend) Deployment

### Adım 1: Render'da Yeni Web Service Oluşturun

1. [Render Dashboard](https://dashboard.render.com)'a gidin
2. "New +" butonuna tıklayın
3. "Web Service" seçin
4. GitHub repository'nizi bağlayın

### Adım 2: Build ve Start Komutları

- **Build Command**: `npm install && npm run build:backend`
- **Start Command**: `node dist/server/index.js`
- **Environment**: `Node`

### Adım 3: Environment Variables

Render'da aşağıdaki environment variable'ları ekleyin:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://ktywqplfwftkaehylcjc.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
JWT_SECRET=your_jwt_secret_here
```

### Adım 4: Deploy

"Create Web Service" butonuna tıklayın. Render otomatik olarak build ve deploy işlemini başlatacak.

## 3. Vercel (Frontend) Deployment

### Adım 1: Vercel'e Repository Bağlayın

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin

### Adım 2: Build Ayarları

- **Framework Preset**: Vite
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install && cd client && npm install`

### Adım 3: Environment Variables

Vercel'de aşağıdaki environment variable'ları ekleyin:

```
NODE_ENV=production
VITE_API_URL=https://your-render-app.onrender.com
```

### Adım 4: Deploy

"Deploy" butonuna tıklayın. Vercel otomatik olarak build ve deploy işlemini başlatacak.

## 4. Domain Ayarları

### Render Backend URL
Backend deploy edildikten sonra, Render size bir URL verecek (örn: `https://clktech-backend.onrender.com`)

### Vercel Frontend URL
Frontend deploy edildikten sonra, Vercel size bir URL verecek (örn: `https://clktechtr.vercel.app`)

## 5. Konfigürasyon Güncellemeleri

Backend URL'ini aldıktan sonra:

1. `vercel.json` dosyasındaki API rewrites'ı güncelleyin
2. Vercel environment variables'da `VITE_API_URL`'i güncelleyin
3. Render'da redeploy yapın

## 6. Test

1. Frontend URL'ini ziyaret edin
2. Admin paneline giriş yapın (`/admin`)
3. API endpoint'lerini test edin

## Troubleshooting

### Build Hataları

- Node.js versiyonunu kontrol edin (18+ gerekli)
- Dependencies'lerin doğru yüklendiğinden emin olun
- Environment variables'ların doğru set edildiğini kontrol edin

### CORS Hataları

Backend'de CORS ayarlarını kontrol edin:

```javascript
app.use(cors({
  origin: ['https://clktechtr.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Database Bağlantı Hataları

- Supabase URL ve Service Key'in doğru olduğunu kontrol edin
- Supabase'de RLS (Row Level Security) ayarlarını kontrol edin

## Otomatik Deployment

Her commit'te otomatik deployment için:

1. Vercel otomatik olarak main branch'deki değişiklikleri deploy eder
2. Render'da "Auto-Deploy" seçeneğini aktif edin

## Monitoring

- Render Dashboard'da logs'ları takip edin
- Vercel Analytics'i aktif edin
- Supabase Dashboard'da database performansını izleyin
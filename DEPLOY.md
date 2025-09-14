# CLKtech Deployment Guide

Bu rehber, CLKtech uygulamasının Render (backend) ve Vercel (frontend) üzerine nasıl deploy edileceğini açıklar.

## Genel Bakış

Uygulama iki parçaya ayrılmıştır:
1. **Backend**: Node.js Express API - Render üzerinde host edilecek
2. **Frontend**: React uygulaması - Vercel üzerinde host edilecek

## 1. Backend Deployment (Render)

### Render Üzerinde Yeni Bir Web Service Oluşturma

1. [Render Dashboard](https://dashboard.render.com/)'a giriş yapın
2. "New +" butonuna tıklayın ve "Web Service"i seçin
3. GitHub reponuzu bağlayın veya "Public Git repository" seçeneğini kullanın
4. Aşağıdaki bilgileri doldurun:
   - **Name**: `clktech-backend` (veya istediğiniz bir isim)
   - **Region**: Size en yakın bölge
   - **Branch**: `main` (veya kullandığınız branch)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm start`

5. "Advanced" bölümünü açın ve aşağıdaki environment variable'ları ekleyin:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (veya Render'ın otomatik atamasına bırakabilirsiniz)
   - `SUPABASE_URL`: Supabase URL'iniz
   - `SUPABASE_SERVICE_KEY`: Supabase servis anahtarınız
   - `JWT_SECRET`: Güvenli bir JWT secret (veya Render'ın otomatik oluşturmasına izin verin)

6. "Create Web Service" butonuna tıklayın

### Alternatif: render.yaml Kullanımı

Repo'da bulunan `render.yaml` dosyasını kullanarak Render Blueprint ile otomatik deployment yapabilirsiniz:

1. Render Dashboard'da "Blueprints" bölümüne gidin
2. "New Blueprint Instance" butonuna tıklayın
3. GitHub reponuzu seçin
4. Gerekli environment variable'ları doldurun
5. "Apply" butonuna tıklayın

## 2. Frontend Deployment (Vercel)

### Vercel Üzerinde Yeni Bir Proje Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub reponuzu import edin
4. Aşağıdaki ayarları yapılandırın:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

5. "Environment Variables" bölümünde, aşağıdaki değişkenleri ekleyin:
   - `NODE_ENV`: `production`

6. "Deploy" butonuna tıklayın

## 3. Backend URL'ini Frontend'e Bağlama

Backend Render URL'inizi aldıktan sonra, frontend'in API isteklerini doğru adrese yönlendirmesi için:

1. Vercel projenizin "Settings" bölümüne gidin
2. "Environment Variables" sekmesine tıklayın
3. Aşağıdaki değişkeni ekleyin:
   - `VITE_API_URL`: `https://clktech-backend.onrender.com` (Render'daki backend URL'iniz)

4. "Save" butonuna tıklayın ve yeniden deploy edin

## 4. CORS Ayarları

Backend'de CORS ayarlarının frontend domain'inize izin verdiğinden emin olun. Bu, `server/index.ts` dosyasında yapılandırılmıştır.

## 5. Deployment Sonrası Kontrol

1. Frontend URL'inizi ziyaret edin ve uygulamanın çalıştığını doğrulayın
2. API endpoint'lerinin çalıştığını kontrol edin (örn. `https://clktech-backend.onrender.com/api/health`)
3. Herhangi bir CORS hatası olmadığından emin olun

## Sorun Giderme

- **API İstekleri Başarısız Oluyorsa**: Vercel'deki `vercel.json` dosyasındaki rewrite kurallarını kontrol edin
- **CORS Hataları**: Backend'deki CORS ayarlarını güncelleyin
- **Build Hataları**: Build loglarını kontrol edin ve gerekli bağımlılıkların yüklendiğinden emin olun
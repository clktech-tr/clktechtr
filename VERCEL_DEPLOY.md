# Vercel Deployment Kılavuzu

Bu kılavuz, CLKtech uygulamasının frontend kısmını Vercel'e nasıl deploy edeceğinizi açıklar.

## Ön Koşullar

1. Bir Vercel hesabı
2. Vercel CLI (isteğe bağlı)

## Vercel CLI ile Deploy Etme

1. Vercel CLI'yi yükleyin:
   ```bash
   npm install -g vercel
   ```

2. Vercel hesabınıza giriş yapın:
   ```bash
   vercel login
   ```

3. Proje dizininde deploy komutunu çalıştırın:
   ```bash
   vercel
   ```

4. Sorulara yanıt verin ve deploy işlemini tamamlayın.

## Vercel Dashboard ile Deploy Etme

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub reponuzu import edin
4. Aşağıdaki ayarları yapılandırın:
   - **Framework Preset**: "Other"
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

5. "Environment Variables" bölümünde, aşağıdaki değişkenleri ekleyin:
   - `NODE_ENV`: `production`
   - `VITE_API_URL`: `https://clktech-backend.onrender.com`

6. "Deploy" butonuna tıklayın

## Sorun Giderme

### Vite Paketi Bulunamadı Hatası

Eğer "Cannot find package 'vite'" hatası alırsanız, bu sorun vercel-build.js dosyasında yapılan değişikliklerle çözülmüştür. Bu dosya:
- Build işlemi öncesinde dev dependencies'leri yükler
- Vite config dosyasının varlığını kontrol eder
- Build sürecini optimize eder

### Çevre Değişkenleri Sorunu

Eğer çevre değişkenleriyle ilgili sorunlar yaşarsanız, Vercel dashboard'dan projenizin "Environment Variables" bölümünde gerekli değişkenleri tanımladığınızdan emin olun.

### API İstekleri Başarısız Oluyorsa

Eğer API istekleri başarısız oluyorsa, vercel.json dosyasındaki rewrite kurallarını kontrol edin ve backend URL'inin doğru olduğundan emin olun.

## Önemli Notlar

- Frontend Vercel'de, backend ise Render'da çalışacaktır.
- CORS ayarlarının doğru yapılandırıldığından emin olun.
- Vercel'de deploy edilen frontend, API isteklerini Render'daki backend'e yönlendirecektir.
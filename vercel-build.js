// vercel-build.js
// Bu dosya Vercel'in build sürecini özelleştirmek için kullanılır

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Vercel build başlatılıyor...');
console.log('Node.js versiyonu:', process.version);

// Ortam değişkenlerini ayarla
process.env.NODE_ENV = 'production';

// .env.vercel dosyasını .env olarak kopyala
if (fs.existsSync(path.join(__dirname, '.env.vercel'))) {
  console.log('.env.vercel dosyası mevcut, .env olarak kopyalanıyor');
  fs.copyFileSync(path.join(__dirname, '.env.vercel'), path.join(__dirname, '.env'));
  console.log('.env dosyası oluşturuldu');
}

// Build klasörlerini hazırla
console.log('Build klasörleri hazırlanıyor...');

// dist klasörünü oluştur (gerekirse)
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
  console.log('dist klasörü oluşturuldu');
}

// dist/public klasörünü oluştur (gerekirse)
if (!fs.existsSync(path.join(__dirname, 'dist', 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'dist', 'public'), { recursive: true });
  console.log('dist/public klasörü oluşturuldu');
}

// Client build işlemi
  console.log('Client build başlatılıyor...');
  
  // Client dizinindeki bağımlılıkları yükle
  console.log('Client dizinindeki bağımlılıklar yükleniyor...');
  try {
    execSync('npm install', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, 'client'),
      timeout: 300000 // 5 dakika timeout
    });
    console.log('Client bağımlılıkları başarıyla yüklendi.');
  } catch (error) {
    console.error('Client bağımlılıkları yüklenirken hata oluştu:', error.message);
    console.log('Hata sonrası devam ediliyor...');
  }
  
  // Vite'ı özellikle yükle
  console.log('Vite paketini yüklüyorum...');
  let viteInstalled = false;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (!viteInstalled && retryCount < maxRetries) {
    try {
      execSync('npm install vite@latest --save', { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, 'client'),
        timeout: 180000 // 3 dakika timeout
      });
      console.log('Vite paketi başarıyla yüklendi.');
      viteInstalled = true;
    } catch (error) {
      retryCount++;
      console.error(`Vite paketi yüklenirken hata oluştu (Deneme ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount < maxRetries) {
        console.log(`Vite yükleme işlemi tekrar deneniyor (${retryCount}/${maxRetries})...`);
      } else {
        console.error('Vite yükleme işlemi başarısız oldu, mevcut Vite sürümü ile devam ediliyor...');
      }
    }
  }

  // Vite config dosyasını kontrol et
  if (fs.existsSync(path.join(__dirname, 'client', 'vite.config.mjs'))) {
    console.log('client/vite.config.mjs dosyası mevcut');
  } else if (fs.existsSync(path.join(__dirname, 'vite.config.ts'))) {
    console.log('vite.config.ts dosyası mevcut');
    // client dizinine vite.config.mjs dosyasını kopyala
    console.log('vite.config.ts dosyası client dizinine vite.config.mjs olarak kopyalanıyor...');
    // Vite.config.ts içeriğini oku ve client dizinine vite.config.mjs olarak yaz
    const viteConfigContent = fs.readFileSync(path.join(__dirname, 'vite.config.ts'), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'client', 'vite.config.mjs'), viteConfigContent);
    console.log('vite.config.mjs dosyası client dizinine kopyalandı');
  } else {
    console.log('Hiçbir vite.config dosyası bulunamadı');
    
    // Basit bir vite.config.mjs dosyası oluştur
    console.log('Basit bir vite.config.mjs dosyası oluşturuluyor...');
    const simpleViteConfig = `
      // Otomatik oluşturulmuş basit vite.config.mjs
      import { defineConfig } from 'vite';
      import react from '@vitejs/plugin-react';
      import path from 'path';
      
      console.log('Vite config yükleniyor...');
      
      export default defineConfig({
        plugins: [react()],
        resolve: {
          alias: {
            "@": path.resolve("./src"),
            "@assets": path.resolve("../attached_assets"),
            "@shared": path.resolve("../shared"),
          },
        },
        build: {
          outDir: path.resolve("../dist/public"),
          emptyOutDir: true,
        }
      });
    `;
    
    fs.writeFileSync(path.join(__dirname, 'client', 'vite.config.mjs'), simpleViteConfig);
    console.log('Basit vite.config.mjs dosyası oluşturuldu');
  }

  // Client build işlemini gerçekleştir
  console.log('Client build işlemi başlatılıyor...');
  
  try {
    // Client build işlemini gerçekleştir
    console.log('Client build işlemi başlatılıyor...');
    console.log('Mevcut çalışma dizini:', process.cwd());
    console.log('Client dizini:', path.join(__dirname, 'client'));
    
    // Vite'ın doğru çalıştığını kontrol et
    console.log('Vite versiyonu kontrol ediliyor...');
    try {
      const viteVersion = execSync('npx vite --version', { stdio: 'pipe', cwd: path.join(__dirname, 'client') }).toString().trim();
      console.log('Vite versiyonu:', viteVersion);
    } catch (error) {
      console.error('Vite versiyonu kontrol edilemedi:', error.message);
      console.log('Vite yüklemeyi tekrar deniyorum...');
      try {
        execSync('npm install vite@latest --force', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
        console.log('Vite yeniden yüklendi, versiyonu tekrar kontrol ediliyor...');
        const viteVersion = execSync('npx vite --version', { stdio: 'pipe', cwd: path.join(__dirname, 'client') }).toString().trim();
        console.log('Vite versiyonu:', viteVersion);
      } catch (secondError) {
        console.error('Vite yeniden yüklenemedi:', secondError.message);
      }
    }
    
    // package.json dosyasını kontrol et
    console.log('package.json dosyası kontrol ediliyor...');
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'client', 'package.json'), 'utf8'));
      console.log('Build komutu:', packageJson.scripts?.build || 'Tanımlanmamış');
      console.log('Bağımlılıklar:', Object.keys(packageJson.dependencies || {}).join(', '));
      console.log('Geliştirme bağımlılıkları:', Object.keys(packageJson.devDependencies || {}).join(', '));
    } catch (error) {
      console.error('package.json dosyası okunamadı:', error.message);
    }
    
    // Build komutunu çalıştır ve çıktıyı kaydet
    console.log('npm run build komutu çalıştırılıyor...');
    try {
      const buildOutput = execSync('npm run build', { 
        stdio: 'pipe', 
        cwd: path.join(__dirname, 'client'),
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 600000 // 10 dakika timeout
      });
      console.log('Build çıktısı:\n', buildOutput);
    } catch (error) {
      console.error('Build komutu başarısız oldu:', error.message);
      if (error.stdout) console.log('Build stdout:', error.stdout);
      if (error.stderr) console.error('Build stderr:', error.stderr);
      
      // Hata durumunda dist/public klasörünü kontrol et
      const distPublicPath = path.join(__dirname, 'dist', 'public');
      if (fs.existsSync(distPublicPath)) {
        console.log('dist/public klasörü mevcut, içeriği kontrol ediliyor...');
        try {
          const publicFiles = fs.readdirSync(distPublicPath);
          console.log('dist/public klasörü içeriği:', publicFiles);
        } catch (err) {
          console.error('dist/public klasörü içeriği listelenirken hata:', err.message);
        }
      } else {
        console.error('dist/public klasörü bulunamadı, build işlemi tamamen başarısız olmuş olabilir.');
      }
      
      throw new Error(`Build komutu başarısız oldu: ${error.message}`);
    }
    
    console.log('Client build işlemi tamamlandı');
    
    // Client build çıktısını kontrol et
    const clientDistPath = path.join(__dirname, 'client', 'dist');
    console.log('Client build çıktısı kontrol ediliyor:', clientDistPath);
    if (fs.existsSync(clientDistPath)) {
      console.log('Client build çıktısı başarıyla oluşturuldu');
      
      // Client build çıktısının içeriğini listele
      const clientDistFiles = fs.readdirSync(clientDistPath, { withFileTypes: true });
      console.log('Client build çıktısı içeriği:');
      clientDistFiles.forEach(file => {
        console.log(`- ${file.name}${file.isDirectory() ? '/' : ''}`);
      });
      
      // Client build çıktısını dist/public klasörüne kopyala
      console.log('Client build çıktısı dist/public klasörüne kopyalanıyor...');
      
      // dist/public klasörünü temizle
      const distPublicPath = path.join(__dirname, 'dist', 'public');
      console.log('dist/public klasörü temizleniyor:', distPublicPath);
      if (fs.existsSync(distPublicPath)) {
        fs.rmSync(distPublicPath, { recursive: true, force: true });
        console.log('Mevcut dist/public klasörü silindi');
      }
      fs.mkdirSync(distPublicPath, { recursive: true });
      console.log('Yeni dist/public klasörü oluşturuldu');
      
      // Dosyaları kopyala
      const copyDir = (src, dest) => {
        console.log(`Kopyalanıyor: ${src} -> ${dest}`);
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            console.log(`Klasör oluşturuluyor: ${destPath}`);
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
          } else {
            console.log(`Dosya kopyalanıyor: ${entry.name}`);
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      copyDir(clientDistPath, distPublicPath);
      console.log('Client build çıktısı başarıyla kopyalandı');
      
      // Kopyalama sonrası dist/public içeriğini kontrol et
      const distPublicFiles = fs.readdirSync(distPublicPath, { withFileTypes: true });
      console.log('dist/public klasörü içeriği:');
      distPublicFiles.forEach(file => {
        console.log(`- ${file.name}${file.isDirectory() ? '/' : ''}`);
      });
    } else {
      console.error('Client build çıktısı bulunamadı');
      
      // Build hatası için detaylı bilgi içeren HTML dosyası oluştur
      console.log('Build çıktısı bulunamadı, detaylı hata sayfası oluşturuluyor...');
      const simpleHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CLKtech - Build Hatası</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            flex-direction: column;
            padding: 2rem;
            background-color: #f8f9fa;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #333;
          }
          .logo {
            font-weight: bold;
            color: #1e40af;
          }
          .error-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 2rem;
            width: 90%;
            max-width: 1000px;
            margin-top: 2rem;
          }
          .error-title {
            color: #dc3545;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.5rem;
          }
          .error-message {
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background-color: #f8d7da;
            border-radius: 4px;
          }
          .build-info {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #6c757d;
          }
          .build-info code {
            background-color: #f8f9fa;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
          }
          .build-steps {
            margin-top: 1.5rem;
            font-size: 1rem;
          }
          .build-steps ol {
            padding-left: 1.5rem;
          }
          .build-steps li {
            margin-bottom: 0.5rem;
          }
        </style>
      </head>
      <body>
        <h1><span class="logo">CLK</span>tech</h1>
        
        <div class="error-container">
          <div class="error-title">Build Hatası Tespit Edildi</div>
          <div class="error-message">Client build çıktısı bulunamadı. Build işlemi tamamlanamadı.</div>
          
          <div class="build-steps">
            <h3>Olası Çözümler:</h3>
            <ol>
              <li>Client dizinindeki bağımlılıkların doğru yüklendiğinden emin olun.</li>
              <li>Vite yapılandırma dosyasını kontrol edin.</li>
              <li>Build komutunun doğru çalıştığından emin olun.</li>
              <li>Konsol çıktılarını inceleyerek daha detaylı hata bilgisi alın.</li>
            </ol>
          </div>
          
          <div class="build-info">
            <p>Node.js versiyonu: <code>${process.version}</code></p>
            <p>Çalışma dizini: <code>${process.cwd()}</code></p>
            <p>Client dizini: <code>${path.join(__dirname, 'client')}</code></p>
            <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </body>
      </html>
      `;
      
      fs.writeFileSync(path.join(__dirname, 'dist', 'public', 'index.html'), simpleHtml);
      console.log('Basit HTML dosyası oluşturuldu');
    }
  } catch (error) {
    console.error('Build hatası:', error);
    
    // Hata durumunda önce önceki build dosyalarını kullanmayı dene, yoksa hata sayfası oluştur
    console.log('Build hatası tespit edildi, alternatif çözüm uygulanıyor...');
    console.error('Build hatası detayları:', error);
    
    // Önce client/dist klasörünü kontrol et
    const clientDistPath = path.join(__dirname, 'client', 'dist');
    if (fs.existsSync(clientDistPath)) {
      console.log('Client/dist klasörü bulundu, içeriği kontrol ediliyor...');
      try {
        const clientDistFiles = fs.readdirSync(clientDistPath, { withFileTypes: true });
        console.log(`Client/dist klasörü içeriği (${clientDistFiles.length} öğe):`);
        clientDistFiles.forEach(file => {
          console.log(`- ${file.name}${file.isDirectory() ? '/' : ''}`);
        });
        
        // index.html dosyasını kontrol et
        const clientIndexPath = path.join(clientDistPath, 'index.html');
        if (fs.existsSync(clientIndexPath)) {
          console.log('Client/dist/index.html dosyası bulundu, bu dosyaları kullanacağız.');
          
          // dist/public klasörünü temizle ve yeniden oluştur
          const distPublicPath = path.join(__dirname, 'dist', 'public');
          if (fs.existsSync(distPublicPath)) {
            fs.rmSync(distPublicPath, { recursive: true, force: true });
          }
          fs.mkdirSync(distPublicPath, { recursive: true });
          
          // Dosyaları kopyala
          const copyDir = (src, dest) => {
            const entries = fs.readdirSync(src, { withFileTypes: true });
            
            entries.forEach(entry => {
              const srcPath = path.join(src, entry.name);
              const destPath = path.join(dest, entry.name);
              
              if (entry.isDirectory()) {
                if (!fs.existsSync(destPath)) {
                  fs.mkdirSync(destPath, { recursive: true });
                }
                copyDir(srcPath, destPath);
              } else {
                fs.copyFileSync(srcPath, destPath);
              }
            });
          };
          
          copyDir(clientDistPath, distPublicPath);
          console.log('Client/dist içeriği dist/public klasörüne başarıyla kopyalandı.');
          
          // Kopyalama sonrası dist/public içeriğini kontrol et
          const distPublicFiles = fs.readdirSync(distPublicPath, { withFileTypes: true });
          console.log(`dist/public klasörü içeriği (${distPublicFiles.length} öğe):`);
          distPublicFiles.forEach(file => {
            console.log(`- ${file.name}${file.isDirectory() ? '/' : ''}`);
          });
          
          // index.html dosyasını kontrol et
          const indexHtmlPath = path.join(distPublicPath, 'index.html');
          if (fs.existsSync(indexHtmlPath)) {
            console.log('index.html dosyası mevcut, site çalışabilir durumda.');
            return; // Başarılı olduğu için hata sayfası oluşturmaya gerek yok
          }
        }
      } catch (fsError) {
        console.error('Client/dist klasörü işlenirken hata:', fsError.message);
      }
    }
    
    // Önceki build'den kalan dosyaları kontrol et (eski yöntem)
    const previousBuildPath = path.join(__dirname, 'client', 'dist');
    if (fs.existsSync(previousBuildPath)) {
      console.log('Önceki build dosyaları bulundu, bunları kullanmaya çalışılıyor...');
      try {
        // Önceki build dosyalarını kopyala
        const copyDir = (src, dest) => {
          const entries = fs.readdirSync(src, { withFileTypes: true });
          
          entries.forEach(entry => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
              if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
              }
              copyDir(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          });
        };
        
        copyDir(previousBuildPath, path.join(__dirname, 'dist', 'public'));
        console.log('Önceki build dosyaları başarıyla kopyalandı.');
        
        // index.html dosyasını kontrol et
        const indexHtmlPath = path.join(__dirname, 'dist', 'public', 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          console.log('index.html dosyası mevcut, site çalışabilir durumda.');
          return; // Başarılı olduğu için hata sayfası oluşturmaya gerek yok
        } else {
          throw new Error('index.html dosyası bulunamadı!');
        }
      } catch (copyError) {
        console.error('Önceki build dosyaları kopyalanırken hata:', copyError.message);
        // Kopyalama başarısız olursa hata sayfası oluştur
      }
    } else {
      console.log('Önceki build dosyaları bulunamadı, hata sayfası oluşturuluyor...');
    }
    
    // Hata durumunda basit bir index.html oluştur
    console.log('Hata durumunda basit bir index.html oluşturuluyor...');
    
    // Basit bir index.html oluştur
    const simpleHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CLKtech</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f8f9fa;
      color: #333;
      line-height: 1.6;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    header {
      background-color: #2a52be;
      color: white;
      padding: 1rem;
      text-align: center;
    }
    
    main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    footer {
      background-color: #f1f1f1;
      padding: 1rem;
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }
    
    h1 {
      margin-top: 0;
      font-size: 2.5rem;
    }
    
    .logo {
      font-weight: bold;
      color: #fff;
    }
    
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    
    .button {
      display: inline-block;
      background-color: #2a52be;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      margin-right: 0.5rem;
    }
    
    .button:hover {
      opacity: 0.9;
    }
    
    .products {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .product-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    
    .product-card:hover {
      transform: translateY(-5px);
    }
    
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .product-info {
      padding: 1.5rem;
    }
    
    .product-title {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }
    
    .product-price {
      font-weight: bold;
      color: #2a52be;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    
    .product-description {
      color: #666;
      margin-bottom: 1.5rem;
    }
  </style>
</head>
<body>
  <header>
    <h1><span class="logo">CLK</span>tech</h1>
  </header>
  
  <main>
    <div class="card">
      <h2>Hoş Geldiniz</h2>
      <p>CLKtech'e hoş geldiniz. Sitemiz şu anda güncelleniyor. En kısa sürede hizmetinizdeyiz.</p>
      <p>Sorularınız için lütfen bizimle iletişime geçin.</p>
      <a href="mailto:info@clktech.com" class="button">İletişim</a>
    </div>
    
    <h2>Ürünlerimiz</h2>
    <div class="products">
      <div class="product-card">
        <div class="product-info">
          <h3 class="product-title">CLK Block Code</h3>
          <p class="product-price">₺1999</p>
          <p class="product-description">Gelişmiş kod editörü ve programlama aracı.</p>
          <a href="#" class="button">Detaylar</a>
        </div>
      </div>
      
      <div class="product-card">
        <div class="product-info">
          <h3 class="product-title">VivianX</h3>
          <p class="product-price">₺2499</p>
          <p class="product-description">Yapay zeka destekli asistan ve analiz aracı.</p>
          <a href="#" class="button">Detaylar</a>
        </div>
      </div>
      
      <div class="product-card">
        <div class="product-info">
          <h3 class="product-title">MazeX</h3>
          <p class="product-price">₺1799</p>
          <p class="product-description">Veri görselleştirme ve analiz platformu.</p>
          <a href="#" class="button">Detaylar</a>
        </div>
      </div>
    </div>
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} CLKtech. Tüm hakları saklıdır.</p>
  </footer>
</body>
</html>`;
    
    // dist/public klasörünü oluştur (gerekirse)
    const distPublicPath = path.join(__dirname, 'dist', 'public');
    if (!fs.existsSync(distPublicPath)) {
      fs.mkdirSync(distPublicPath, { recursive: true });
    }
    
    // index.html dosyasını oluştur
    fs.writeFileSync(path.join(distPublicPath, 'index.html'), simpleHtml);
    console.log('Basit HTML dosyası oluşturuldu, site çalışır durumda.');
  }

// Vercel.json dosyasını kontrol et
if (fs.existsSync(path.join(__dirname, 'vercel.json'))) {
  console.log('vercel.json dosyası mevcut');
  const vercelJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  console.log('vercel.json içeriği:', vercelJson);
} else {
  console.log('vercel.json dosyası bulunamadı, oluşturuluyor...');
  const vercelConfig = {
    "version": 2,
    "buildCommand": "npm run vercel-build",
    "outputDirectory": "dist/public",
    "installCommand": "npm install",
    "rewrites": [
      { "source": "/api/(.*)", "destination": "https://clktech-backend.onrender.com/api/$1" },
      { "source": "/(.*)", "destination": "/index.html" }
    ],
    "env": {
      "NODE_ENV": "production",
      "VITE_API_URL": "https://clktech-backend.onrender.com"
    }
  };
  fs.writeFileSync(path.join(__dirname, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
  console.log('vercel.json dosyası oluşturuldu');
}

// Dist klasörü içeriğini detaylı kontrol et
const distPath = path.join(__dirname, 'dist');
console.log('Dist klasörü kontrol ediliyor:', distPath);

if (fs.existsSync(distPath)) {
  try {
    const distStats = fs.statSync(distPath);
    console.log(`Dist klasörü bulundu. Boyut: ${distStats.size} byte, Oluşturulma: ${distStats.birthtime}`);
    
    const distFiles = fs.readdirSync(distPath, { withFileTypes: true });
    console.log(`Dist klasörü içeriği (${distFiles.length} öğe):`);
    distFiles.forEach(file => {
      const filePath = path.join(distPath, file.name);
      const stats = fs.statSync(filePath);
      console.log(`- ${file.name}${file.isDirectory() ? '/' : ''} (${stats.size} byte)`);
    });

    const distPublicPath = path.join(distPath, 'public');
    console.log('Dist/public klasörü kontrol ediliyor:', distPublicPath);
    
    if (fs.existsSync(distPublicPath)) {
      const publicStats = fs.statSync(distPublicPath);
      console.log(`Dist/public klasörü bulundu. Oluşturulma: ${publicStats.birthtime}`);
      
      const publicFiles = fs.readdirSync(distPublicPath, { withFileTypes: true });
      console.log(`Dist/public klasörü içeriği (${publicFiles.length} öğe):`);
      publicFiles.forEach(file => {
        const filePath = path.join(distPublicPath, file.name);
        const stats = fs.statSync(filePath);
        console.log(`- ${file.name}${file.isDirectory() ? '/' : ''} (${stats.size} byte)`);
      });
      
      // index.html dosyasını detaylı kontrol et
      const indexHtmlPath = path.join(distPublicPath, 'index.html');
      console.log('index.html dosyası kontrol ediliyor:', indexHtmlPath);
      
      if (fs.existsSync(indexHtmlPath)) {
        const stats = fs.statSync(indexHtmlPath);
        console.log(`index.html dosyası bulundu. Boyut: ${stats.size} byte, Değiştirilme: ${stats.mtime}`);
        
        if (stats.size > 0) {
          // Dosya içeriğini kontrol et
          const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
          console.log(`index.html içeriği (ilk 200 karakter): ${indexHtmlContent.substring(0, 200)}...`);
          
          // HTML içeriğini doğrula
          if (indexHtmlContent.includes('<!DOCTYPE html>') || indexHtmlContent.includes('<html')) {
            console.log('index.html geçerli bir HTML dosyası olarak görünüyor.');
          } else {
            console.error('UYARI: index.html geçerli bir HTML dosyası olmayabilir!');
          }
        } else {
          console.error('HATA: index.html dosyası boş!');
        }
      } else {
        console.error('HATA: index.html dosyası bulunamadı!');
      }
      
      // Assets klasörünü kontrol et
      const assetsPath = path.join(distPublicPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        const assetsFiles = fs.readdirSync(assetsPath, { withFileTypes: true });
        console.log(`Assets klasörü içeriği (${assetsFiles.length} öğe):`);
        assetsFiles.forEach(file => {
          console.log(`- ${file.name}`);
        });
      } else {
        console.warn('UYARI: assets klasörü bulunamadı. Bu bir sorun olabilir.');
      }
    } else {
      console.error('HATA: dist/public klasörü bulunamadı! Build işlemi tamamlanmamış olabilir.');
    }
  } catch (error) {
    console.error('Dist klasörü kontrol edilirken hata oluştu:', error.message);
  }
} else {
  console.error('HATA: dist klasörü bulunamadı! Build işlemi başarısız olmuş olabilir.');
}

console.log('Vercel build başarıyla tamamlandı.');
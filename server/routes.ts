import express from 'express';
import type { Express, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

type Request = ExpressRequest & {
  file?: MulterFile;
};
type Response = ExpressResponse;
import { createServer, type Server, type IncomingMessage, type ServerResponse } from "http";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getOrders, getOrder, createOrder, updateOrder, deleteOrder, getContacts, createContact, getAdminByUsername, createAdmin } from './storage.js';
import { insertProductSchema, insertOrderSchema, insertContactSchema } from './schemas.js';
import multer from 'multer';

import path from "path";
import fs from "fs";
import * as jwt from 'jsonwebtoken';
import { supabase } from "./supabaseClient.js";

const JWT_SECRET = process.env.JWT_SECRET || "clktech_secret_key";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: MulterFile, cb: (error: any, acceptFile: boolean) => void) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const downloadsDir = path.join(process.cwd(), "public", "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const zipUpload = multer({
  storage: multer.diskStorage({
    destination: downloadsDir,
    filename: (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  fileFilter: (req: Request, file: MulterFile, cb: (error: any, acceptFile: boolean) => void) => {
    // Dosya uzantısını ve MIME tipini kontrol et
    const extname = path.extname(file.originalname).toLowerCase();
    console.log('Dosya yükleme isteği:', { filename: file.originalname, mimetype: file.mimetype, extname });
    
    // Daha esnek bir kontrol ekleyelim
    if (extname === '.zip' || file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' || 
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Sadece .zip dosyası yükleyebilirsiniz.'), false);
    }
  },
});

// Multer hata yakalama middleware'i
const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
  if (err && err.name === 'MulterError') {
    // Multer hatası (dosya boyutu sınırı aşıldı, vb.)
    console.error('Multer hatası:', err);
    
    // Dosya boyutu hatası için özel mesaj
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxSizeMB = 200; // 200MB
      return res.status(400).json({ 
        message: `Dosya boyutu çok büyük. Maksimum dosya boyutu: ${maxSizeMB}MB` 
      });
    }
    
    return res.status(400).json({ message: `Dosya yükleme hatası: ${err.message}` });
  } else if (err) {
    // Diğer hatalar
    console.error('Dosya yükleme hatası:', err);
    return res.status(500).json({ message: `Dosya yükleme hatası: ${err.message}` });
  }
  next();
};

// Simple admin authentication middleware
const adminAuth = async (req: Request, res: Response, next: any) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(401).json({ message: "Username and password required" });
  }

  const admin = await getAdminByUsername(username);
  if (!admin || (admin as any).password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  next();
};

// JWT ile admin doğrulama middleware
const adminJwtAuth = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader); // DEBUG LOG
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("JWT decoded:", decoded); // DEBUG LOG
    (req as any).admin = decoded;
    next();
  } catch (err) {
    console.log("JWT error:", err); // DEBUG LOG
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Güvenli JSON parse fonksiyonu (her durumda stringe çevirip parse etmeye çalış)
function safeParseJson(val: any) {
  // Eğer değer null veya undefined ise, boş bir nesne döndür
  if (val === null || val === undefined) {
    console.log("safeParseJson: null/undefined value, returning empty object");
    return {};
  }
  
  // Eğer değer zaten bir nesne ise, doğrudan döndür
  if (typeof val === "object" && val !== null) {
    console.log("safeParseJson: already an object, returning as is");
    return val;
  }
  
  // Eğer değer bir string ise, JSON.parse ile parse etmeyi dene
  if (typeof val === "string") {
    try { 
      // Boş string kontrolü
      if (val.trim() === "") {
        console.log("safeParseJson: empty string, returning empty object");
        return {};
      }
      
      const parsed = JSON.parse(val);
      console.log("safeParseJson: successfully parsed string to object");
      return parsed; 
    } catch (e) { 
      console.log("safeParseJson: failed to parse string, error:", e);
      // Eğer geçerli bir JSON değilse ve boş string ise, boş nesne döndür
      if (val.trim() === "") {
        return {};
      }
      return val; 
    }
  }
  
  // Diğer tüm durumlar için, string'e çevirip parse etmeyi dene
  try { 
    const stringVal = String(val);
    if (stringVal.trim() === "") {
      console.log("safeParseJson: empty string after conversion, returning empty object");
      return {};
    }
    
    const parsed = JSON.parse(stringVal);
    console.log("safeParseJson: successfully parsed converted string to object");
    return parsed; 
  } catch (e) { 
    console.log("safeParseJson: failed to parse converted string, error:", e);
    return val; 
  }
}

export async function registerRoutes(app: express.Application): Promise<Server> {
  // Serve uploaded files
  app.use("/api/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  
  // Serve download files
  app.use("/downloads", express.static(path.join(process.cwd(), "public", "downloads")));

  // Health check endpoint for Render
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
  });

  // Public API routes
  
  // Get all products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await getProducts();
      res.json(products);
    } catch (error) {
      console.error("PRODUCTS ERROR:", error); // Hata detayını logla
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product by ID or slug
  app.get("/api/products/:identifier", async (req: Request, res: Response) => {
    try {
      const identifier = req.params.identifier;
      let product;
      
      // Try to get by ID first
      const id = parseInt(identifier);
      if (!isNaN(id)) {
        product = await getProduct(id);
      }
      
      // If not found by ID, try to get by slug
      if (!product) {
        const products = await getProducts();
        product = products.find((p: any) => p.slug === identifier);
      }
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Create order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", details: error instanceof Error ? error.message : error });
    }
  });

  // Create contact
  app.post("/api/contacts", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data", details: error instanceof Error ? error.message : error });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Email and password required" });
    }
    
    // Sabit admin bilgileri ile kontrol et
    if (email === 'admin@clktech.com' && password === 'admin') {
      const token = jwt.sign({ email: 'admin@clktech.com', id: 1 }, JWT_SECRET, { expiresIn: "2h" });
      return res.json({ message: "Login successful", token, user: { id: 1, email: 'admin@clktech.com' } });
    }
    
    try {
      // Supabase'den admin bilgilerini al
      const result: any = await getAdminByUsername('admin');
      const data = result?.data;
      const err = result?.error;
      
      if (err) {
        console.error("Admin arama hatası:", err);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!data) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Şifre kontrolü
      if ((data as any).password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // JWT oluştur
      const token = jwt.sign({ email: (data as any).email, id: (data as any).id }, JWT_SECRET, { expiresIn: "2h" });
      return res.json({ message: "Login successful", token, user: { id: (data as any).id, email: (data as any).email } });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin-only routes

  // Get all orders (admin only)
  app.get("/api/admin/orders", adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const orders = await getOrders() || [];
      res.json(orders);
    } catch (error) {
      console.error("ORDERS ERROR:", error); // Hata detayını logla
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update order status or notes (admin only)
  app.patch("/api/admin/orders/:id", adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      let order = await getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (typeof status !== 'undefined') {
        order = await updateOrder(id, { status });
      }
      if (typeof notes !== 'undefined') {
        order = await updateOrder(id, { notes });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Delete order (admin only)
  app.delete("/api/admin/orders/:id", adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await deleteOrder(id);
      if (!deleted) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Get all contacts (admin only)
  app.get("/api/admin/contacts", adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const contacts = await getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // İletişim mesajı sil (admin only)
  app.delete("/api/admin/contacts/:id", adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) return res.status(500).json({ message: "Failed to delete contact", details: error.message });
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Create product (admin only)
  app.post("/api/admin/products", adminJwtAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
      console.log("Product data received:", req.body);
      console.log("File received:", req.file);
      
      // Slug kontrolü
      if (!req.body.slug || req.body.slug.trim() === "") {
        return res.status(400).json({ 
          message: "Invalid product data", 
          details: "Slug field is required" 
        });
      }
      
      // Veri dönüşümü
      const productData = {
        ...req.body,
        inStock: req.body.inStock === "true" || req.body.inStock === true,
        image: req.file ? `/api/uploads/${req.file.filename}` : req.body.image,
        name: safeParseJson(req.body.name),
        description: safeParseJson(req.body.description),
        fullDescription: safeParseJson(req.body.fullDescription),
        price: safeParseJson(req.body.price),
        specs: safeParseJson(req.body.specs),
        externalLinks: safeParseJson(req.body.externalLinks),
      };
      
      // Zorunlu alanların kontrolü
      if (!productData.name?.tr || !productData.name?.en) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          details: "Product name is required in both Turkish and English" 
        });
      }
      
      if (!productData.category) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          details: "Category is required" 
        });
      }
      
      console.log("Processed product data:", JSON.stringify(productData, null, 2));
      
      // Ürün oluşturma
      const product = await createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Product creation error:", error);
      
      if (error instanceof Error && "errors" in error) {
        // ZodError
        return res.status(400).json({ message: "Invalid product data", details: (error as any).errors });
      }
      res.status(400).json({ message: "Invalid product data", details: (error as Error).message || error });
    }
  });

  // Update product (admin only)
  app.patch("/api/admin/products/:id", adminJwtAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
      console.log("Product update data received:", req.body);
      console.log("File received for update:", req.file);
      
      const id = parseInt(req.params.id);
      
      // Slug kontrolü
      if (!req.body.slug || req.body.slug.trim() === "") {
        return res.status(400).json({ 
          message: "Invalid product data", 
          details: "Slug field is required" 
        });
      }
      
      // Veri dönüşümü
      const updateData = {
        ...req.body,
        inStock: req.body.inStock === "true" || req.body.inStock === true,
        ...(req.file && { image: `/api/uploads/${req.file.filename}` }),
        name: safeParseJson(req.body.name),
        description: safeParseJson(req.body.description),
        fullDescription: safeParseJson(req.body.fullDescription),
        price: safeParseJson(req.body.price),
        specs: safeParseJson(req.body.specs),
        externalLinks: safeParseJson(req.body.externalLinks),
      };
      
      // Zorunlu alanların kontrolü (güncelleme olduğu için sadece gönderilen alanları kontrol ediyoruz)
      if (req.body.name && (!updateData.name?.tr || !updateData.name?.en)) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          details: "Product name is required in both Turkish and English" 
        });
      }
      
      console.log("Processed update data:", JSON.stringify(updateData, null, 2));
      
      const parsedData = insertProductSchema.partial().parse(updateData);
      const product = await updateProduct(id, parsedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        // ZodError
        return res.status(400).json({ message: "Invalid product data", details: (error as any).errors });
      }
      res.status(400).json({ message: "Invalid product data", details: (error as Error).message || error });
    }
  });

  // Delete product (admin only)
  app.delete("/api/admin/products/:id", adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // ZIP dosyası yükleme (admin only)
  app.post("/api/admin/upload-download", 
    adminJwtAuth, 
    (req: Request, res: Response, next: any) => {
      console.log('ZIP dosyası yükleme isteği alındı');
      next();
    }, 
    (req: Request, res: Response, next: any) => {
      // Dosya yükleme işlemini try-catch bloğu içinde gerçekleştir
      try {
        zipUpload.single('file')(req, res, (err: any) => {
          if (err) {
            // handleMulterError middleware'ini manuel olarak çağır
            return handleMulterError(err, req, res, next);
          }
          next();
        });
      } catch (error) {
        console.error('Dosya yükleme hatası (genel):', error);
        return res.status(500).json({ message: "Dosya yükleme işlemi başarısız oldu.", details: (error as Error).message });
      }
    },
    async (req: Request, res: Response) => {
      try {
        console.log('ZIP dosyası yükleme işlemi tamamlandı', req.file);
        if (!req.file) {
          return res.status(400).json({ message: "Dosya yüklenemedi. Lütfen geçerli bir ZIP dosyası seçin." });
        }
        // Dosya yolu: /downloads/filename.zip
        const url = `/downloads/${req.file.filename}`;
        res.json({ url });
      } catch (error) {
        console.error('ZIP dosyası yükleme hatası:', error);
        res.status(500).json({ message: "Dosya yüklenemedi.", details: (error as Error).message });
      }
    }
  );

  // Görsel yükleme (admin only)
  app.post("/api/admin/products/upload-image", adminJwtAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Görsel yüklenemedi." });
      }
      // Dosya yolu: /api/uploads/filename.jpg
      const url = `/api/uploads/${req.file.filename}`;
      res.json({ url });
    } catch (error) {
      res.status(500).json({ message: "Görsel yüklenemedi.", details: (error as Error).message });
    }
  });

  // Get admin stats
  app.get("/api/admin/stats", adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const products = await getProducts() || [];
      const orders = await getOrders() || [];
      const contacts = await getContacts() || [];
      
      const stats = {
        totalProducts: products.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        totalSales: orders.reduce((sum: any, order: any) => {
          const price = typeof order.price === 'number' ? order.price : parseFloat(order.price || '0');
          return sum + (isNaN(price) ? 0 : price);
        }, 0),
        totalOrders: orders.length,
        totalContacts: contacts.length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("STATS ERROR:", error); // Hata detayını logla
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Site ayarlarını getir (admin)
  app.get('/api/admin/settings', adminJwtAuth, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error) return res.status(500).json({ message: 'Failed to fetch settings', details: error.message });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  // Site ayarlarını güncelle (admin)
  app.patch('/api/admin/settings', adminJwtAuth, async (req: Request, res: Response) => {
    try {
      console.log('Ayarlar güncelleme isteği alındı:', req.body);
      
      // Mevcut ayarları getir
      const { data: current, error: getError } = await supabase.from('settings').select('*').single();
      if (getError) {
        console.error('Ayarlar getirme hatası:', getError);
        
        // downloadUrl sütunu hatası için özel mesaj
        if (getError.message && getError.message.includes("downloadUrl")) {
          return res.status(500).json({ 
            message: 'Veritabanı şema hatası: downloadUrl sütunu bulunamadı', 
            details: 'Lütfen Supabase SQL Editor\'da şu sorguyu çalıştırın: ALTER TABLE settings ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;' 
          });
        }
        
        return res.status(500).json({ message: 'Ayarlar getirilemedi', details: getError.message });
      }
      
      if (!current) {
        console.error('Ayarlar bulunamadı');
        return res.status(404).json({ message: 'Ayarlar bulunamadı' });
      }
      
      // Boolean değerleri doğru şekilde işle
      const updatedSettings = { ...req.body };
      
      // havale ve harici boolean değerlerini kontrol et
      if ('havale' in updatedSettings) {
        updatedSettings.havale = updatedSettings.havale === true;
      }
      
      if ('harici' in updatedSettings) {
        updatedSettings.harici = updatedSettings.harici === true;
      }
      
      // Sosyal medya URL'lerini kontrol et
      const socialMediaFields = ['socialFacebook', 'socialTwitter', 'socialInstagram', 'socialLinkedin'];
      socialMediaFields.forEach(field => {
        if (updatedSettings[field] && typeof updatedSettings[field] === 'string' && updatedSettings[field].trim() !== '') {
          // URL'nin başında http:// veya https:// yoksa https:// ekle
          if (!updatedSettings[field].match(/^https?:\/\//)) {
            updatedSettings[field] = `https://${updatedSettings[field]}`;
          }
        }
      });
      
      console.log('İşlenmiş ayarlar:', updatedSettings);
      
      // Ayarları güncelle
      const { data, error } = await supabase
        .from('settings')
        .update({ ...updatedSettings, updatedAt: new Date() })
        .eq('id', current.id)
        .select()
        .single();
      
      if (error) {
        console.error('Ayarlar güncelleme hatası:', error);
        
        // downloadUrl sütunu hatası için özel mesaj
        if (error.message && error.message.includes("downloadUrl")) {
          return res.status(500).json({ 
            message: 'Veritabanı şema hatası: downloadUrl sütunu bulunamadı', 
            details: 'Lütfen Supabase SQL Editor\'da şu sorguyu çalıştırın: ALTER TABLE settings ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;' 
          });
        }
        
        return res.status(500).json({ message: 'Ayarlar güncellenemedi', details: error.message });
      }
      
      console.log('Ayarlar başarıyla güncellendi');
      res.json(data);
    } catch (error) {
      console.error('Ayarlar güncelleme hatası (genel):', error);
      
      // Hata mesajında downloadUrl geçiyorsa özel mesaj göster
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      if (errorMessage.includes('downloadUrl')) {
        return res.status(500).json({ 
          message: 'Veritabanı şema hatası: downloadUrl sütunu bulunamadı', 
          details: 'Lütfen Supabase SQL Editor\'da şu sorguyu çalıştırın: ALTER TABLE settings ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;' 
        });
      }
      
      res.status(500).json({ 
        message: 'Ayarlar güncellenemedi', 
        details: errorMessage 
      });
    }
  });

  // Herkese açık site ayarlarını getir
  app.get('/api/settings', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (error) return res.status(500).json({ message: 'Failed to fetch settings', details: error.message });
      
      // Boolean değerleri doğru şekilde işle
      if (data) {
        // Eğer havale ve harici değerleri null ise, varsayılan olarak true yap
        if (data.havale === null || data.havale === undefined) {
          data.havale = true;
        }
        
        if (data.harici === null || data.harici === undefined) {
          data.harici = true;
        }
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  // Frontend'den gelen hata ve network hatalarını loglayan endpoint
  app.post('/api/log-client-error', express.json(), (req: Request, res: Response) => {
    const logPath = path.join(process.cwd(), 'data', 'client-errors.log');
    console.log('LOG-CLIENT-ERROR endpoint çağrıldı:', req.body); // DEBUG
    console.log('Log dosyası yolu:', logPath); // DEBUG
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...req.body
    };
    try {
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
      res.status(200).json({ message: 'Error logged' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to log error', details: (err as Error).message });
    }
  });

  // DEBUG: Supabase ve env test endpointi
  app.get('/api/debug/env', async (req: Request, res: Response) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY ? 'OK' : 'YOK';
    let adminTest = null;
    let error = null;
    try {
      const result: any = await getAdminByUsername('admin');
      const data = result?.data;
      const err = result?.error;
      adminTest = data;
      if (err) error = err.message;
    } catch (e) {
      error = (e as Error).message;
    }
    res.json({
      SUPABASE_URL: url,
      SUPABASE_SERVICE_KEY: key,
      adminTest,
      error
    });
  });

  const httpServer = createServer(app as any);
  return httpServer;
}

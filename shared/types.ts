// Sadece tipler export ediliyor. Zod şemaları frontend'de ayrı tanımlanacak.

// Add FileList interface
declare global {
  interface FileList {
    readonly length: number;
    item(index: number): File | null;
    [index: number]: File;
  }
}

export type Product = {
  id: number;
  name: { tr: string; en: string };
  slug: string;
  description: { tr: string; en: string };
  fullDescription: { tr: string; en: string };
  price: { tr: string; en: string };
  image: string;
  category: string;
  inStock: boolean;
  specs?: string;
  externalLinks?: string;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: number;
  orderId: string;
  userId?: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  productId: number;
  productName: string;
  price: { tr: string; en: string };
  notes?: string;
  status: string;
  createdAt: string;
};

export type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  captchaAnswer: number;
  createdAt: string;
};

interface FileList {
  readonly length: number;
  item(index: number): File | null;
  [index: number]: File;
}

export type ProductForm = {
  name: { tr: string; en: string };
  slug: string;
  description: { tr: string; en: string };
  fullDescription: { tr: string; en: string };
  price: { tr: string; en: string };
  image?: string;
  imageFile?: FileList;
  category: string;
  inStock: boolean;
  specs?: string;
  externalLinks?: string;
};

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export const settings = pgTable("settings", {
    id: serial("id").primaryKey(),
    siteTitle: text("site_title"),
    siteDesc: text("site_desc"),
    logoUrl: text("logo_url"),
    faviconUrl: text("favicon_url"),
    socialFacebook: text("socialFacebook"),
    socialTwitter: text("socialTwitter"),
    socialInstagram: text("socialInstagram"),
    socialLinkedin: text("socialLinkedin"),
    bankName: text("bank_name"),
    bankAccountNumber: text("bank_account_number"),
    bankIban: text("bank_iban"),
    bankReferencePrefix: text("bank_reference_prefix"),
    blockCodeScreenshot1: text("block_code_screenshot1"),
    blockCodeScreenshot2: text("block_code_screenshot2"),
    blockCodeVideoUrl: text("block_code_video_url"),
    aboutImage: text("about_image"),
    downloadUrl: text("download_url"),
    showBankTransfer: boolean("show_bank_transfer").default(true),
    showExternalLinks: boolean("show_external_links").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertSettingsSchema = createInsertSchema(settings).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: jsonb("name").notNull(), // { tr: string, en: string }
    slug: text("slug").notNull().unique(),
    description: jsonb("description").notNull(), // { tr: string, en: string }
    fullDescription: jsonb("fullDescription").notNull(), // { tr: string, en: string }
    price: jsonb("price").notNull(), // { tr: string, en: string }
    image: text("image").notNull(),
    category: text("category").notNull(),
    inStock: boolean("in_stock").notNull().default(true),
    specs: text("specs"), // JSON string for technical specifications
    externalLinks: text("external_links"), // JSON string for external store links
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone"),
    address: text("address"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    orderId: text("order_id").notNull().unique(),
    userId: integer("user_id").references(() => users.id),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    productId: integer("product_id").notNull(),
    productName: text("product_name").notNull(),
    price: jsonb("price").notNull(), // { tr: string, en: string }
    notes: text("notes"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const contacts = pgTable("contacts", {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    captchaAnswer: integer("captcha_answer").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const admins = pgTable("admins", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
const langObj = z.object({ tr: z.string(), en: z.string() });
export const insertProductSchema = createInsertSchema(products).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    name: langObj,
    description: langObj,
    fullDescription: langObj,
    price: z.object({ tr: z.string(), en: z.string() }),
    inStock: z.preprocess((val) => {
        if (typeof val === "string")
            return val === "true";
        return Boolean(val);
    }, z.boolean()),
});
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertOrderSchema = createInsertSchema(orders).omit({
    id: true,
    orderId: true,
    createdAt: true,
});
export const insertContactSchema = createInsertSchema(contacts).omit({
    id: true,
    createdAt: true,
});
export const insertAdminSchema = createInsertSchema(admins).omit({
    id: true,
});

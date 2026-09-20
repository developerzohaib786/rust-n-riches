import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number({ message: "Enter a valid price" }).positive("Price must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  stock: z
    .number({ message: "Enter a valid stock quantity" })
    .int()
    .nonnegative("Stock cannot be negative"),
  imageUrl: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const stockUpdateSchema = z.object({
  stock: z
    .number({ message: "Enter a valid stock quantity" })
    .int()
    .nonnegative("Stock cannot be negative"),
});

export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;

export const CHECKOUT_MAX_LINES = 50;
export const CHECKOUT_MAX_QUANTITY = 99;

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => /^\+?[\d\s-]{10,16}$/.test(value), "Enter a valid phone number");

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be at least 1")
    .max(CHECKOUT_MAX_QUANTITY, `You can order at most ${CHECKOUT_MAX_QUANTITY} of one item`),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;

// The form fields shown on the checkout page (no cart items, those come from the cart).
export const checkoutFormSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name"),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  address: z.string().trim().min(5, "Enter your full delivery address"),
  city: z.string().trim().min(2, "Enter your city"),
  notes: z.string().trim().max(500, "Notes are too long").optional(),
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

export const checkoutSchema = checkoutFormSchema.extend({
  items: z
    .array(checkoutItemSchema)
    .min(1, "Your cart is empty")
    .max(CHECKOUT_MAX_LINES, "Too many items in the cart"),
  // Honeypot: real users never fill this in, bots often do.
  website: z.string().max(0).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartRefreshSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(CHECKOUT_MAX_LINES),
});

export const orderLookupSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .regex(/^#?\d+$/, "Enter a valid order number"),
  phone: phoneSchema,
});

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;

export const orderUpdateSchema = z
  .object({
    status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
    paymentStatus: z.enum(["UNPAID", "PAID"]).optional(),
  })
  .refine((v) => v.status !== undefined || v.paymentStatus !== undefined, {
    message: "Nothing to update",
  });

export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;

export const storeSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  logoUrl: z.string().optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  shippingFee: z
    .number({ message: "Enter a valid shipping fee" })
    .nonnegative("Shipping fee cannot be negative"),
  freeShippingThreshold: z
    .number({ message: "Enter a valid amount" })
    .nonnegative("Amount cannot be negative")
    .nullable(),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

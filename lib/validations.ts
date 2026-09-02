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

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  address: z.string().optional(),
  photoUrl: z.string().optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const transactionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  type: z.enum(["CREDIT", "PAYMENT"]),
  amount: z.number({ message: "Enter a valid amount" }).positive("Amount must be greater than 0"),
  note: z.string().optional(),
  items: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const storeSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  logoUrl: z.string().optional().or(z.literal("")),
  address: z.string().optional(),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

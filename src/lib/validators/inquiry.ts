import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(3, "Ism-familiyani to'liq kiriting").max(100),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{9,20}$/, "Telefon raqamni to'g'ri kiriting"),
  subject: z.string().trim().min(3, "Mavzuni kiriting").max(150),
  message: z.string().trim().min(10, "Murojaat matni kamida 10 ta belgi bo'lsin").max(3000),
});

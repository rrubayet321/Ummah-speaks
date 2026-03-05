import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 100;
export const MAX_HADITH_TEXT_LENGTH = 3000;

const safeStr = (max: number) =>
  z
    .string()
    .min(1, "Required")
    .max(max, `Must be ${max} characters or less`)
    .transform((s) => s.trim())
    .refine((s) => s.length >= 1, "Required after trimming");

const optionalStr = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .default("")
    .transform((s) => (s ?? "").trim());

export const chatBodySchema = z.object({
  message: safeStr(MAX_MESSAGE_LENGTH),
});

export const hadithBodySchema = z.object({
  keyword: safeStr(50),
  collection: z.string().max(30).optional(),
});

export const reflectionBodySchema = z.object({
  feeling:     safeStr(MAX_MESSAGE_LENGTH),
  hadithText:  safeStr(MAX_HADITH_TEXT_LENGTH),
  name:        z.string().max(MAX_NAME_LENGTH).optional().default("friend"),
  intentMode:  z.enum(["feeling", "guidance", "dua-for"]).optional().default("feeling"),
  keyword:     z.string().max(80).optional().default(""),
  nameOfAllah: z.string().max(200).optional().default(""),
  quranVerse:  z.string().max(MAX_HADITH_TEXT_LENGTH).optional().default(""),
});

export const refineBodySchema = z.object({
  userInput: safeStr(MAX_MESSAGE_LENGTH),
  nameOfAllah: optionalStr(300),
  hadith: optionalStr(MAX_HADITH_TEXT_LENGTH),
  quran: optionalStr(MAX_HADITH_TEXT_LENGTH),
});

export const quranBodySchema = z.object({
  keyword: safeStr(50),
});

export type ChatBody       = z.infer<typeof chatBodySchema>;
export type HadithBody     = z.infer<typeof hadithBodySchema>;
export type ReflectionBody = z.infer<typeof reflectionBodySchema>;
export type RefineBody     = z.infer<typeof refineBodySchema>;
export type QuranBody      = z.infer<typeof quranBodySchema>;

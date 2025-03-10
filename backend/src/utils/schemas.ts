import { z } from "zod";

const passwordSchema = z.string().trim().min(3);
const userNameSchema = z.string().trim().min(1);

export const signupSchema = z.object({
  name: userNameSchema,
  email: z.string().email(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export const userSchema = z.object({
  name: userNameSchema,
  email: z.string().email(),
  password: passwordSchema,
  role: z.enum(["admin", "user"]),
});

export const userIdParamSchema = z.coerce.number().int().positive();

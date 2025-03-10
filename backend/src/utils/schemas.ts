import { z } from "zod";

const passwordSchema = z.string().trim().min(3);
const userNameSchema = z.string().trim().min(1);
const emailSchema = z.string().trim().email().toLowerCase();
const roleNameSchema = z.enum(["admin", "user"]);

export const signupSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const userSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleNameSchema,
});

export const userIdParamSchema = z.coerce.number().int().positive();

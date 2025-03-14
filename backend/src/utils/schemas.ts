import { z } from "zod";
import "zod-openapi/extend"; // For extending the Zod schema with OpenAPI properties

const passwordSchema = z
  .string()
  .trim()
  .min(3)
  .openapi({ example: "SecurePass123" });

const userNameSchema = z
  .string()
  .trim()
  .min(1)
  .openapi({ example: "John Doe" });

const emailSchema = z
  .string()
  .trim()
  .email()
  .toLowerCase()
  .openapi({ example: "johnny123@example.com" });

export const userIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .openapi({ example: 42 });

const roleNameSchema = z
  .enum(["admin", "user"])
  .openapi({ examples: ["admin", "user"] });

const roleIdSchema = z.coerce.number().int().positive().openapi({ example: 1 });

export const signupInputSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const userInputSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleNameSchema,
});

export const tokenResponseSchema = z.object({ token: z.string() });

export const userResponseSchema = z.object({
  id: userIdSchema,
  name: userNameSchema,
  email: emailSchema,
  createdAt: z.date().openapi({ example: "2025-03-10T11:23:15.492Z" }),
  role: z.object({ id: roleIdSchema, name: roleNameSchema }),
});

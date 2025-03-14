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

const createdAtSchema = z
  .date()
  .openapi({ example: "2025-03-10T11:23:15.492Z" });

export const userIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .openapi({ example: 42 });

export const transactionIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .openapi({ example: 42 });

const roleNameSchema = z
  .enum(["admin", "user"])
  .openapi({ examples: ["admin", "user"] });

const roleIdSchema = z.coerce.number().int().positive().openapi({ example: 1 });

const transactionTypeSchema = z
  .enum(["deposit", "credit"])
  .openapi({ examples: ["deposit", "credit"] });

const transactionSubTypeSchema = z
  .enum(["reward", "purchase", "refund"])
  .openapi({ examples: ["reward", "purchase", "refund"] });

const transactionAmountSchema = z
  .number()
  .positive()
  .finite()
  .openapi({ example: 4.2 });
const transactionStatusSchema = z
  .enum(["pending", "failed", "completed"])
  .openapi({ examples: ["pending", "failed", "completed"] });

const transactionDescriptionSchema = z.string().trim().max(50).optional();

// Input schemas

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

export const transactionInputSchema = z.object({
  type: transactionTypeSchema,
  subType: transactionSubTypeSchema,
  amount: transactionAmountSchema,
  status: transactionStatusSchema,
  description: transactionDescriptionSchema,
  userId: userIdSchema,
});

// Response schemas

export const tokenResponseSchema = z.object({ token: z.string() });

export const userResponseSchema = z.object({
  id: userIdSchema,
  name: userNameSchema,
  email: emailSchema,
  createdAt: createdAtSchema,
  role: z.object({ id: roleIdSchema, name: roleNameSchema }),
});

export const transactionResponseSchema = z.object({
  id: transactionIdSchema,
  type: transactionTypeSchema,
  subType: transactionSubTypeSchema,
  amount: transactionAmountSchema,
  status: transactionStatusSchema,
  description: transactionDescriptionSchema,
  userId: userIdSchema,
  user: userResponseSchema,
  createdAt: createdAtSchema,
});

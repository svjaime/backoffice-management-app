import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";
import { JwtVariables } from "hono/jwt";
import { z } from "zod";
import prismaClient from "../db/prisma";
import { checkPermission } from "../middlewares/check-permission";
import { jwtMiddleware } from "../middlewares/jwt";
import {
  getTransactionsQueryParams,
  transactionInputSchema,
  transactionResponseSchema,
} from "../utils/schemas";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};
type Variables = JwtVariables;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", every(jwtMiddleware));

app.get(
  "/",
  describeRoute({
    description: "Get all transactions for a user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": {
            schema: resolver(
              z.object({
                transactions: transactionResponseSchema,
                total: z.number().int().nonnegative(),
              })
            ),
          },
        },
      },
    },
  }),
  checkPermission("view_transactions"),
  zValidator("query", getTransactionsQueryParams),
  async (c) => {
    const { userId, search, type, status, page, limit, sortField, sortOrder } =
      c.req.valid("query");

    const payload = c.get("jwtPayload");
    if (payload.userId != userId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const filters = {
      ...(type && { type }),
      ...(status && { status }),
      ...(search && { description: { contains: search } }),
    };

    const prisma = await prismaClient.fetch(c.env.DB);
    const transactions = await prisma.transaction.findMany({
      where: filters,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sortField]: sortOrder },
    });
    const total = await prisma.transaction.count({ where: filters });

    return c.json({
      transactions: z.array(transactionResponseSchema).parse(transactions),
      total,
    });
  }
);

app.post(
  "/",
  describeRoute({
    description: "Create a transaction",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(transactionResponseSchema) },
        },
      },
    },
  }),
  checkPermission("manage_transactions"),
  zValidator("json", transactionInputSchema),
  async (c) => {
    const inputData = c.req.valid("json");

    const prisma = await prismaClient.fetch(c.env.DB);

    const existingUser = await prisma.user.findUnique({
      where: { id: inputData.userId },
    });

    if (!existingUser) {
      throw new HTTPException(400, {
        message: "User doesn't exist",
      });
    }

    const newTransaction = await prisma.transaction.create({ data: inputData });

    return c.json(transactionResponseSchema.parse(newTransaction));
  }
);

export default app;

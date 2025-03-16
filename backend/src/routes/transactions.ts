import dayjs from "dayjs";
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
  revenueResponseSchema,
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

app.get(
  "/revenue",
  describeRoute({
    description: "Get revenue for current week and month",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(revenueResponseSchema) },
        },
      },
    },
  }),
  checkPermission("view_transactions"),
  async (c) => {
    const startOfWeek = dayjs().startOf("week").toDate();
    const startOfMonth = dayjs().startOf("month").toDate();

    const prisma = await prismaClient.fetch(c.env.DB);

    const weeklyRevenuePromise = prisma.transaction.groupBy({
      by: ["subType"],
      _sum: { amount: true },
      where: {
        createdAt: { gte: startOfWeek },
        status: "completed",
      },
    });

    const monthlyRevenuePromise = prisma.transaction.groupBy({
      by: ["subType"],
      _sum: { amount: true },
      where: {
        createdAt: { gte: startOfMonth },
        status: "completed",
      },
    });

    const [weeklyRevenue, monthlyRevenue] = await Promise.all([
      weeklyRevenuePromise,
      monthlyRevenuePromise,
    ]);

    return c.json(
      revenueResponseSchema.parse({ weeklyRevenue, monthlyRevenue })
    );
  }
);

export default app;

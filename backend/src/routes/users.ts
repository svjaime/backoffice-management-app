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
import { hashPassword } from "../utils/auth";
import {
  userIdSchema,
  userInputSchema,
  userResponseSchema,
} from "../utils/schemas";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};
type Variables = JwtVariables;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", every(jwtMiddleware, checkPermission("manage_users")));

app.get(
  "/",
  describeRoute({
    description: "Get all users",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(z.array(userResponseSchema)) },
        },
      },
    },
  }),
  async (c) => {
    const prisma = await prismaClient.fetch(c.env.DB);
    const users = await prisma.user.findMany({
      include: { role: true },
    });

    return c.json(z.array(userResponseSchema).parse(users));
  }
);

app.post(
  "/",
  describeRoute({
    description: "Create a new user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(userResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", userInputSchema),
  async (c) => {
    const { name, email, password, role } = c.req.valid("json");

    const prisma = await prismaClient.fetch(c.env.DB);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HTTPException(400, {
        message: "User with this email already exists",
      });
    }

    const roleRecord = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      throw new HTTPException(400, { message: "Invalid role specified" });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        roleId: roleRecord.id,
      },
      include: { role: true }, // TODO prisma:warn Cloudflare D1 does not support transactions yet...
    });

    return c.json(userResponseSchema.parse(newUser));
  }
);

app.put(
  "/:id",
  describeRoute({
    description: "Update user",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(userResponseSchema) },
        },
      },
    },
  }),
  zValidator("param", z.object({ id: userIdSchema })),
  zValidator("json", userInputSchema.partial()),
  async (c) => {
    const { id: userId } = c.req.valid("param");
    const { name, email, password, role } = c.req.valid("json");

    const prisma = await prismaClient.fetch(c.env.DB);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    let roleRecord;

    if (role) {
      roleRecord = await prisma.role.findUnique({
        where: { name: role },
      });

      if (!roleRecord) {
        throw new HTTPException(400, { message: "Invalid role specified" });
      }
    }

    let hashedPassword;

    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, password: hashedPassword, roleId: roleRecord?.id },
      include: { role: true }, // TODO prisma:warn Cloudflare D1 does not support transactions yet...
    });

    return c.json(userResponseSchema.parse(updatedUser));
  }
);

app.delete(
  "/:id",
  describeRoute({
    description: "Delete user",
    responses: { 200: { description: "Successful response" } },
  }),
  zValidator("param", z.object({ id: userIdSchema })),
  async (c) => {
    const { id: userId } = c.req.valid("param");
    const prisma = await prismaClient.fetch(c.env.DB);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return c.text("User deleted successfully");
  }
);

export default app;

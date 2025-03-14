import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { JwtVariables, sign } from "hono/jwt";
import prismaClient from "../db/prisma";
import { hashPassword, verifyPassword } from "../utils/auth";
import {
  loginInputSchema,
  signupInputSchema,
  tokenResponseSchema,
} from "../utils/schemas";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};
type Variables = JwtVariables;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.post(
  "/signup",
  describeRoute({
    description: "Sign up to the app",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(tokenResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", signupInputSchema),
  async (c) => {
    const { name, email, password } = c.req.valid("json");

    const prisma = await prismaClient.fetch(c.env.DB);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new HTTPException(400, { message: "User already exists" });
    }

    const defaultRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!defaultRole) {
      throw new HTTPException(500, { message: "Default user role not found" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, roleId: defaultRole.id },
    });

    const payload = {
      userId: newUser.id,
      role: defaultRole.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
    };
    const token = await sign(payload, c.env.JWT_SECRET);

    return c.json({ token });
  }
);

app.post(
  "/login",
  describeRoute({
    description: "Login to the app",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": { schema: resolver(tokenResponseSchema) },
        },
      },
    },
  }),
  zValidator("json", loginInputSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const prisma = await prismaClient.fetch(c.env.DB);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });

    if (!role) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const payload = {
      userId: user.id,
      role: role.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
    };
    const token = await sign(payload, c.env.JWT_SECRET);

    return c.json({ token });
  }
);

export default app;

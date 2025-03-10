import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";
import { JwtVariables } from "hono/jwt";
import { z } from "zod";
import prismaClient from "../db/prisma";
import { checkPermission } from "../middlewares/check-permission";
import { jwtMiddleware } from "../middlewares/jwt";
import { hashPassword } from "../utils/auth";
import { userIdParamSchema, userSchema } from "../utils/schemas";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};
type Variables = JwtVariables;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", every(jwtMiddleware, checkPermission("manage_users")));

app.get("/", async (c) => {
  const prisma = await prismaClient.fetch(c.env.DB);
  const users = await prisma.user.findMany({
    include: { role: true },
  });

  return c.json(users);
});

app.post("/", zValidator("json", userSchema), async (c) => {
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
  });

  return c.json(newUser);
});

app.put(
  "/:id",
  zValidator("param", z.object({ id: userIdParamSchema })),
  zValidator("json", userSchema.partial()),
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
    });

    return c.json(updatedUser);
  }
);

app.delete(
  "/:id",
  zValidator("param", z.object({ id: userIdParamSchema })),
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

    return c.json({ message: "User deleted successfully" });
  }
);

export default app;

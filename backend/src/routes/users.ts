import { Hono } from "hono";
import { every } from "hono/combine";
import { JwtVariables } from "hono/jwt";
import prismaClient from "../db/prisma";
import { checkPermission } from "../middlewares/check-permission";
import { jwtMiddleware } from "../middlewares/jwt";
import { hashPassword } from "../utils/auth";

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

app.post("/", async (c) => {
  const { name, email, password, role } = await c.req.json();

  if (!name || !email || !password || !role) {
    return c.json({ error: "All fields are required" }, 400);
  }

  const prisma = await prismaClient.fetch(c.env.DB);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return c.json({ error: "User with this email already exists" }, 400);
  }

  const roleRecord = await prisma.role.findUnique({
    where: { name: role },
  });

  if (!roleRecord) {
    return c.json({ error: "Invalid role specified" }, 400);
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

app.put("/:id", async (c) => {
  const userId = parseInt(c.req.param("id"), 10);
  const { name, email, password, role } = await c.req.json();

  const prisma = await prismaClient.fetch(c.env.DB);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  let roleRecord;

  if (role) {
    roleRecord = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      return c.json({ error: "Invalid role specified" }, 400);
    }
  }

  let hashedPassword;

  if (password) {
    hashedPassword = await hashPassword(password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      email: email || undefined,
      password: hashedPassword,
      roleId: roleRecord?.id,
    },
  });

  return c.json(updatedUser);
});

app.delete("/:id", async (c) => {
  const userId = parseInt(c.req.param("id"), 10);
  const prisma = await prismaClient.fetch(c.env.DB);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return c.json({ message: "User deleted successfully" });
});

export default app;

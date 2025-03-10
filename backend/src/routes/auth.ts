import { Hono } from "hono";
import { JwtVariables, sign } from "hono/jwt";
import prismaClient from "../db/prisma";
import { hashPassword, verifyPassword } from "../utils/auth";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};
type Variables = JwtVariables;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.post("/signup", async (c) => {
  const { name, email, password } = await c.req.json();

  if (!name || !email || !password) {
    return c.json({ error: "Name, Email and Password are mandatory." }, 400);
  }

  const prisma = await prismaClient.fetch(c.env.DB);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  const defaultRole = await prisma.role.findUnique({
    where: { name: "user" },
  });

  if (!defaultRole) {
    return c.json({ error: "Default user role not found" }, 500);
  }

  const hashedPassword = await hashPassword(password);

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
    });

    return c.json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Error creating user" }, 500);
  }
});

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and Password are mandatory." }, 400);
  }

  const prisma = await prismaClient.fetch(c.env.DB);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 400);
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    return c.json({ error: "Invalid credentials" }, 400);
  }

  const payload = {
    userId: user.id,
    roleId: user.roleId,
    exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
  };
  const token = await sign(payload, c.env.JWT_SECRET);

  return c.json({ message: "Login successful", token });
});

export default app;

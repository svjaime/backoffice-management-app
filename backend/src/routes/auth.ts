import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
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
    throw new HTTPException(400, {
      message: "Name, Email and Password are mandatory.",
    });
  }

  const prisma = await prismaClient.fetch(c.env.DB);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

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
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: defaultRole.id,
    },
  });

  return c.json({ message: "User created successfully", userId: newUser.id });
});

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    throw new HTTPException(400, {
      message: "Email and Password are mandatory.",
    });
  }

  const prisma = await prismaClient.fetch(c.env.DB);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HTTPException(400, { message: "Invalid credentials" });
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new HTTPException(400, { message: "Invalid credentials" });
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

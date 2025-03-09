import { Hono } from "hono";
import prismaClients from "../lib/prisma";
import { logger } from "hono/logger";
import { hashPassword } from "../util/hash-password";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use(logger());

app.post("/signup", async (c) => {
  const { name, email, password, role } = await c.req.json();

  if (!name || !email || !password) {
    return c.json({ error: "Name, Email and Password are mandatory." }, 400);
  }

  const prisma = await prismaClients.fetch(c.env.DB);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  const hashedPassword = await hashPassword(password);

  let roleId;

  if (role) {
    const roleRecord = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      return c.json({ error: "Invalid role specified" }, 400);
    }

    roleId = roleRecord.id;
  } else {
    const defaultRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!defaultRole) {
      return c.json({ error: "Default user role not found" }, 500);
    }

    roleId = defaultRole.id;
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      },
    });

    return c.json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Error creating user" }, 500);
  }
});

app.get("/", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const users = await prisma.user.findMany();
  console.log("users", users);
  return c.json(users);
});

export default app;

import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { jwt, JwtVariables, sign } from "hono/jwt";
import { logger } from "hono/logger";
import prismaClients from "../lib/prisma";
import { hashPassword, verifyPassword } from "../util/auth";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};
type Variables = JwtVariables;

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
app.use(logger());

app.use("/api/*", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });
  return jwtMiddleware(c, next);
});

const verifyManageUsersPermission = createMiddleware(async (c, next) => {
  const payload = c.get("jwtPayload");

  const prisma = await prismaClients.fetch(c.env.DB);
  const role = await prisma.role.findUnique({
    where: { id: payload.roleId },
    include: { permissions: true },
  });
  if (!role?.permissions.some(({ name }) => name === "manage_users")) {
    throw new HTTPException(401, { message: "Not enough permissions." });
  }
  await next();
});

app.post("/signup", async (c) => {
  const { name, email, password } = await c.req.json();

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

  const prisma = await prismaClients.fetch(c.env.DB);

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

app.get("/api/users", verifyManageUsersPermission, async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const users = await prisma.user.findMany({
    include: { role: true },
  });

  return c.json(users);
});

app.post("/api/users", verifyManageUsersPermission, async (c) => {
  const { name, email, password, role } = await c.req.json();

  if (!name || !email || !password || !role) {
    return c.json({ error: "All fields are required" }, 400);
  }

  const prisma = await prismaClients.fetch(c.env.DB);

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

app.put("/api/users/:id", verifyManageUsersPermission, async (c) => {
  const userId = parseInt(c.req.param("id"), 10);
  const { name, email, password, role } = await c.req.json();

  const prisma = await prismaClients.fetch(c.env.DB);

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

app.delete("/api/users/:id", verifyManageUsersPermission, async (c) => {
  const userId = parseInt(c.req.param("id"), 10);
  const prisma = await prismaClients.fetch(c.env.DB);

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

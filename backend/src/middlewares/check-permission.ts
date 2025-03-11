import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import prismaClient from "../db/prisma";

export const checkPermission = (permission: string) =>
  createMiddleware(async (c, next) => {
    const payload = c.get("jwtPayload");

    const prisma = await prismaClient.fetch(c.env.DB);
    const role = await prisma.role.findUnique({
      where: { id: payload.roleId },
      include: { permissions: true },
    });
    if (!role?.permissions.some(({ name }) => name === permission)) {
      throw new HTTPException(403, { message: "Not enough permissions" });
    }
    await next();
  });

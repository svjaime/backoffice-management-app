import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import auth from "./routes/auth";
import users from "./routes/users";

const app = new Hono();
app.use(logger());
app.use(cors());

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Backoffice Management API",
        version: "1.0.0",
        description: "Proof of concept - Backoffice Management API",
      },
      servers: [
        { url: "http://localhost:8787", description: "Local Server" },
        {
          url: "https://backend.jaime-verde.workers.dev/",
          description: "Live Server",
        },
      ],
      components: {
        securitySchemes: {
          // TODO how can this be applied to only some routes?
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  })
);

app.get(
  "/docs",
  apiReference({
    theme: "purple",
    url: "/openapi",
  })
);

app.route("/api/auth", auth);
app.route("/api/users", users);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error(err);
  return c.text("Something went wrong", 500);
});

export default app;

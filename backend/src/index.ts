import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import auth from "./routes/auth";
import users from "./routes/users";

const app = new Hono();
app.use(logger());
app.use(cors());

app.route("/api/users", users);
app.route("/api/auth", auth);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error(err);
  return c.text("Something went wrong", 500);
});

export default app;

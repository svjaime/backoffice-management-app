import { Hono } from "hono";
import { logger } from "hono/logger";
import auth from "./routes/auth";
import users from "./routes/users";

const app = new Hono();
app.use(logger());

app.route("/api/users", users);
app.route("/api/auth", auth);

export default app;

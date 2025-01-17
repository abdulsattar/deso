import * as path from "https://deno.land/std@0.181.0/path/mod.ts";
import { Deso, middlewares } from "../../mod.ts";

const app = new Deso();

// Run vite command to build ui
await Deno.run({
  cwd: path.resolve("./ui"),
  cmd: ["pnpm", "build"],
});

app.before(new middlewares.StaticMiddleware("/assets/*", "./ui/dist/assets"));
app.before(new middlewares.StaticMiddleware("/", "./ui/dist"));

app.get("/api/hello", (context) => {
  const response = new Map([
    ["test", "ok"],
  ]);
  return context.json(response);
});

await app.serve({ port: 3000 });

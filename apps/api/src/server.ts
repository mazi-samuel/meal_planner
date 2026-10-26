import { createServer } from 'node:http';
import { Router } from './http/router';
import { InMemoryProfileRepository } from './modules/profiles.repository';
import { registerRoutes } from './modules/routes';

const port = Number(process.env.PORT ?? 4000);
const router = registerRoutes(new Router(), new InMemoryProfileRepository());

createServer((req, res) => {
  void router.handle(req, res);
}).listen(port, () => {
  console.log(`Meal planner API listening on http://localhost:${port}`);
});

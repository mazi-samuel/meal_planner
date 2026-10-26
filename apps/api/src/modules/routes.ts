import {
  DEFAULT_CATALOG,
  NoSafeMealError,
  applyBrainDeadMode,
  buildOrderIntent,
  generateWeeklyPlan,
  toLocalIsoDate,
  type MealServing,
} from '@mealplanner/core';
import { HttpError, type Router } from '../http/router';
import type { ProfileRepository } from './profiles.repository';
import { parseOrderInput, parsePlanInput, parseProfileInput } from './validation';

export function registerRoutes(router: Router, profiles: ProfileRepository): Router {
  router.get('/health', () => ({ body: { status: 'ok' } }));

  router.get('/v1/catalog', () => ({
    body: { meals: DEFAULT_CATALOG.meals, ingredients: DEFAULT_CATALOG.ingredients },
  }));

  router.post('/v1/profiles', async (ctx) => {
    const input = parseProfileInput(await ctx.readJson());
    return { status: 201, body: await profiles.create(input) };
  });

  router.get('/v1/profiles/:id', async (ctx) => {
    const profile = await profiles.findById(ctx.params.id!);
    if (!profile) throw new HttpError(404, 'Profile not found');
    return { body: profile };
  });

  router.post('/v1/profiles/:id/plans', async (ctx) => {
    const profile = await profiles.findById(ctx.params.id!);
    if (!profile) throw new HttpError(404, 'Profile not found');

    const input = parsePlanInput(await ctx.readJson(), toLocalIsoDate(new Date()));
    try {
      const plan = generateWeeklyPlan({ profile, startDate: input.startDate, seed: input.seed });
      return { body: input.brainDeadMode ? applyBrainDeadMode(plan, profile) : plan };
    } catch (error) {
      if (error instanceof NoSafeMealError) throw new HttpError(422, error.message);
      throw error;
    }
  });

  router.post('/v1/orders/chowdeck', async (ctx) => {
    const input = parseOrderInput(await ctx.readJson());
    const servings: MealServing[] = input.mealIds.map((id) => ({
      meal: DEFAULT_CATALOG.meals.find((m) => m.id === id)!,
      servings: input.servings,
    }));
    return { body: buildOrderIntent({ mode: input.mode, servings, title: input.title }) };
  });

  return router;
}

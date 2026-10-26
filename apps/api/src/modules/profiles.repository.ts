import { randomUUID } from 'node:crypto';
import type { UserProfile } from '@mealplanner/core';
import type { ProfileInput } from './validation';

/** Persistence boundary. Swap the in-memory implementation for Postgres/Prisma without touching routes. */
export interface ProfileRepository {
  create(input: ProfileInput): Promise<UserProfile>;
  findById(id: string): Promise<UserProfile | undefined>;
}

export class InMemoryProfileRepository implements ProfileRepository {
  private readonly profiles = new Map<string, UserProfile>();

  async create(input: ProfileInput): Promise<UserProfile> {
    const now = new Date().toISOString();
    const profile: UserProfile = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async findById(id: string): Promise<UserProfile | undefined> {
    return this.profiles.get(id);
  }
}

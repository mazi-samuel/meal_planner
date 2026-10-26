/** Collision-resistant enough for a local profile id; the backend assigns real UUIDs. */
export function createLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

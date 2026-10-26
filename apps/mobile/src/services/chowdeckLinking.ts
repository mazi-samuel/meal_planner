import { Linking } from 'react-native';
import type { ChowdeckOrderIntent } from '@mealplanner/core';

export type OpenChowdeckResult =
  | { ok: true; via: 'app' | 'web' }
  | { ok: false; reason: string };

/**
 * Opens the Chowdeck app, falling back to chowdeck.com if it isn't installed.
 *
 * We attempt `openURL` directly instead of gating on `canOpenURL`: the latter
 * needs `LSApplicationQueriesSchemes` on iOS and `<queries>` entries on Android
 * 11+ to see other apps, and returns false without them even when Chowdeck is
 * installed. `openURL` rejects when nothing can handle the scheme, which is the
 * exact signal we want.
 */
export async function openChowdeck(intent: ChowdeckOrderIntent): Promise<OpenChowdeckResult> {
  try {
    await Linking.openURL(intent.nativeUrl);
    return { ok: true, via: 'app' };
  } catch {
    // Chowdeck is not installed (or the scheme was rejected). Use the web fallback.
  }

  try {
    await Linking.openURL(intent.webUrl);
    return { ok: true, via: 'web' };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, reason };
  }
}

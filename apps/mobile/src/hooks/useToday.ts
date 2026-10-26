import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { toLocalIsoDate } from '@mealplanner/core';

/** Today's local date, refreshed when the app returns to the foreground (e.g. the next morning). */
export function useToday(): string {
  const [today, setToday] = useState(() => toLocalIsoDate(new Date()));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(toLocalIsoDate(new Date()));
    });
    return () => subscription.remove();
  }, []);

  return today;
}

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';

/** True once the persisted store has been read from AsyncStorage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAppStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  return hydrated;
}

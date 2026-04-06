type StartFn = () => void;
type Snapshot = Readonly<Record<string, StartFn>>;
type Listener = () => void;

let snapshot: Snapshot = {};
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l());
}

export const tourRegistry = {
  register(route: string, startFn: StartFn): void {
    snapshot = { ...snapshot, [route]: startFn };
    notify();
  },

  unregister(route: string): void {
    const { [route]: _, ...rest } = snapshot as Record<string, StartFn>;
    snapshot = rest;
    notify();
  },

  start(route: string): boolean {
    const fn = (snapshot as Record<string, StartFn>)[route];
    if (fn) {
      fn();
      return true;
    }
    return false;
  },

  has(route: string): boolean {
    return route in snapshot;
  },

  // Required for useSyncExternalStore
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): Snapshot {
    return snapshot;
  },
};

/** Returns the tour route key that matches the given pathname, or undefined. */
export function matchTourRoute(pathname: string, registry: Snapshot): string | undefined {
  return Object.keys(registry).find(route => {
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// src/stores/chartStore.ts

type Listener = () => void;

const listeners: Set<Listener> = new Set();
let version = 0; // external version counter

export function subscribe(callback: Listener) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Called from anywhere (e.g. worker or IndexedDB updater)
export function notifyChartDataChanged() {
  version++;
  listeners.forEach(cb => cb());
}

// Snapshot getter (used by useSyncExternalStore)
export function getSnapshot(): number {
  return version;
}

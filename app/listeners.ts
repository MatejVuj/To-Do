const listeners = new Set<() => void>();
export const addListener   = (item: () => void) => listeners.add(item);
export const removeListener= (item: () => void) => listeners.delete(item);
export const clearAllListeners = () => { listeners.forEach(item => item()); listeners.clear(); };
// src/utils/demoMode.ts
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const demoApiCall = <T>(mockData: T, delay = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), delay);
  });
};

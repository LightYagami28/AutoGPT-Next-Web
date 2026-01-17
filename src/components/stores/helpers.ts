import type { StoreApi, UseBoundStore } from "zustand";

/*
  Automatically creates selectors for each states in store.
  Zustand recommends using selectors for calling state/actions for optimal performance
  Reference: https://docs.pmnd.rs/zustand/guides/auto-generating-selectors
*/
type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <
  StoreState extends object,
  S extends UseBoundStore<StoreApi<StoreState>>
>(
  _store: S
) => {
  const store = _store as S & { use: { [K in keyof StoreState]: () => StoreState[K] } };
  store.use = {} as { [K in keyof StoreState]: () => StoreState[K] };

  const state = store.getState();
  const keys = Object.keys(state) as Array<keyof StoreState>;
  for (const key of keys) {
    store.use[key] = () => store((s) => s[key]);
  }

  return store as WithSelectors<S>;
};

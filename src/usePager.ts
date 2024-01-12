import React, { useContext, useSyncExternalStore } from 'react';

export type PagerViewContextValue = {
  store: PagerStore | null;
  setPage: (selectedPage: number) => void;
  setPageWithoutAnimation: (selectedPage: number) => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
};

export type PagerState = {
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PagerStore = {
  getState: () => PagerState;
  setState: (state: PagerState) => void;
  subscribe: (listener: () => void) => () => void;
};

export const PagerViewContext =
  React.createContext<PagerViewContextValue | null>(null);

export const createPagerStore = (initialPage: number) => {
  let state: PagerState = {
    page: initialPage,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const getState = () => {
    return state;
  };

  const listeners = new Set<() => void>();

  const emitChange = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const setState = (newState: PagerState) => {
    state = newState;
    emitChange();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
};

export const usePager = () => {
  if (Number(React.version.split('.')[0]) < 18) {
    throw new Error('usePager requires React 18 or later.');
  }
  const value = useContext(PagerViewContext);

  if (!value || !value.store) {
    throw new Error('usePager must be used within a <PagerView /> component');
  }

  const { store, ...methods } = value;

  const state = useSyncExternalStore(store.subscribe, store.getState);
  return { ...methods, ...state };
};

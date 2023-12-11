import React, { useContext } from 'react';

export type PagerViewMethod = {
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (selectedPage: number) => void;
  setPageWithoutAnimation: (selectedPage: number) => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
};

export const PagerViewContext = React.createContext<PagerViewMethod | null>(
  null
);

export const usePagerView = () => {
  const value = useContext(PagerViewContext);

  if (!value) {
    throw new Error(
      'usePagerView must be used within a <PagerView /> component'
    );
  }

  return value;
};

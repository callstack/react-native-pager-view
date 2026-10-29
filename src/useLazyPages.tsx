import { Children, isValidElement, useState, type ReactNode } from 'react';
import { View } from 'react-native';

type LazyPagesOptions = {
  lazy: boolean;
  preloadDistance: number;
  initialPage: number;
  children: ReactNode;
  renderPlaceholder?: (index: number) => ReactNode;
};

const pageKey = (child: ReactNode) =>
  String(isValidElement(child) ? child.key : undefined);

export function useLazyPages({
  lazy,
  preloadDistance,
  initialPage,
  children,
  renderPlaceholder,
}: LazyPagesOptions) {
  const [current, setCurrent] = useState(initialPage);
  const [mountedKeys, setMountedKeys] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const pages = lazy ? Children.toArray(children) : [];
  const distance = Math.max(preloadDistance, 0) + 1;

  // `position` is fractional while scrolling, so both pages on screen count.
  const mountNear = (mounted: ReadonlySet<string>, position: number) => {
    const next = new Set([
      ...mounted,
      ...pages
        .filter((_, index) => Math.abs(index - position) < distance)
        .map(pageKey),
    ]);
    return next.size === mounted.size ? mounted : next;
  };

  if (lazy) {
    const next = mountNear(mountedKeys, current);
    if (next !== mountedKeys) {
      setMountedKeys(next);
    }
  }

  return {
    children: lazy
      ? pages.map((page, index) =>
          mountedKeys.has(pageKey(page)) ? (
            page
          ) : (
            <View key={pageKey(page)}>{renderPlaceholder?.(index)}</View>
          )
        )
      : children,
    setCurrent: lazy ? setCurrent : undefined,
    onScroll: (position: number, offset: number, isDragging: boolean) => {
      // Not during setPage, which would mount every page it passes.
      if (lazy && isDragging) {
        setMountedKeys((mounted) => mountNear(mounted, position + offset));
      }
    },
    onSelect: (index: number) => {
      if (lazy) {
        setCurrent(index);
      }
    },
  };
}

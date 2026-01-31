import React, { type ComponentType } from 'react';
import type { Animated, ScrollViewProps } from 'react-native';
type ComponentProps = Pick<ScrollViewProps, 'onScrollBeginDrag' | 'onScrollEndDrag' | 'onMomentumScrollBegin' | 'onMomentumScrollEnd'>;
type ExtendProps<PropsT> = PropsT & {
    scrollOffset: Animated.Value;
    onScrollStart?: () => void;
    onScrollEnd?: () => void;
};
declare const withScrollStartEndEvent: <PropsT extends ComponentProps>(Component: ComponentType<PropsT>) => React.NamedExoticComponent<React.PropsWithoutRef<ExtendProps<PropsT>> & React.RefAttributes<React.ComponentRef<React.ComponentType<PropsT>>>>;
export default withScrollStartEndEvent;
//# sourceMappingURL=withScrollStartEndEvent.d.ts.map
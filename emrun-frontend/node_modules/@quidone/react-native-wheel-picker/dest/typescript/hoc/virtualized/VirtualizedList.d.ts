import React from 'react';
import { type FlatListProps, type StyleProp, type ViewStyle, Animated } from 'react-native';
import type { KeyExtractor, ListMethods, PickerItem, RenderPickerItem } from '../../base/types';
export type AdditionalProps = Pick<FlatListProps<any>, 'initialNumToRender' | 'maxToRenderPerBatch' | 'windowSize' | 'updateCellsBatchingPeriod'>;
declare const _default: React.NamedExoticComponent<{
    data: readonly PickerItem<any>[];
    keyExtractor: KeyExtractor<PickerItem<any>>;
    renderItem: RenderPickerItem<PickerItem<any>>;
    itemHeight: number;
    pickerHeight: number;
    visibleItemCount: number;
    readOnly: boolean;
    initialIndex: number;
    scrollOffset: Animated.Value;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
    onScrollStart: (() => void) | undefined;
    onScrollEnd: () => void;
    contentContainerStyle: StyleProp<ViewStyle> | undefined;
} & AdditionalProps & React.RefAttributes<ListMethods>>;
export default _default;
//# sourceMappingURL=VirtualizedList.d.ts.map
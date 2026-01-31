import React from 'react';
import type { KeyExtractor, ListMethods, PickerItem, RenderPickerItem } from '../types';
import { type ViewStyle, type StyleProp, Animated } from 'react-native';
export type ListProps<ItemT extends PickerItem<any>> = {
    data: ReadonlyArray<ItemT>;
    keyExtractor: KeyExtractor<ItemT>;
    renderItem: RenderPickerItem<ItemT>;
    itemHeight: number;
    pickerHeight: number;
    readOnly: boolean;
    initialIndex: number;
    scrollOffset: Animated.Value;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
    onScrollStart: (() => void) | undefined;
    onScrollEnd: () => void;
    contentContainerStyle: StyleProp<ViewStyle> | undefined;
};
declare const _default: React.NamedExoticComponent<ListProps<PickerItem<any>> & React.RefAttributes<ListMethods>>;
export default _default;
//# sourceMappingURL=List.d.ts.map
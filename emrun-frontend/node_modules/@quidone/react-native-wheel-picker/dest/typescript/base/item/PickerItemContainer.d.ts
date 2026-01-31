import React, { type RefObject } from 'react';
import { type TextStyle, type StyleProp } from 'react-native';
import type { ListMethods, RenderItem } from '../types';
import type { Faces } from './faces';
type PickerItemContainerProps = {
    listRef: RefObject<ListMethods | null>;
    item: any;
    index: number;
    faces: ReadonlyArray<Faces>;
    renderItem: RenderItem<any>;
    itemTextStyle: StyleProp<TextStyle> | undefined;
    enableScrollByTapOnItem: boolean | undefined;
    readOnly: boolean | undefined;
};
declare const _default: React.MemoExoticComponent<({ listRef, index, item, faces, renderItem, itemTextStyle, enableScrollByTapOnItem, readOnly, }: PickerItemContainerProps) => React.JSX.Element>;
export default _default;
//# sourceMappingURL=PickerItemContainer.d.ts.map
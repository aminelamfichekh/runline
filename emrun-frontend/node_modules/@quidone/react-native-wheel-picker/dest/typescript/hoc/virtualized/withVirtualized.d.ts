import React from 'react';
import type { PickerProps } from '../../base';
import Picker, { type PickerItem } from '../../base';
import type { AdditionalProps } from './VirtualizedList';
export type WithVirtualizedProps<ItemT extends PickerItem<any>> = AdditionalProps & PickerProps<ItemT>;
type WithVirtualizedComponent = <ItemT extends PickerItem<any>>(props: WithVirtualizedProps<ItemT>) => React.ReactElement;
declare const withVirtualized: (WrappedComponent: typeof Picker) => WithVirtualizedComponent;
export default withVirtualized;
//# sourceMappingURL=withVirtualized.d.ts.map
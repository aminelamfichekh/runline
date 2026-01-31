import type { Control } from './create-control';
import React, { type ComponentType } from 'react';
import { type OnValueChanged, type OnValueChanging, type PickerItem } from '../base';
type RequiredPickerProps = {
    data: ReadonlyArray<PickerItem<unknown>>;
    value?: unknown;
    extraValues?: unknown[];
    onValueChanging?: OnValueChanging<PickerItem<unknown>>;
    onValueChanged?: OnValueChanged<PickerItem<unknown>>;
    _enableSyncScrollAfterScrollEnd?: boolean;
    _onScrollStart?: () => void;
    _onScrollEnd?: () => void;
};
export type WithPickerControlProps<PickerPropsT extends RequiredPickerProps> = PickerPropsT & {
    pickerName: string;
    control: Control;
};
export declare const withPickerControl: <PropsT extends RequiredPickerProps>(PickerComponent: ComponentType<PropsT>) => React.NamedExoticComponent<React.PropsWithoutRef<WithPickerControlProps<PropsT>> & React.RefAttributes<React.ComponentRef<React.ComponentType<PropsT>>>>;
export {};
//# sourceMappingURL=withPickerControl.d.ts.map
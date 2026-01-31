import React, { type ComponentType, type PropsWithChildren } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PickerProps } from '../base';
type ContextValue = {
    itemHeight: number | undefined;
    visibleItemCount: number | undefined;
    readOnly: boolean | undefined;
    enableScrollByTapOnItem: boolean | undefined;
    scrollEventThrottle: number | undefined;
    pickerStyle: StyleProp<ViewStyle> | undefined;
    itemTextStyle: StyleProp<TextStyle> | undefined;
    overlayItemStyle: StyleProp<ViewStyle> | undefined;
    contentContainerStyle: StyleProp<ViewStyle> | undefined;
};
type DatePickerCommonPropsProviderProps = PropsWithChildren<ContextValue>;
declare const DatePickerCommonPropsProvider: ({ children, ...restProps }: DatePickerCommonPropsProviderProps) => React.JSX.Element;
export default DatePickerCommonPropsProvider;
type PickedWheelPickerProps = Pick<PickerProps<any>, Exclude<keyof ContextValue, 'pickerStyle'> | 'style'>;
export declare const withCommonProps: <ComponentPropsT extends PickedWheelPickerProps>(WheelPickerComponent: ComponentType<ComponentPropsT>) => typeof WheelPickerComponent;
//# sourceMappingURL=DatePickerCommonPropsProvider.d.ts.map
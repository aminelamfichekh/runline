import React, { type ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { type DateNodeType } from './DatePickerContainer';
import type { OnlyDateFormat } from './date';
type DatePickerProps = {
    date: OnlyDateFormat;
    onDateChanged: (event: {
        date: OnlyDateFormat;
    }) => void;
    minDate?: OnlyDateFormat;
    maxDate?: OnlyDateFormat;
    locale?: string;
    renderDate?: () => ReactNode;
    renderMonth?: () => ReactNode;
    renderYear?: () => ReactNode;
    children?: (props: {
        dateNodes: {
            node: ReactNode;
            type: DateNodeType;
        }[];
    }) => ReactNode;
    itemHeight?: number;
    visibleItemCount?: number;
    readOnly?: boolean;
    enableScrollByTapOnItem?: boolean;
    scrollEventThrottle?: number;
    pickerStyle?: StyleProp<ViewStyle>;
    itemTextStyle?: StyleProp<TextStyle>;
    overlayItemStyle?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
};
export declare const DatePicker: {
    ({ date, onDateChanged, minDate, maxDate, locale, renderDate, renderMonth, renderYear, children, itemHeight, visibleItemCount, readOnly, enableScrollByTapOnItem, scrollEventThrottle, pickerStyle, itemTextStyle, overlayItemStyle, contentContainerStyle, }: DatePickerProps): React.JSX.Element;
    displayName: string;
} & {
    Date: React.MemoExoticComponent<({ width, overlayItemStyle: overlayItemStyleProp, ...restProps }: import("./DatePickerDate").DatePickerDateProps) => React.JSX.Element>;
    Month: React.MemoExoticComponent<({ width, overlayItemStyle: overlayItemStyleProp, ...restProps }: import("./DatePickerMonth").DatePickerMonthProps) => React.JSX.Element>;
    Year: React.MemoExoticComponent<({ width, overlayItemStyle: overlayItemStyleProp, ...restProps }: import("./DatePickerYear").DatePickerYearProps) => React.JSX.Element>;
};
export {};
//# sourceMappingURL=DatePicker.d.ts.map
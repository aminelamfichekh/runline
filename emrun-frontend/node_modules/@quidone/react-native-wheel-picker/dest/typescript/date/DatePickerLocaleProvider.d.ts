import React, { type PropsWithChildren } from 'react';
import { type DateUnitType } from './date';
type ContextValue = {
    locale: string;
    sortedDateUnitTypes: DateUnitType[];
    monthLongNames: string[];
};
type DatePickerLocaleProviderProps = PropsWithChildren<{
    locale?: string;
}>;
declare const DatePickerLocaleProvider: ({ locale, children, }: DatePickerLocaleProviderProps) => React.JSX.Element;
export default DatePickerLocaleProvider;
export declare const useDatePickerLocale: () => ContextValue;
//# sourceMappingURL=DatePickerLocaleProvider.d.ts.map
import React, { type PropsWithChildren } from 'react';
import { type PickerControl } from '../picker-control';
import { type DateLocale, type OnlyDateFormat, type OnlyDateUnits } from './date';
type ContextValue = {
    pickerControl: PickerControl;
    value: OnlyDateUnits;
    max: Date;
    min: Date;
};
type DatePickerValueProviderProps = PropsWithChildren<{
    date: OnlyDateFormat;
    locale?: DateLocale;
    minDate?: OnlyDateFormat;
    maxDate?: OnlyDateFormat;
    onDateChanged: (event: {
        date: OnlyDateFormat;
    }) => void;
}>;
declare const DatePickerValueProvider: ({ date, maxDate, minDate, onDateChanged, children, }: DatePickerValueProviderProps) => React.JSX.Element;
export default DatePickerValueProvider;
export declare const useDateContext: () => ContextValue;
//# sourceMappingURL=DatePickerValueProvider.d.ts.map
import React, { type ReactNode } from 'react';
export type DateNodeType = 'date' | 'month' | 'year';
type DatePickerContainerProps = {
    renderDate?: () => ReactNode;
    renderMonth?: () => ReactNode;
    renderYear?: () => ReactNode;
    children: (props: {
        dateNodes: {
            node: ReactNode;
            type: DateNodeType;
        }[];
    }) => ReactNode;
};
declare const DatePickerContainer: ({ renderDate, renderMonth, renderYear, children, }: DatePickerContainerProps) => React.JSX.Element;
export default DatePickerContainer;
//# sourceMappingURL=DatePickerContainer.d.ts.map
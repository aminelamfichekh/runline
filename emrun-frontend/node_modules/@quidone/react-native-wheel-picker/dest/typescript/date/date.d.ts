export type OnlyDateFormat = string;
export type OnlyDateUnits = {
    date: number;
    month: number;
    year: number;
};
export type DateUnitType = 'date' | 'month' | 'year';
export type DateLocale = {
    locale: string;
};
export declare const DateUtils: {
    MONTH_COUNT: number;
    toUnits: (date: OnlyDateFormat | Date) => OnlyDateUnits;
    toDate: (units: OnlyDateUnits) => Date;
    toOnlyDateFormat: (units: OnlyDateUnits) => OnlyDateFormat;
    inRange: (units: OnlyDateUnits, start: Date, end: Date) => boolean;
    withBoundaries: (date: Date, min: Date, max: Date) => Date;
    getDaysInMonth: (year: number, month: number) => number;
    getSortedDateUnitPositions: (locale: string) => DateUnitType[];
    getLocalizedMonthNames: (locale: string) => string[];
    isFirstUnitPosition: (list: DateUnitType[], search: DateUnitType) => boolean;
    isLastUnitPosition: (list: DateUnitType[], search: DateUnitType) => boolean;
};
//# sourceMappingURL=date.d.ts.map
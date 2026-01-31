import React, { createContext, useContext, useMemo } from 'react';
import { DateUtils } from './date';
const DatePickerLocaleContext = /*#__PURE__*/createContext(undefined);
const DatePickerLocaleProvider = ({
  locale = 'en',
  children
}) => {
  const value = useMemo(() => ({
    locale,
    monthLongNames: DateUtils.getLocalizedMonthNames(locale),
    sortedDateUnitTypes: DateUtils.getSortedDateUnitPositions(locale)
  }), [locale]);
  return /*#__PURE__*/React.createElement(DatePickerLocaleContext.Provider, {
    value: value
  }, children);
};
export default DatePickerLocaleProvider;
export const useDatePickerLocale = () => {
  const value = useContext(DatePickerLocaleContext);
  if (value === undefined) {
    throw new Error('useDatePickerLocale must be called from within DatePickerLocaleContext.Provider!');
  }
  return useContext(DatePickerLocaleContext);
};
//# sourceMappingURL=DatePickerLocaleProvider.js.map
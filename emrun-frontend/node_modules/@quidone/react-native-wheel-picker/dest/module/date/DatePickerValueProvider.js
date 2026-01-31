import React, { createContext, useContext, useMemo } from 'react';
import { getDaysInMonth, isSameDay } from 'date-fns';
import { useOnPickerValueChangedEffect, usePickerControl } from '../picker-control';
import { DateUtils } from './date';
const DatePickerContext = /*#__PURE__*/createContext(undefined);
const DatePickerValueProvider = ({
  date,
  maxDate,
  minDate,
  onDateChanged,
  children
}) => {
  const {
    min,
    max
  } = useMemo(() => {
    const now = new Date();
    const getMaxDefault = () => {
      const year = now.getFullYear() + 100;
      const month = 11;
      return new Date(year, month, DateUtils.getDaysInMonth(year, month));
    };
    const getMinDefault = () => new Date(now.getFullYear() - 100, 0, 1);
    return {
      max: maxDate ? new Date(maxDate) : getMaxDefault(),
      min: minDate ? new Date(minDate) : getMinDefault()
    };
  }, [maxDate, minDate]);
  const pickerControl = usePickerControl();
  useOnPickerValueChangedEffect(pickerControl, event => {
    const nextUnits = {
      year: event.pickers.year.item.value,
      month: event.pickers.month.item.value,
      date: event.pickers.date.item.value
    };
    const daysInCurMonth = getDaysInMonth(new Date(nextUnits.year, nextUnits.month));
    if (daysInCurMonth < nextUnits.date) {
      nextUnits.date = daysInCurMonth;
    }
    const curDateObj = new Date(date);
    const dateObj = new Date(nextUnits.year, nextUnits.month, nextUnits.date);
    const normalizedDateObj = DateUtils.withBoundaries(dateObj, min, max);
    if (isSameDay(curDateObj, normalizedDateObj)) {
      return;
    }
    onDateChanged === null || onDateChanged === void 0 || onDateChanged({
      date: DateUtils.toOnlyDateFormat({
        year: normalizedDateObj.getFullYear(),
        month: normalizedDateObj.getMonth(),
        date: normalizedDateObj.getDate()
      })
    });
  });
  const value = useMemo(() => ({
    pickerControl,
    value: DateUtils.toUnits(DateUtils.withBoundaries(new Date(date), min, max)),
    max,
    min
  }), [pickerControl, date, max, min]);
  return /*#__PURE__*/React.createElement(DatePickerContext.Provider, {
    value: value
  }, children);
};
export default DatePickerValueProvider;
export const useDateContext = () => {
  const value = useContext(DatePickerContext);
  if (value === undefined) {
    throw new Error('useDateContext must be called from within DatePicker.Provider!');
  }
  return useContext(DatePickerContext);
};
//# sourceMappingURL=DatePickerValueProvider.js.map
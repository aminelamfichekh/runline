"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateUtils = void 0;
var _dateFns = require("date-fns");
// YYYY-MM-DD

const withBoundaries = (date, min, max) => {
  if ((0, _dateFns.isBefore)(date, min)) {
    date = min;
  } else if ((0, _dateFns.isAfter)(date, max)) {
    date = max;
  }
  return date;
};
const toUnits = date => {
  let dateObj = new Date(date);
  return {
    year: dateObj.getFullYear(),
    month: dateObj.getMonth(),
    date: dateObj.getDate()
  };
};
const inRange = (units, start, end) => {
  return (0, _dateFns.isWithinInterval)(toDate(units), {
    start: (0, _dateFns.startOfDay)(start),
    end: (0, _dateFns.startOfDay)(end)
  });
};
const toDate = units => {
  return new Date(units.year, units.month, units.date);
};
const toOnlyDateFormat = units => {
  const date = new Date(units.year, units.month, units.date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();

  // Pad single digit month and day with leading zeros
  const monthFormatted = month < 10 ? `0${month}` : month;
  const dayFormatted = day < 10 ? `0${day}` : day;
  return `${year}-${monthFormatted}-${dayFormatted}`;
};
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};
const getSortedDateUnitPositions = locale => {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const parts = formatter.formatToParts(new Date());
  const orderMap = {
    day: 'date',
    month: 'month',
    year: 'year'
  };

  // Создаем массив с правильным порядком элементов
  const order = [];
  parts.forEach(part => {
    // part - это объект {type: string, value: string}
    if (part.type in orderMap) {
      order.push(orderMap[part.type]);
    }
  });
  return order;
};
const getLocalizedMonthNames = locale => {
  const monthNames = [];
  for (let monthIndex = 0; monthIndex < DateUtils.MONTH_COUNT; monthIndex++) {
    const date = new Date(2025, monthIndex, 1); // Создаем дату для каждого месяца
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'long'
    });
    const monthName = formatter.format(date);
    monthNames.push(monthName);
  }
  return monthNames;
};
const isFirstUnitPosition = (list, search) => {
  return list[0] === search;
};
const isLastUnitPosition = (list, search) => {
  return list.at(-1) === search;
};
const DateUtils = exports.DateUtils = {
  MONTH_COUNT: 12,
  toUnits,
  toDate,
  toOnlyDateFormat,
  inRange,
  withBoundaries,
  getDaysInMonth,
  getSortedDateUnitPositions,
  getLocalizedMonthNames,
  isFirstUnitPosition,
  isLastUnitPosition
};
//# sourceMappingURL=date.js.map
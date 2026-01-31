"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDateContext = exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _dateFns = require("date-fns");
var _pickerControl = require("../picker-control");
var _date = require("./date");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const DatePickerContext = /*#__PURE__*/(0, _react.createContext)(undefined);
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
  } = (0, _react.useMemo)(() => {
    const now = new Date();
    const getMaxDefault = () => {
      const year = now.getFullYear() + 100;
      const month = 11;
      return new Date(year, month, _date.DateUtils.getDaysInMonth(year, month));
    };
    const getMinDefault = () => new Date(now.getFullYear() - 100, 0, 1);
    return {
      max: maxDate ? new Date(maxDate) : getMaxDefault(),
      min: minDate ? new Date(minDate) : getMinDefault()
    };
  }, [maxDate, minDate]);
  const pickerControl = (0, _pickerControl.usePickerControl)();
  (0, _pickerControl.useOnPickerValueChangedEffect)(pickerControl, event => {
    const nextUnits = {
      year: event.pickers.year.item.value,
      month: event.pickers.month.item.value,
      date: event.pickers.date.item.value
    };
    const daysInCurMonth = (0, _dateFns.getDaysInMonth)(new Date(nextUnits.year, nextUnits.month));
    if (daysInCurMonth < nextUnits.date) {
      nextUnits.date = daysInCurMonth;
    }
    const curDateObj = new Date(date);
    const dateObj = new Date(nextUnits.year, nextUnits.month, nextUnits.date);
    const normalizedDateObj = _date.DateUtils.withBoundaries(dateObj, min, max);
    if ((0, _dateFns.isSameDay)(curDateObj, normalizedDateObj)) {
      return;
    }
    onDateChanged === null || onDateChanged === void 0 || onDateChanged({
      date: _date.DateUtils.toOnlyDateFormat({
        year: normalizedDateObj.getFullYear(),
        month: normalizedDateObj.getMonth(),
        date: normalizedDateObj.getDate()
      })
    });
  });
  const value = (0, _react.useMemo)(() => ({
    pickerControl,
    value: _date.DateUtils.toUnits(_date.DateUtils.withBoundaries(new Date(date), min, max)),
    max,
    min
  }), [pickerControl, date, max, min]);
  return /*#__PURE__*/_react.default.createElement(DatePickerContext.Provider, {
    value: value
  }, children);
};
var _default = exports.default = DatePickerValueProvider;
const useDateContext = () => {
  const value = (0, _react.useContext)(DatePickerContext);
  if (value === undefined) {
    throw new Error('useDateContext must be called from within DatePicker.Provider!');
  }
  return (0, _react.useContext)(DatePickerContext);
};
exports.useDateContext = useDateContext;
//# sourceMappingURL=DatePickerValueProvider.js.map
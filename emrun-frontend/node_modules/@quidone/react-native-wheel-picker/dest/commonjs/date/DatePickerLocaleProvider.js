"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDatePickerLocale = exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _date = require("./date");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const DatePickerLocaleContext = /*#__PURE__*/(0, _react.createContext)(undefined);
const DatePickerLocaleProvider = ({
  locale = 'en',
  children
}) => {
  const value = (0, _react.useMemo)(() => ({
    locale,
    monthLongNames: _date.DateUtils.getLocalizedMonthNames(locale),
    sortedDateUnitTypes: _date.DateUtils.getSortedDateUnitPositions(locale)
  }), [locale]);
  return /*#__PURE__*/_react.default.createElement(DatePickerLocaleContext.Provider, {
    value: value
  }, children);
};
var _default = exports.default = DatePickerLocaleProvider;
const useDatePickerLocale = () => {
  const value = (0, _react.useContext)(DatePickerLocaleContext);
  if (value === undefined) {
    throw new Error('useDatePickerLocale must be called from within DatePickerLocaleContext.Provider!');
  }
  return (0, _react.useContext)(DatePickerLocaleContext);
};
exports.useDatePickerLocale = useDatePickerLocale;
//# sourceMappingURL=DatePickerLocaleProvider.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _base = _interopRequireDefault(require("../base"));
var _DatePickerValueProvider = require("./DatePickerValueProvider");
var _useOverlayItemStyle = require("./useOverlayItemStyle");
var _DatePickerLocaleProvider = require("./DatePickerLocaleProvider");
var _DatePickerCommonPropsProvider = require("./DatePickerCommonPropsProvider");
var _pickerControl = require("../picker-control");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const HocPicker = (0, _DatePickerCommonPropsProvider.withCommonProps)((0, _pickerControl.withPickerControl)(_base.default));
const DatePickerYear = ({
  width = 100,
  overlayItemStyle: overlayItemStyleProp,
  ...restProps
}) => {
  const localeData = (0, _DatePickerLocaleProvider.useDatePickerLocale)();
  const dateContext = (0, _DatePickerValueProvider.useDateContext)();
  const value = dateContext.value;
  const data = (0, _react.useMemo)(() => {
    const startYear = dateContext.min.getFullYear();
    const endYear = dateContext.max.getFullYear();
    return Array.from({
      length: endYear - startYear + 1
    }, (_, index) => ({
      value: startYear + index
    }));
  }, [dateContext.max, dateContext.min]);
  const overlayItemStyle = (0, _useOverlayItemStyle.useOverlayItemStyle)({
    curUnit: 'year',
    unitPositions: localeData.sortedDateUnitTypes,
    propStyle: overlayItemStyleProp
  });
  return /*#__PURE__*/_react.default.createElement(HocPicker, _extends({
    width: width,
    overlayItemStyle: overlayItemStyle
  }, restProps, {
    pickerName: 'year',
    control: dateContext.pickerControl,
    value: value.year,
    data: data
  }));
};
var _default = exports.default = /*#__PURE__*/(0, _react.memo)(DatePickerYear);
//# sourceMappingURL=DatePickerYear.js.map
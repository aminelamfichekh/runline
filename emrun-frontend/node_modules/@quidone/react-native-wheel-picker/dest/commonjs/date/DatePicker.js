"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatePicker = void 0;
var _react = _interopRequireDefault(require("react"));
var _DatePickerValueProvider = _interopRequireDefault(require("./DatePickerValueProvider"));
var _DatePickerDate = _interopRequireDefault(require("./DatePickerDate"));
var _DatePickerMonth = _interopRequireDefault(require("./DatePickerMonth"));
var _DatePickerYear = _interopRequireDefault(require("./DatePickerYear"));
var _DatePickerContainer = _interopRequireDefault(require("./DatePickerContainer"));
var _DatePickerLocaleProvider = _interopRequireDefault(require("./DatePickerLocaleProvider"));
var _DatePickerCommonPropsProvider = _interopRequireDefault(require("./DatePickerCommonPropsProvider"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DatePickerComponent = ({
  date,
  onDateChanged,
  minDate,
  maxDate,
  locale,
  renderDate,
  renderMonth,
  renderYear,
  children = ({
    dateNodes
  }) => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, dateNodes.map(dateNode => dateNode.node)),
  // region common props for all child wheel pickers
  itemHeight,
  visibleItemCount,
  readOnly,
  enableScrollByTapOnItem,
  scrollEventThrottle,
  pickerStyle,
  itemTextStyle,
  overlayItemStyle,
  contentContainerStyle
}) => {
  return /*#__PURE__*/_react.default.createElement(_DatePickerLocaleProvider.default, {
    locale: locale
  }, /*#__PURE__*/_react.default.createElement(_DatePickerValueProvider.default, {
    date: date,
    onDateChanged: onDateChanged,
    minDate: minDate,
    maxDate: maxDate
  }, /*#__PURE__*/_react.default.createElement(_DatePickerCommonPropsProvider.default, {
    itemHeight: itemHeight,
    visibleItemCount: visibleItemCount,
    readOnly: readOnly,
    enableScrollByTapOnItem: enableScrollByTapOnItem,
    scrollEventThrottle: scrollEventThrottle,
    pickerStyle: pickerStyle,
    itemTextStyle: itemTextStyle,
    overlayItemStyle: overlayItemStyle,
    contentContainerStyle: contentContainerStyle
  }, /*#__PURE__*/_react.default.createElement(_DatePickerContainer.default, {
    renderDate: renderDate,
    renderMonth: renderMonth,
    renderYear: renderYear
  }, children))));
};
DatePickerComponent.displayName = 'DatePicker';
const DatePicker = exports.DatePicker = Object.assign(DatePickerComponent, {
  Date: _DatePickerDate.default,
  Month: _DatePickerMonth.default,
  Year: _DatePickerYear.default
});
//# sourceMappingURL=DatePicker.js.map
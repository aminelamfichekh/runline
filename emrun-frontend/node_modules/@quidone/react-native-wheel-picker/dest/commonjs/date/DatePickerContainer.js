"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _DatePickerDate = _interopRequireDefault(require("./DatePickerDate"));
var _DatePickerMonth = _interopRequireDefault(require("./DatePickerMonth"));
var _DatePickerYear = _interopRequireDefault(require("./DatePickerYear"));
var _DatePickerLocaleProvider = require("./DatePickerLocaleProvider");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const DatePickerContainer = ({
  renderDate = () => /*#__PURE__*/_react.default.createElement(_DatePickerDate.default, null),
  renderMonth = () => /*#__PURE__*/_react.default.createElement(_DatePickerMonth.default, null),
  renderYear = () => /*#__PURE__*/_react.default.createElement(_DatePickerYear.default, null),
  children
}) => {
  const localeData = (0, _DatePickerLocaleProvider.useDatePickerLocale)();
  const typeToRenderMap = {
    date: renderDate,
    month: renderMonth,
    year: renderYear
  };
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: {
      flexDirection: 'row'
    }
  }, children({
    dateNodes: localeData.sortedDateUnitTypes.map(type => ({
      type,
      node: /*#__PURE__*/_react.default.createElement(_react.Fragment, {
        key: type
      }, typeToRenderMap[type]())
    }))
  }));
};
var _default = exports.default = DatePickerContainer;
//# sourceMappingURL=DatePickerContainer.js.map
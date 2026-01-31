"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useOverlayItemStyle = exports.dateStyles = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _date = require("./date");
const useOverlayItemStyle = ({
  curUnit,
  unitPositions,
  propStyle
}) => {
  return (0, _react.useMemo)(() => {
    if (_date.DateUtils.isFirstUnitPosition(unitPositions, curUnit)) {
      return [dateStyles.leftItemOverlay, propStyle];
    } else if (_date.DateUtils.isLastUnitPosition(unitPositions, curUnit)) {
      return [dateStyles.rightItemOverlay, propStyle];
    } else {
      return [dateStyles.zeroBorderRadius, propStyle];
    }
  }, [curUnit, propStyle, unitPositions]);
};
exports.useOverlayItemStyle = useOverlayItemStyle;
const dateStyles = exports.dateStyles = _reactNative.StyleSheet.create({
  leftItemOverlay: {
    borderRadius: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  rightItemOverlay: {
    borderRadius: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  },
  zeroBorderRadius: {
    borderRadius: 0
  }
});
//# sourceMappingURL=useOverlayItemStyle.js.map
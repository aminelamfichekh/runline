"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useScrollContentOffset = exports.ScrollContentOffsetContext = void 0;
var _react = require("react");
const ScrollContentOffsetContext = exports.ScrollContentOffsetContext = /*#__PURE__*/(0, _react.createContext)(undefined);
const useScrollContentOffset = () => {
  const value = (0, _react.useContext)(ScrollContentOffsetContext);
  if (value === undefined) {
    throw new Error('useScrollContentOffset must be called from within ScrollContentOffsetContext.Provider!');
  }
  return value;
};
exports.useScrollContentOffset = useScrollContentOffset;
//# sourceMappingURL=ScrollContentOffsetContext.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
var _react2 = require("../../../utils/react");
const useSyncScrollEffect = ({
  listRef,
  value,
  valueIndex,
  extraValues = [],
  activeIndexRef,
  touching,
  enableSyncScrollAfterScrollEnd
}) => {
  const syncScroll = (0, _reactUsefulHooks.useStableCallback)(() => {
    if (listRef.current == null || touching || activeIndexRef.current === valueIndex) {
      return;
    }
    listRef.current.scrollToIndex({
      index: valueIndex,
      animated: true
    });
  });
  const timeoutId = (0, _react.useRef)(undefined);
  (0, _react2.useEffectWithDynamicDepsLength)(() => {
    clearTimeout(timeoutId.current);
    // fix: loops between two values. We are making a small delay so that the value in other places can be updated for verification.
    timeoutId.current = setTimeout(syncScroll, 0);
  }, [valueIndex, enableSyncScrollAfterScrollEnd, ...extraValues]);
  const onScrollEnd = (0, _reactUsefulHooks.useStableCallback)(() => {
    if (enableSyncScrollAfterScrollEnd && value !== undefined) {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(syncScroll, 0);
    }
  });
  return {
    onScrollEnd
  };
};
var _default = exports.default = useSyncScrollEffect;
//# sourceMappingURL=useSyncScrollEffect.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
var _scrolling = require("../../../utils/scrolling");
const useValueEventsEffect = ({
  valueIndex,
  data,
  itemHeight,
  offsetYAv
}, {
  onValueChanging,
  onValueChanged
}) => {
  const activeIndexRef = (0, _react.useRef)(valueIndex);
  const getIndex = (0, _reactUsefulHooks.useStableCallback)(offset => (0, _scrolling.getPageIndex)(offset, {
    maxIndex: data.length - 1,
    pageLength: itemHeight
  }));
  (0, _react.useEffect)(() => {
    const id = offsetYAv.addListener(({
      value: offset
    }) => {
      const index = getIndex(offset);
      const activeIndex = activeIndexRef.current;
      if (index !== activeIndex) {
        activeIndexRef.current = index;
        onValueChanging === null || onValueChanging === void 0 || onValueChanging({
          item: data[index],
          index
        });
      }
    });
    return () => {
      offsetYAv.removeListener(id);
    };
  }, [data, getIndex, itemHeight, offsetYAv, onValueChanging]);
  const onStableValueChanged = (0, _reactUsefulHooks.useStableCallback)(() => {
    const activeIndex = activeIndexRef.current;
    if (activeIndex !== valueIndex) {
      onValueChanged === null || onValueChanged === void 0 || onValueChanged({
        index: activeIndex,
        item: data[activeIndex]
      });
    }
  });
  return {
    onScrollEnd: onStableValueChanged,
    activeIndexRef
  };
};
var _default = exports.default = useValueEventsEffect;
//# sourceMappingURL=useValueEventsEffect.js.map
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, memo, useEffect, useMemo, useRef } from 'react';
import { useStableCallback } from '@rozhkov/react-useful-hooks';
import debounce from '../debounce';
const withScrollStartEndEvent = Component => {
  const Wrapper = ({
    onScrollStart: onScrollStartProp,
    onScrollEnd: onScrollEndProp,
    onScrollBeginDrag: onScrollBeginDragProp,
    onScrollEndDrag: onScrollEndDragProp,
    onMomentumScrollBegin: onMomentumScrollBeginProp,
    onMomentumScrollEnd: onMomentumScrollEndProp,
    scrollOffset,
    ...rest
  }, forwardedRef) => {
    const onScrollStartStable = useStableCallback(onScrollStartProp);
    const isOnScrollStartCalledRef = useRef(false);
    const deactivateOnScrollStart = useStableCallback(() => {
      isOnScrollStartCalledRef.current = false;
    });
    const maybeCallOnScrollStart = useStableCallback(() => {
      if (!isOnScrollStartCalledRef.current) {
        onScrollStartStable();
        isOnScrollStartCalledRef.current = true;
      }
    });
    const onScrollEndStable = useStableCallback(() => {
      maybeCallOnScrollStart();
      onScrollEndProp === null || onScrollEndProp === void 0 || onScrollEndProp();
      deactivateOnScrollStart();
    });
    const onScrollEnd = useMemo(() => debounce(onScrollEndStable, 100),
    // A small delay is needed so that onScrollEnd doesn't trigger prematurely.
    [onScrollEndStable]);
    const onScrollBeginDrag = useStableCallback(args => {
      maybeCallOnScrollStart();
      onScrollBeginDragProp === null || onScrollBeginDragProp === void 0 || onScrollBeginDragProp(args);
    });
    const onScrollEndDrag = useStableCallback(args => {
      onScrollEndDragProp === null || onScrollEndDragProp === void 0 || onScrollEndDragProp(args);
      onScrollEnd();
    });
    const onMomentumScrollBegin = useStableCallback(args => {
      maybeCallOnScrollStart();
      onScrollEnd.clear();
      onMomentumScrollBeginProp === null || onMomentumScrollBeginProp === void 0 || onMomentumScrollBeginProp(args);
    });
    const onMomentumScrollEnd = useStableCallback(args => {
      onMomentumScrollEndProp === null || onMomentumScrollEndProp === void 0 || onMomentumScrollEndProp(args);
      onScrollEnd();
    });
    useEffect(() => {
      const sub = scrollOffset.addListener(() => {
        if (!isOnScrollStartCalledRef.current) {
          // If this condition is met, then we assume that no events were triggered,
          // and there was a change in the content that offset shifted to a smaller side
          maybeCallOnScrollStart();
          onScrollEnd();
        } else {
          onScrollEnd.clear();
        }
      });
      return () => {
        scrollOffset.removeListener(sub);
      };
    }, [maybeCallOnScrollStart, onScrollEnd, scrollOffset]);
    return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
      ref: forwardedRef,
      onScrollBeginDrag: onScrollBeginDrag,
      onScrollEndDrag: onScrollEndDrag,
      onMomentumScrollBegin: onMomentumScrollBegin,
      onMomentumScrollEnd: onMomentumScrollEnd
    }));
  };
  Wrapper.displayName = `withScrollStartEndEvent(${Component.displayName || 'Component'})`;
  return /*#__PURE__*/memo(/*#__PURE__*/forwardRef(Wrapper));
};
export default withScrollStartEndEvent;
//# sourceMappingURL=withScrollStartEndEvent.js.map
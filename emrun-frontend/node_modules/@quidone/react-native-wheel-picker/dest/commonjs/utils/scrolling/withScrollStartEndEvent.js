"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactUsefulHooks = require("@rozhkov/react-useful-hooks");
var _debounce = _interopRequireDefault(require("../debounce"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    const onScrollStartStable = (0, _reactUsefulHooks.useStableCallback)(onScrollStartProp);
    const isOnScrollStartCalledRef = (0, _react.useRef)(false);
    const deactivateOnScrollStart = (0, _reactUsefulHooks.useStableCallback)(() => {
      isOnScrollStartCalledRef.current = false;
    });
    const maybeCallOnScrollStart = (0, _reactUsefulHooks.useStableCallback)(() => {
      if (!isOnScrollStartCalledRef.current) {
        onScrollStartStable();
        isOnScrollStartCalledRef.current = true;
      }
    });
    const onScrollEndStable = (0, _reactUsefulHooks.useStableCallback)(() => {
      maybeCallOnScrollStart();
      onScrollEndProp === null || onScrollEndProp === void 0 || onScrollEndProp();
      deactivateOnScrollStart();
    });
    const onScrollEnd = (0, _react.useMemo)(() => (0, _debounce.default)(onScrollEndStable, 100),
    // A small delay is needed so that onScrollEnd doesn't trigger prematurely.
    [onScrollEndStable]);
    const onScrollBeginDrag = (0, _reactUsefulHooks.useStableCallback)(args => {
      maybeCallOnScrollStart();
      onScrollBeginDragProp === null || onScrollBeginDragProp === void 0 || onScrollBeginDragProp(args);
    });
    const onScrollEndDrag = (0, _reactUsefulHooks.useStableCallback)(args => {
      onScrollEndDragProp === null || onScrollEndDragProp === void 0 || onScrollEndDragProp(args);
      onScrollEnd();
    });
    const onMomentumScrollBegin = (0, _reactUsefulHooks.useStableCallback)(args => {
      maybeCallOnScrollStart();
      onScrollEnd.clear();
      onMomentumScrollBeginProp === null || onMomentumScrollBeginProp === void 0 || onMomentumScrollBeginProp(args);
    });
    const onMomentumScrollEnd = (0, _reactUsefulHooks.useStableCallback)(args => {
      onMomentumScrollEndProp === null || onMomentumScrollEndProp === void 0 || onMomentumScrollEndProp(args);
      onScrollEnd();
    });
    (0, _react.useEffect)(() => {
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
    return /*#__PURE__*/_react.default.createElement(Component, _extends({}, rest, {
      ref: forwardedRef,
      onScrollBeginDrag: onScrollBeginDrag,
      onScrollEndDrag: onScrollEndDrag,
      onMomentumScrollBegin: onMomentumScrollBegin,
      onMomentumScrollEnd: onMomentumScrollEnd
    }));
  };
  Wrapper.displayName = `withScrollStartEndEvent(${Component.displayName || 'Component'})`;
  return /*#__PURE__*/(0, _react.memo)(/*#__PURE__*/(0, _react.forwardRef)(Wrapper));
};
var _default = exports.default = withScrollStartEndEvent;
//# sourceMappingURL=withScrollStartEndEvent.js.map
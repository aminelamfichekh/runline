function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import Picker from '../../base';
import VirtualizedList from './VirtualizedList';
const renderList = props => {
  return /*#__PURE__*/React.createElement(VirtualizedList, props);
};
const withVirtualized = WrappedComponent => {
  const Wrapper = props => {
    return /*#__PURE__*/React.createElement(Picker, _extends({}, props, {
      renderList: renderList
    }));
  };

  // @ts-ignore
  Wrapper.displayName = `withVirtualized(${WrappedComponent.displayName})`;
  return Wrapper;
};
export default withVirtualized;
//# sourceMappingURL=withVirtualized.js.map
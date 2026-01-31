import { createContext, useContext } from 'react';
export const ScrollContentOffsetContext = /*#__PURE__*/createContext(undefined);
export const useScrollContentOffset = () => {
  const value = useContext(ScrollContentOffsetContext);
  if (value === undefined) {
    throw new Error('useScrollContentOffset must be called from within ScrollContentOffsetContext.Provider!');
  }
  return value;
};
//# sourceMappingURL=ScrollContentOffsetContext.js.map
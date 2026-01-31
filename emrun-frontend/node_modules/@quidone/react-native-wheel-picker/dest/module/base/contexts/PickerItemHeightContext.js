import { createContext, useContext } from 'react';
export const PickerItemHeightContext = /*#__PURE__*/createContext(undefined);
export const usePickerItemHeight = () => {
  const value = useContext(PickerItemHeightContext);
  if (value === undefined) {
    throw new Error('usePickerItemHeight must be called from within PickerItemHeightContext.Provider!');
  }
  return value;
};
//# sourceMappingURL=PickerItemHeightContext.js.map
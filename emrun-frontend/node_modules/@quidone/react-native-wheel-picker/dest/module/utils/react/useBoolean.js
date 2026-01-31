import { useCallback, useState } from 'react';
const useBoolean = defaultValue => {
  const [value, setValue] = useState(defaultValue);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return {
    value,
    setTrue,
    setFalse
  };
};
export default useBoolean;
//# sourceMappingURL=useBoolean.js.map
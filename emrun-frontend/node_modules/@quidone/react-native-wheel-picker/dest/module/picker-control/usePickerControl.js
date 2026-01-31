import { useEffect } from 'react';
import { useInit, useStableCallback } from '@rozhkov/react-useful-hooks';
import { createControl } from './create-control';
export const usePickerControl = () => {
  return useInit(() => createControl());
};
export const useOnPickerValueChangedEffect = (control, effect) => {
  const effectStable = useStableCallback(effect);
  useEffect(() => {
    const unsubscribe = control._on('onValueChanged', effectStable);
    return () => {
      unsubscribe();
    };
  }, [control]); // eslint-disable-line react-hooks/exhaustive-deps
};
export const useOnPickerValueChangingEffect = (control, effect) => {
  const effectStable = useStableCallback(effect);
  useEffect(() => {
    const unsubscribe = control._on('onValueChanging', effectStable);
    return () => {
      unsubscribe();
    };
  }, [control]); // eslint-disable-line react-hooks/exhaustive-deps
};
//# sourceMappingURL=usePickerControl.js.map
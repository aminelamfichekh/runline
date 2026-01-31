import { useRef } from 'react';
import { useStableCallback } from '@rozhkov/react-useful-hooks';
import { useEffectWithDynamicDepsLength } from '../../../utils/react';
const useSyncScrollEffect = ({
  listRef,
  value,
  valueIndex,
  extraValues = [],
  activeIndexRef,
  touching,
  enableSyncScrollAfterScrollEnd
}) => {
  const syncScroll = useStableCallback(() => {
    if (listRef.current == null || touching || activeIndexRef.current === valueIndex) {
      return;
    }
    listRef.current.scrollToIndex({
      index: valueIndex,
      animated: true
    });
  });
  const timeoutId = useRef(undefined);
  useEffectWithDynamicDepsLength(() => {
    clearTimeout(timeoutId.current);
    // fix: loops between two values. We are making a small delay so that the value in other places can be updated for verification.
    timeoutId.current = setTimeout(syncScroll, 0);
  }, [valueIndex, enableSyncScrollAfterScrollEnd, ...extraValues]);
  const onScrollEnd = useStableCallback(() => {
    if (enableSyncScrollAfterScrollEnd && value !== undefined) {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(syncScroll, 0);
    }
  });
  return {
    onScrollEnd
  };
};
export default useSyncScrollEffect;
//# sourceMappingURL=useSyncScrollEffect.js.map
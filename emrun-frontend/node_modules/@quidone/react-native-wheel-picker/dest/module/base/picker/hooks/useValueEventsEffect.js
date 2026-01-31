import { useEffect, useRef } from 'react';
import { useStableCallback } from '@rozhkov/react-useful-hooks';
import { getPageIndex } from '../../../utils/scrolling';
const useValueEventsEffect = ({
  valueIndex,
  data,
  itemHeight,
  offsetYAv
}, {
  onValueChanging,
  onValueChanged
}) => {
  const activeIndexRef = useRef(valueIndex);
  const getIndex = useStableCallback(offset => getPageIndex(offset, {
    maxIndex: data.length - 1,
    pageLength: itemHeight
  }));
  useEffect(() => {
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
  const onStableValueChanged = useStableCallback(() => {
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
export default useValueEventsEffect;
//# sourceMappingURL=useValueEventsEffect.js.map
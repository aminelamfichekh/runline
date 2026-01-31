import type { Animated } from 'react-native';
declare const useValueEventsEffect: <ItemT>({ valueIndex, data, itemHeight, offsetYAv, }: {
    valueIndex: number;
    data: ReadonlyArray<ItemT>;
    itemHeight: number;
    offsetYAv: Animated.Value;
}, { onValueChanging, onValueChanged, }: {
    onValueChanging: ((event: {
        item: ItemT;
        index: number;
    }) => void) | undefined;
    onValueChanged: ((event: {
        item: ItemT;
        index: number;
    }) => void) | undefined;
}) => {
    onScrollEnd: () => void;
    activeIndexRef: import("react").RefObject<number>;
};
export default useValueEventsEffect;
//# sourceMappingURL=useValueEventsEffect.d.ts.map
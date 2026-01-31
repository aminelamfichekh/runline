import { type RefObject } from 'react';
import type { ListMethods } from '../../types';
declare const useSyncScrollEffect: ({ listRef, value, valueIndex, extraValues, activeIndexRef, touching, enableSyncScrollAfterScrollEnd, }: {
    listRef: RefObject<ListMethods | null>;
    value: unknown;
    valueIndex: number;
    extraValues: unknown[] | undefined;
    activeIndexRef: RefObject<number>;
    touching: boolean;
    enableSyncScrollAfterScrollEnd: boolean;
}) => {
    onScrollEnd: () => void;
};
export default useSyncScrollEffect;
//# sourceMappingURL=useSyncScrollEffect.d.ts.map
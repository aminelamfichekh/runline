import { type StyleProp, type ViewStyle } from 'react-native';
import { type DateUnitType } from './date';
export declare const useOverlayItemStyle: ({ curUnit, unitPositions, propStyle, }: {
    unitPositions: DateUnitType[];
    curUnit: DateUnitType;
    propStyle: StyleProp<ViewStyle>;
}) => (StyleProp<ViewStyle> | {
    borderRadius: number;
})[];
export declare const dateStyles: {
    leftItemOverlay: {
        borderRadius: number;
        borderTopLeftRadius: number;
        borderBottomLeftRadius: number;
    };
    rightItemOverlay: {
        borderRadius: number;
        borderTopRightRadius: number;
        borderBottomRightRadius: number;
    };
    zeroBorderRadius: {
        borderRadius: number;
    };
};
//# sourceMappingURL=useOverlayItemStyle.d.ts.map
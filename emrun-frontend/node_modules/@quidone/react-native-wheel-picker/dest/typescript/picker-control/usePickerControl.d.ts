import { type BaseControlConfig, type Control, type ControlEvents } from './create-control';
export declare const usePickerControl: <Config extends BaseControlConfig = BaseControlConfig>() => Control<Config>;
export declare const useOnPickerValueChangedEffect: <ControlT extends Control>(control: ControlT, effect: ControlEvents<ControlT>["onValueChanged"]) => void;
export declare const useOnPickerValueChangingEffect: <ControlT extends Control>(control: ControlT, effect: ControlEvents<ControlT>["onValueChanging"]) => void;
//# sourceMappingURL=usePickerControl.d.ts.map
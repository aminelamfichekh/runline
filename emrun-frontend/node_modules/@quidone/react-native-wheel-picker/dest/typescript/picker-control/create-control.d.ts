import type { PickerItem, ValueChangedEvent, ValueChangingEvent } from '../base';
import { type Unsubscribe } from '../utils/nanoevents';
type PickerName = string;
export type BaseControlConfig = Record<PickerName, {
    item: PickerItem<unknown>;
}>;
export type ControlEvents<ControlT extends Control = Control> = {
    onValueChanged: (event: {
        pickers: NonNullable<ControlT['__SAVED_TYPE_CONFIG__']>;
    }) => void;
    onValueChanging: (event: {
        pickers: NonNullable<ControlT['__SAVED_TYPE_CONFIG__']>;
    }) => void;
};
export type ControlSubscriber = {
    getExtraValues: () => unknown[];
    getEveryIsStopped: () => boolean;
    emitOnValueChanged: (event: ValueChangedEvent<PickerItem<unknown>>) => void;
    emitOnValueChanging: (event: ValueChangingEvent<PickerItem<unknown>>) => void;
    emitOnNewPropValue: (event: {
        item: PickerItem<unknown>;
    }) => void;
    emitOnScrollStart: () => void;
    emitOnScrollEnd: () => void;
    onNewExtraValues: (cb: () => void) => Unsubscribe;
    onAllScrollEnd: (cb: () => void) => Unsubscribe;
    disconnect: () => void;
};
export type Control<ConfigT extends BaseControlConfig = BaseControlConfig> = {
    _connect: (info: {
        pickerName: PickerName;
        item: PickerItem<unknown>;
    }) => ControlSubscriber;
    _on: <NameT extends keyof ControlEvents>(event: NameT, callback: ControlEvents[NameT]) => Unsubscribe;
    __SAVED_TYPE_CONFIG__?: ConfigT;
};
export declare const createControl: <ConfigT extends BaseControlConfig>() => Control<ConfigT>;
export {};
//# sourceMappingURL=create-control.d.ts.map
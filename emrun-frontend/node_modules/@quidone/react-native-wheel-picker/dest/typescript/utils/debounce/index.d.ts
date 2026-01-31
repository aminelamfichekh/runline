type AnyFunc = (...args: ReadonlyArray<any>) => any;
declare const debounce: <T extends AnyFunc>(func: T, delay: number) => ((...args: Parameters<T>) => void) & {
    clear: () => void;
};
export default debounce;
//# sourceMappingURL=index.d.ts.map
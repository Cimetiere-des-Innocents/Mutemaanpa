export default class Option<T> {
    private value: T | null;

    constructor(value?: T) {
        this.value = value ?? null;
    }

    static some<T>(value: T): Option<T> {
        return new Option(value);
    }

    static none<T>(): Option<T> {
        return new Option();
    }

    get unwrap(): T {
        if (this.value === null) {
            throw new Error('this option is null');
        }
        return this.value;
    }

    get isNone(): boolean {
        return this.value === null;
    }

    get isSome(): boolean {
        return this.value !== null;
    }

    or_else(value: T): T {
        return this.value ?? value;
    }

    map(fn: (value: T) => T): Option<T> {
        if (this.value === null) {
            return this;
        }
        return new Option(fn(this.value));
    }

    and_then(fn: (value: T) => Option<T>): Option<T> {
        if (this.value === null) {
            return this;
        }
        return fn(this.value);
    }
}

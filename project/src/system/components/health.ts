export class Option<T> {
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

// `Health` components applies to anything that:
// - has potential to receive damage and to die.
export class Health {
    private _health: Option<number>[];

    constructor() {
        this._health = [];
    }

    health(e: Entity): Option<Number> {
        return this._health.length > e ? this._health[e] : new Option();
    }

    setHealth(e: Entity, health: number): void {
        this._health[e] = this._health[e].map((_) => health);
    }

    damage(e: Entity, damage: number): 'Dead' | 'Alive' {
        this._health[e] = this._health[e].and_then((health) => {
            if (health - damage <= 0) {
                return Option.none();
            }
            return Option.some(health - damage);
        });
        return this._health[e].isNone ? 'Dead' : 'Alive';
    }
}

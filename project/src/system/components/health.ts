import assert from 'assert';
import { GameEvent, MessageBus } from '../event';
import Option from '../utils/option';

export class HealthPoint {
    health: number = 0;
    maxHealth: number = 0;

    constructor(health: number, maxHealth: number) {
        this.health = health;
        this.maxHealth = maxHealth;
    }
}

// `Health` components applies to anything that:
// - has potential to receive damage and to die.
//
// It does not encode business logic.
// But it do encode one invariant:
// - 0 <= health <= maxHealth
export class Health {
    private _health: Option<HealthPoint>[] = [];
    private messageBus: MessageBus;

    constructor(messageBus?: MessageBus) {
        this.messageBus = messageBus;
    }

    queryHealth(e: Entity): Option<HealthPoint> {
        return this._health[e] != undefined ? this._health[e] : Option.none();
    }

    allocateHealth(e: Entity, health: HealthPoint) {
        this._health[e] = Option.some(health);
        this.messageBus?.emit(GameEvent.ToLife, e, health);
    }

    deallocateHealth(e: Entity) {
        this._health[e] = Option.none();
        this.messageBus?.emit(GameEvent.ToEternal, e);
    }

    heal(e: Entity, amount: number) {
        assert(amount >= 0, 'heal amount should be non-negative');
        this._health[e] = this._health[e].map((hp) => {
            hp.health = Math.min(hp.health + amount, hp.maxHealth);
            return hp;
        });
        this.messageBus?.emit(GameEvent.Heal, e, amount);
    }

    hurt(e: Entity, amount: number) {
        assert(amount >= 0, 'hurt amount should be non-negative');
        this._health[e] = this._health[e].map((hp) => {
            hp.health = Math.max(hp.health - amount, 0);
            return hp;
        });
        this.messageBus?.emit(GameEvent.Damage, e, amount);
    }
}

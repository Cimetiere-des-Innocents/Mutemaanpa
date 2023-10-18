export enum GameEvent {
    // add health component to sth.
    ToLife,
    // remove health component from sth.
    ToEternal,
    // heal sth
    Heal,
    // add max health to sth
    AddMaxHealth,
    // remove max health from sth
    RemoveMaxHealth,
    // damage sth
    Damage,
    // sth is dead
    Dead,
}

const EventEmitter = require('node:events');

export class MessageBus extends EventEmitter {}

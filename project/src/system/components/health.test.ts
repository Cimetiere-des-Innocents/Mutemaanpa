import { expect, test } from 'vitest';
import { Health, HealthPoint } from './health';

test('at first, no one has health', () => {
    const health = new Health();
    expect(health.queryHealth(0).isNone).toBe(true);
});

test('let entity 4 has health 5, max 10', () => {
    const HP = new HealthPoint(5, 10);
    const health = new Health();
    health.allocateHealth(4, HP);
    expect(health.queryHealth(4).unwrap).toBe(HP);
});

test('let entity 4 has health 5, max 10, change health to 3', () => {
    const HP = new HealthPoint(5, 10);
    const health = new Health();
    health.allocateHealth(4, HP);
    health.hurt(4, 2);
    expect(health.queryHealth(4).unwrap.health).toBe(3);
});

test('let entity 4 has health 5, max 10, change health to 12, should be capped at 10', () => {
    const HP = new HealthPoint(5, 10);
    const health = new Health();
    health.allocateHealth(4, HP);
    health.heal(4, 7);
    expect(health.queryHealth(4).unwrap.health).toBe(10);
});

test('let entity 4 has health 5, max 10, change health to -10, should be capped at 0', () => {
    const HP = new HealthPoint(5, 10);
    const health = new Health();
    health.allocateHealth(4, HP);
    health.hurt(4, 10);
    expect(health.queryHealth(4).unwrap.health).toBe(0);
});

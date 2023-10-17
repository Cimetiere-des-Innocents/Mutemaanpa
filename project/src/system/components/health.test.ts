import { expect, test } from 'vitest';
import { Health } from './health';

test('at first, no one has health', () => {
    const health = new Health();
    expect(health.health(0).isNone).toBe(true);
});

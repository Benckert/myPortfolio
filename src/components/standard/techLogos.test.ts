import { describe, it, expect } from 'vitest';
import { techLogos } from './techLogos';

describe('techLogos', () => {
  it('exposes at least six logo items', () => {
    expect(techLogos.length).toBeGreaterThanOrEqual(6);
  });

  it('every item is a node-based logo with an accessible label', () => {
    for (const item of techLogos) {
      expect('node' in item).toBe(true);
      // @ts-expect-error narrow at runtime
      expect(item.ariaLabel ?? item.title).toBeTruthy();
    }
  });
});

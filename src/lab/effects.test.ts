import { describe, it, expect } from 'vitest';
import { categories } from './effects';
import { registry } from './registry';

const all = categories.flatMap((c) => c.variants);

describe('lab catalog integrity', () => {
  it('every specimen code is unique', () => {
    const codes = all.map((v) => v.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every variant declares a valid source', () => {
    for (const v of all) {
      expect(['bespoke', 'reactbits', 'shadcn'], v.code).toContain(v.source);
    }
  });

  it('library specimens carry a resolvable component + install + siteTarget', () => {
    for (const v of all.filter((v) => v.source !== 'bespoke')) {
      expect(v.component, `${v.code} needs a component name`).toBeTruthy();
      expect(registry[v.component!], `${v.code} → ${v.component} missing from registry`).toBeTruthy();
      expect(v.install, `${v.code} needs an install command`).toBeTruthy();
      expect(v.siteTarget, `${v.code} needs a siteTarget`).toBeTruthy();
    }
  });

  it('bespoke specimens carry a cls or data hook', () => {
    for (const v of all.filter((v) => v.source === 'bespoke')) {
      expect(Boolean(v.cls || v.data), `${v.code} bespoke needs cls/data`).toBe(true);
    }
  });
});

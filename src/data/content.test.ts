import { describe, it, expect } from 'vitest';
import { content } from './content';

describe('content', () => {
  it('has a profile name and email', () => {
    expect(content.profile.name).toBeTruthy();
    expect(content.socials.email).toMatch(/@/);
  });
  it('has at least one project with a slug and stack', () => {
    expect(content.projects.length).toBeGreaterThan(0);
    for (const p of content.projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.stack.length).toBeGreaterThan(0);
    }
  });
  it('has unique project slugs', () => {
    const slugs = content.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

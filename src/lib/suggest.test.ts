import { describe, it, expect } from 'vitest';
import { suggestCommand } from './suggest';

const names = ['help', 'about', 'projects', 'skills', 'contact', 'clear'];

describe('suggestCommand', () => {
  it('suggests the nearest command for a typo', () => {
    expect(suggestCommand('porjects', names)).toBe('projects');
    expect(suggestCommand('abou', names)).toBe('about');
  });
  it('returns null when nothing is close', () => {
    expect(suggestCommand('zzzzzzzz', names)).toBeNull();
  });
});

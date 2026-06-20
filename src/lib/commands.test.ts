import { describe, it, expect, vi } from 'vitest';
import { runCommand, commandNames } from './commands';
import type { CommandContext } from './types';
import { content } from '../data/content';

function makeCtx(overrides: Partial<CommandContext['actions']> = {}): CommandContext {
  return {
    content,
    history: [],
    actions: { clear: vi.fn(), exit: vi.fn(), openUrl: vi.fn(), ...overrides },
  };
}

describe('runCommand', () => {
  it('returns nothing for empty input', () => {
    expect(runCommand('   ', makeCtx())).toEqual([]);
  });
  it('runs help and lists commands', () => {
    const out = runCommand('help', makeCtx());
    expect(out.some((l) => l.type === 'heading')).toBe(true);
    expect(commandNames).toContain('help');
  });
  it('reports unknown commands with a suggestion', () => {
    const out = runCommand('halp', makeCtx());
    expect(out[0]).toMatchObject({ type: 'error' });
    expect(out.some((l) => 'text' in l && l.text.includes('help'))).toBe(true);
  });
  it('is case-insensitive on command names', () => {
    const out = runCommand('HELP', makeCtx());
    expect(out.some((l) => l.type === 'heading')).toBe(true);
  });
});

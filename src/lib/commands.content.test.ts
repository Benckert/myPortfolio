import { describe, it, expect, vi } from 'vitest';
import { runCommand } from './commands';
import type { CommandContext } from './types';
import { content } from '../data/content';

function makeCtx(overrides: Partial<CommandContext['actions']> = {}): CommandContext {
  return {
    content,
    history: ['help', 'about'],
    actions: { clear: vi.fn(), exit: vi.fn(), openUrl: vi.fn(), ...overrides },
  };
}

describe('content commands', () => {
  it('about prints the bio', () => {
    const out = runCommand('about', makeCtx());
    expect(out.some((l) => 'text' in l && l.text.includes(content.profile.bio.slice(0, 10)))).toBe(true);
  });
  it('projects lists every project name', () => {
    const out = runCommand('projects', makeCtx());
    for (const p of content.projects) {
      expect(out.some((l) => 'text' in l && l.text.includes(p.name))).toBe(true);
    }
  });
  it('contact includes an email link', () => {
    const out = runCommand('contact', makeCtx());
    expect(out.some((l) => l.type === 'link' && l.href.startsWith('mailto:'))).toBe(true);
  });
  it('echo repeats its arguments', () => {
    const out = runCommand('echo hello world', makeCtx());
    expect(out).toEqual([{ type: 'text', text: 'hello world' }]);
  });
  it('clear calls the clear action', () => {
    const clear = vi.fn();
    runCommand('clear', makeCtx({ clear }));
    expect(clear).toHaveBeenCalled();
  });
  it('exit calls the exit action', () => {
    const exit = vi.fn();
    runCommand('exit', makeCtx({ exit }));
    expect(exit).toHaveBeenCalled();
  });
  it('open <slug> opens the project link', () => {
    const openUrl = vi.fn();
    const slug = content.projects[0].slug;
    runCommand(`open ${slug}`, makeCtx({ openUrl }));
    expect(openUrl).toHaveBeenCalledWith(
      content.projects[0].live ?? content.projects[0].repo,
    );
  });
  it('open with an unknown slug errors', () => {
    const out = runCommand('open nope-nope', makeCtx());
    expect(out[0]).toMatchObject({ type: 'error' });
  });
  it('sudo returns a cheeky denial', () => {
    const out = runCommand('sudo rm -rf /', makeCtx());
    expect(out[0]).toMatchObject({ type: 'error' });
  });
  it('whoami prints visitor', () => {
    const out = runCommand('whoami', makeCtx());
    expect(out.some((l) => 'text' in l && /visitor/i.test(l.text))).toBe(true);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTerminal } from './useTerminal';

describe('useTerminal', () => {
  it('submitting a command appends an entry with output', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('help'));
    act(() => result.current.submit());
    const last = result.current.entries.at(-1)!;
    expect(last.input).toBe('help');
    expect(last.output.length).toBeGreaterThan(0);
    expect(result.current.input).toBe('');
  });

  it('clear empties the scrollback', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('about'));
    act(() => result.current.submit());
    act(() => result.current.setInput('clear'));
    act(() => result.current.submit());
    expect(result.current.entries).toHaveLength(0);
  });

  it('exit invokes onExit', () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useTerminal({ onExit }));
    act(() => result.current.setInput('exit'));
    act(() => result.current.submit());
    expect(onExit).toHaveBeenCalled();
  });

  it('history up/down recalls previous commands', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('about'));
    act(() => result.current.submit());
    act(() => result.current.setInput('skills'));
    act(() => result.current.submit());
    act(() => result.current.historyUp());
    expect(result.current.input).toBe('skills');
    act(() => result.current.historyUp());
    expect(result.current.input).toBe('about');
    act(() => result.current.historyDown());
    expect(result.current.input).toBe('skills');
  });

  it('tab-completes a unique command prefix', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('ab'));
    act(() => result.current.complete());
    expect(result.current.input).toBe('about ');
  });

  it('tab-completes a file argument after cat', () => {
    const { result } = renderHook(() => useTerminal({ onExit: vi.fn() }));
    act(() => result.current.setInput('cat ab'));
    act(() => result.current.complete());
    expect(result.current.input).toBe('cat about.txt');
  });
});

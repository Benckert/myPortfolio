import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMode } from './useMode';

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
});

describe('useMode', () => {
  it('defaults to standard', () => {
    const { result } = renderHook(() => useMode());
    expect(result.current.mode).toBe('standard');
  });
  it('open() switches to terminal and sets the hash', () => {
    const { result } = renderHook(() => useMode());
    act(() => result.current.open());
    expect(result.current.mode).toBe('terminal');
    expect(window.location.hash).toBe('#terminal');
  });
  it('close() returns to standard', () => {
    const { result } = renderHook(() => useMode());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.mode).toBe('standard');
  });
  it('initializes from #terminal hash', () => {
    window.location.hash = '#terminal';
    const { result } = renderHook(() => useMode());
    expect(result.current.mode).toBe('terminal');
  });

  it('Ctrl+K opens the terminal', () => {
    const { result } = renderHook(() => useMode());
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    });
    expect(result.current.mode).toBe('terminal');
  });

  it('Cmd+K (metaKey) opens the terminal', () => {
    const { result } = renderHook(() => useMode());
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    });
    expect(result.current.mode).toBe('terminal');
  });

  it('plain backtick does NOT open the terminal', () => {
    const { result } = renderHook(() => useMode());
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '`', bubbles: true }));
    });
    expect(result.current.mode).toBe('standard');
  });

  it('Escape closes the terminal', () => {
    const { result } = renderHook(() => useMode());
    act(() => result.current.open());
    expect(result.current.mode).toBe('terminal');
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(result.current.mode).toBe('standard');
  });
});

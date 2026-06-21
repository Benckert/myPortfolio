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
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Terminal } from './Terminal';

describe('Terminal', () => {
  it('shows the prompt and runs a typed command', async () => {
    render(<Terminal onExit={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    await userEvent.type(input, 'help{Enter}');
    // Target only the heading node — the help body also contains the substring
    // "available commands" in the help row's description, so match exactly.
    expect(await screen.findByText('Available commands', { exact: true })).toBeInTheDocument();
  });

  it('exit command calls onExit', async () => {
    const onExit = vi.fn();
    render(<Terminal onExit={onExit} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    await userEvent.type(input, 'exit{Enter}');
    expect(onExit).toHaveBeenCalled();
  });
});

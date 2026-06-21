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

  it('red dot (close) calls onExit when clicked', async () => {
    const onExit = vi.fn();
    render(<Terminal onExit={onExit} />);
    await userEvent.click(screen.getByRole('button', { name: /close terminal/i }));
    expect(onExit).toHaveBeenCalled();
  });

  it('green dot (zoom) toggles aria-pressed when clicked', async () => {
    render(<Terminal onExit={vi.fn()} />);
    const zoomBtn = screen.getByRole('button', { name: /zoom terminal/i });
    expect(zoomBtn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(zoomBtn);
    expect(zoomBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('yellow dot (minimize) hides input and shows restore chip; restore brings input back', async () => {
    render(<Terminal onExit={vi.fn()} />);
    // input is visible initially
    expect(screen.getByRole('textbox', { name: /terminal input/i })).toBeInTheDocument();
    // minimize
    await userEvent.click(screen.getByRole('button', { name: /minimize terminal/i }));
    // input gone, restore chip present
    expect(screen.queryByRole('textbox', { name: /terminal input/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restore terminal/i })).toBeInTheDocument();
    // restore
    await userEvent.click(screen.getByRole('button', { name: /restore terminal/i }));
    expect(screen.getByRole('textbox', { name: /terminal input/i })).toBeInTheDocument();
  });
});

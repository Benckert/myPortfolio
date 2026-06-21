import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Terminal } from './Terminal';

describe('terminal a11y', () => {
  it('is a labelled modal dialog', () => {
    render(<Terminal onExit={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: /interactive terminal/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
  it('Escape inside the input exits', async () => {
    const onExit = vi.fn();
    render(<Terminal onExit={onExit} />);
    const input = screen.getByRole('textbox', { name: /terminal input/i });
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(onExit).toHaveBeenCalled();
  });
});

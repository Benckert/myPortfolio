import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from './Lightbox';

describe('Lightbox', () => {
  it('renders nothing when closed', () => {
    render(<Lightbox src="/p.svg" alt="Portrait" open={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the image in a dialog when open', () => {
    render(<Lightbox src="/p.svg" alt="Portrait of X" open onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByAltText('Portrait of X')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Lightbox src="/p.svg" alt="P" open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<Lightbox src="/p.svg" alt="P" open onClose={onClose} />);
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the image itself is clicked', async () => {
    const onClose = vi.fn();
    render(<Lightbox src="/p.svg" alt="P" open onClose={onClose} />);
    await userEvent.click(screen.getByAltText('P'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<Lightbox src="/p.svg" alt="P" open onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus to the close button on open and restores it on close', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = render(<Lightbox src="/p.svg" alt="P" open={false} onClose={() => {}} />);
    rerender(<Lightbox src="/p.svg" alt="P" open onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /close/i })).toHaveFocus();
    rerender(<Lightbox src="/p.svg" alt="P" open={false} onClose={() => {}} />);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});

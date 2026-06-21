import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import { content } from '../../data/content';

describe('Hero', () => {
  it('renders the name and a working terminal hint button', () => {
    render(<Hero onOpenTerminal={vi.fn()} />);
    expect(screen.getByRole('heading', { name: new RegExp(content.profile.name, 'i') })).toBeInTheDocument();
  });
  it('calls onOpenTerminal when the hint is clicked', async () => {
    const onOpen = vi.fn();
    render(<Hero onOpenTerminal={onOpen} />);
    screen.getByRole('button', { name: /terminal mode/i }).click();
    expect(onOpen).toHaveBeenCalled();
  });
});

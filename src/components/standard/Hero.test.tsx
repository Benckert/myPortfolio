import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from './Hero';
import { content } from '../../data/content';

describe('Hero', () => {
  it('renders the name as a heading via aria-label', () => {
    render(<Hero onOpenTerminal={() => {}} />);
    expect(screen.getByRole('heading', { level: 1, name: content.profile.name })).toBeInTheDocument();
  });

  it('renders both CTAs as links', () => {
    render(<Hero onOpenTerminal={() => {}} />);
    expect(screen.getByRole('link', { name: 'View my work' })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '#contact');
  });

  it('renders the technologies logo region', () => {
    render(<Hero onOpenTerminal={() => {}} />);
    expect(screen.getByRole('region', { name: /technolog/i })).toBeInTheDocument();
  });

  it('calls onOpenTerminal when the terminal hint is clicked', async () => {
    const onOpenTerminal = vi.fn();
    render(<Hero onOpenTerminal={onOpenTerminal} />);
    await userEvent.click(screen.getByRole('button', { name: /terminal mode/i }));
    expect(onOpenTerminal).toHaveBeenCalledTimes(1);
  });
});

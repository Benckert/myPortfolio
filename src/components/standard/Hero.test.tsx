import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});

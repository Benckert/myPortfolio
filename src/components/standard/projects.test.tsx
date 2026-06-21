import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Projects } from './Projects';
import { Contact } from './Contact';
import { content } from '../../data/content';

describe('Projects', () => {
  it('renders a card per project with its stack', () => {
    render(<Projects />);
    for (const p of content.projects) {
      const heading = screen.getByRole('heading', { name: new RegExp(p.name, 'i') });
      expect(heading).toBeInTheDocument();
    }
    // first project's first stack tag appears
    expect(screen.getAllByText(content.projects[0].stack[0]).length).toBeGreaterThan(0);
  });
});

describe('Contact', () => {
  it('renders a mailto link', () => {
    render(<Contact />);
    const link = screen.getByRole('link', { name: new RegExp(content.socials.email, 'i') });
    expect(link).toHaveAttribute('href', `mailto:${content.socials.email}`);
  });
});

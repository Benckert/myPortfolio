import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { About } from './About';
import { content } from '../../data/content';

describe('About', () => {
  it('renders the bio text', () => {
    render(<About />);
    expect(
      screen.getByText(new RegExp(content.profile.bio.slice(0, 12), 'i')),
    ).toBeInTheDocument();
  });

  it('renders a portrait image with the profile name in its alt text', () => {
    render(<About />);
    expect(
      screen.getByRole('img', { name: new RegExp(content.profile.name, 'i') }),
    ).toBeInTheDocument();
  });
});

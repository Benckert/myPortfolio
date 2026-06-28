import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spotlight } from './Spotlight';

describe('Spotlight', () => {
  it('renders its children inside a .spotlight wrapper', () => {
    render(
      <Spotlight>
        <a href="#projects">View my work</a>
      </Spotlight>
    );
    const link = screen.getByRole('link', { name: 'View my work' });
    expect(link).toBeInTheDocument();
    expect(link.closest('.spotlight')).not.toBeNull();
  });
});

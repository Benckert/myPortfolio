import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { About } from './About';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { content } from '../../data/content';

describe('content sections', () => {
  it('About renders the bio', () => {
    render(<About />);
    expect(screen.getByText(new RegExp(content.profile.bio.slice(0, 12), 'i'))).toBeInTheDocument();
  });
  it('Skills renders every language', () => {
    render(<Skills />);
    for (const s of content.skills.languages) {
      expect(screen.getByText(s)).toBeInTheDocument();
    }
  });
  it('Experience renders every role', () => {
    render(<Experience />);
    for (const e of content.experience) {
      expect(screen.getByText(new RegExp(e.role, 'i'))).toBeInTheDocument();
    }
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StandardSite } from './StandardSite';

describe('StandardSite section order and numbering', () => {
  it('renders sections in order with correct sequential numbers', () => {
    const { container } = render(<StandardSite onOpenTerminal={() => {}} />);
    // Query by element + the numbered-label pattern rather than a styling class,
    // so the assertion survives components migrating off `.section__title` to
    // Tailwind utilities (e.g. Skills). See docs/tailwind-migration.md.
    const labels = Array.from(container.querySelectorAll('h2, .contact__eyebrow'))
      .map((el) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter((t) => /^\d+\./.test(t));
    expect(labels).toEqual([
      '01. About',
      '02. Projects',
      '03. Experience',
      '04. Skills',
      "05. What's next?",
    ]);
  });
});

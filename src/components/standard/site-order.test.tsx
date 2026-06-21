import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StandardSite } from './StandardSite';

describe('StandardSite section order and numbering', () => {
  it('renders sections in order with correct sequential numbers', () => {
    const { container } = render(<StandardSite onOpenTerminal={() => {}} />);
    const labels = Array.from(
      container.querySelectorAll('.section__title, .contact__eyebrow'),
    ).map((el) => el.textContent?.replace(/\s+/g, ' ').trim());
    expect(labels).toEqual([
      '01. About',
      '02. Projects',
      '03. Experience',
      '04. Skills',
      "05. What's next?",
    ]);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlidePager } from './SlidePager';

const realScrollIntoView = Element.prototype.scrollIntoView;

function renderWithSections() {
  return render(
    <>
      <main>
        <section id="home" />
        <section id="about" />
        <section id="contact" />
      </main>
      <SlidePager />
    </>
  );
}

describe('SlidePager', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = realScrollIntoView;
  });

  it('hides the previous button on the first slide and shows next', () => {
    renderWithSections();
    expect(screen.getByLabelText('Previous section')).not.toBeVisible();
    expect(screen.getByLabelText('Next section')).toBeInTheDocument();
  });

  it('scrolls to the next section when next is clicked', async () => {
    renderWithSections();
    await userEvent.click(screen.getByLabelText('Next section'));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

import { describe, it, expect } from 'vitest';
import { listFiles, readFile, ROOT_ENTRIES } from './vfs';
import { content } from '../data/content';

describe('vfs', () => {
  it('lists root entries', () => {
    expect(listFiles(undefined, content)).toEqual(ROOT_ENTRIES);
  });
  it('lists project files under projects/', () => {
    const files = listFiles('projects/', content);
    expect(files).toContain(`${content.projects[0].slug}.md`);
  });
  it('reads about.txt as the bio', () => {
    const out = readFile('about.txt', content);
    expect(out).not.toBeNull();
    expect(out!.some((l) => 'text' in l && l.text.includes(content.profile.bio.slice(0, 10)))).toBe(true);
  });
  it('reads a project file', () => {
    const slug = content.projects[0].slug;
    const out = readFile(`projects/${slug}.md`, content);
    expect(out).not.toBeNull();
    expect(out!.some((l) => 'text' in l && l.text.includes(content.projects[0].description.slice(0, 10)))).toBe(true);
  });
  it('returns null for unknown files', () => {
    expect(readFile('nope.txt', content)).toBeNull();
  });
});

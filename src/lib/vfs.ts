import type { Content } from '../data/content';
import type { OutputLine } from './types';

export const ROOT_ENTRIES = ['about.txt', 'skills.txt', 'contact.txt', 'resume.pdf', 'projects/'];

export function listFiles(dir: string | undefined, content: Content): string[] {
  if (!dir || dir === '.' || dir === '~' || dir === '/') return ROOT_ENTRIES;
  if (dir === 'projects' || dir === 'projects/') {
    return content.projects.map((p) => `${p.slug}.md`);
  }
  return [];
}

export function readFile(path: string, content: Content): OutputLine[] | null {
  switch (path) {
    case 'about.txt':
      return [{ type: 'text', text: content.profile.bio }];
    case 'skills.txt': {
      const { languages, frameworks, tools } = content.skills;
      return [
        { type: 'text', text: `languages:  ${languages.join(', ')}` },
        { type: 'text', text: `frameworks: ${frameworks.join(', ')}` },
        { type: 'text', text: `tools:      ${tools.join(', ')}` },
      ];
    }
    case 'contact.txt':
      return [
        { type: 'link', label: content.socials.email, href: `mailto:${content.socials.email}` },
      ];
    case 'resume.pdf':
      return content.profile.resumeUrl
        ? [{ type: 'link', label: 'resume.pdf', href: content.profile.resumeUrl }]
        : [{ type: 'error', text: 'resume.pdf: not available' }];
  }
  const m = path.match(/^projects\/(.+)\.md$/);
  if (m) {
    const project = content.projects.find((p) => p.slug === m[1]);
    if (!project) return null;
    const lines: OutputLine[] = [
      { type: 'heading', text: project.name },
      { type: 'text', text: project.description },
      { type: 'text', text: '' },
      { type: 'text', text: `stack: ${project.stack.join(', ')}` },
    ];
    for (const h of project.highlights) lines.push({ type: 'text', text: `  - ${h}` });
    return lines;
  }
  return null;
}

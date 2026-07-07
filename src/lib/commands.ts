import type { Command, CommandContext, OutputLine } from './types';
import { suggestCommand } from './suggest';
import { listFiles, readFile, ROOT_ENTRIES } from './vfs';

export const registry: Record<string, Command> = {};

function register(cmd: Command) {
  registry[cmd.name] = cmd;
}

// `help` lists everything in the registry.
register({
  name: 'help',
  description: 'List available commands',
  handler: () => {
    const lines: OutputLine[] = [{ type: 'heading', text: 'Available commands' }];
    for (const name of Object.keys(registry).sort()) {
      lines.push({ type: 'text', text: `  ${name.padEnd(12)} ${registry[name].description}` });
    }
    lines.push({ type: 'text', text: '' });
    lines.push({ type: 'text', text: 'Tip: use Tab to autocomplete and ↑/↓ for history.' });
    return lines;
  },
});

register({
  name: 'about',
  description: 'Who I am',
  handler: (_a, ctx) => [
    { type: 'heading', text: ctx.content.profile.name },
    { type: 'text', text: ctx.content.profile.tagline },
    { type: 'text', text: '' },
    { type: 'text', text: ctx.content.profile.bio },
  ],
});

register({
  name: 'projects',
  description: 'List my projects',
  handler: (_a, ctx) => {
    const lines: OutputLine[] = [{ type: 'heading', text: 'Projects' }];
    for (const p of ctx.content.projects) {
      lines.push({ type: 'text', text: `  ${p.name} — ${p.summary}` });
      lines.push({ type: 'text', text: `    [${p.stack.join(', ')}]  (cat projects/${p.slug})` });
    }
    return lines;
  },
});

register({
  name: 'skills',
  description: 'My technical skills',
  handler: (_a, ctx) => {
    const { languages, frameworks, tools } = ctx.content.skills;
    return [
      { type: 'heading', text: 'Skills' },
      { type: 'text', text: `  languages:  ${languages.join(', ')}` },
      { type: 'text', text: `  frameworks: ${frameworks.join(', ')}` },
      { type: 'text', text: `  tools:      ${tools.join(', ')}` },
    ];
  },
});

register({
  name: 'experience',
  description: 'My experience and internships',
  handler: (_a, ctx) => {
    const lines: OutputLine[] = [{ type: 'heading', text: 'Experience' }];
    for (const e of ctx.content.experience) {
      lines.push({ type: 'text', text: `  ${e.role} · ${e.org} (${e.period})` });
      for (const pt of e.points) lines.push({ type: 'text', text: `    - ${pt}` });
    }
    return lines;
  },
});

register({
  name: 'contact',
  description: 'How to reach me',
  handler: (_a, ctx) => {
    const { email, github, linkedin } = ctx.content.socials;
    const lines: OutputLine[] = [
      { type: 'heading', text: 'Contact' },
      { type: 'link', label: email, href: `mailto:${email}` },
    ];
    if (github) lines.push({ type: 'link', label: 'GitHub', href: github });
    if (linkedin) lines.push({ type: 'link', label: 'LinkedIn', href: linkedin });
    return lines;
  },
});

register({
  name: 'social',
  description: 'My social links',
  handler: (_a, ctx) => registry.contact.handler(_a, ctx),
});

register({
  name: 'resume',
  description: 'Open my resume',
  handler: (_a, ctx) => {
    const url = ctx.content.profile.resumeUrl;
    if (!url) return [{ type: 'error', text: 'No resume available.' }];
    return [{ type: 'link', label: 'resume.pdf', href: url }];
  },
});

register({
  name: 'whoami',
  description: 'Print the current user',
  handler: () => [{ type: 'text', text: 'visitor — welcome, take a look around.' }],
});

register({
  name: 'echo',
  description: 'Print text',
  handler: (args) => [{ type: 'text', text: args.join(' ') }],
});

register({
  name: 'clear',
  description: 'Clear the screen',
  handler: (_a, ctx) => {
    ctx.actions.clear();
    return [];
  },
});

register({
  name: 'exit',
  description: 'Return to the standard site',
  handler: (_a, ctx) => {
    ctx.actions.exit();
    return [];
  },
});

register({
  name: 'open',
  description: 'Open a project link: open <slug>',
  handler: (args, ctx) => {
    const slug = args[0];
    if (!slug) return [{ type: 'error', text: 'usage: open <project-slug>' }];
    const project = ctx.content.projects.find((p) => p.slug === slug);
    if (!project) return [{ type: 'error', text: `no such project: ${slug}` }];
    const url = project.live ?? project.repo;
    if (!url) return [{ type: 'error', text: `no link available for ${slug}` }];
    ctx.actions.openUrl(url);
    return [{ type: 'success', text: `Opening ${project.name}…` }];
  },
});

register({
  name: 'history',
  description: 'Show command history',
  handler: (_a, ctx) =>
    ctx.history.map((h, i) => ({
      type: 'text' as const,
      text: `  ${String(i + 1).padStart(3)}  ${h}`,
    })),
});

register({
  name: 'sudo',
  description: 'Try it and see',
  handler: () => [
    { type: 'error', text: 'visitor is not in the sudoers file. This incident will be reported. 🙂' },
  ],
});

register({
  name: 'ls',
  description: 'List files: ls [dir]',
  handler: (args, ctx) => {
    const files = listFiles(args[0], ctx.content);
    if (files.length === 0) return [{ type: 'error', text: `ls: ${args[0]}: no such directory` }];
    return [{ type: 'text', text: files.join('   ') }];
  },
});

register({
  name: 'cat',
  description: 'Read a file: cat <file>',
  handler: (args, ctx) => {
    const path = args[0];
    if (!path) return [{ type: 'error', text: 'usage: cat <file>' }];
    const out = readFile(path, ctx.content);
    if (!out) return [{ type: 'error', text: `cat: ${path}: no such file` }];
    return out;
  },
});

export const commandNames: string[] = [];

export function runCommand(input: string, ctx: CommandContext): OutputLine[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  const [rawName, ...args] = trimmed.split(/\s+/);
  const name = rawName.toLowerCase();
  const cmd = registry[name];
  if (!cmd) {
    const out: OutputLine[] = [{ type: 'error', text: `command not found: ${rawName}` }];
    const suggestion = suggestCommand(name, Object.keys(registry));
    if (suggestion) out.push({ type: 'text', text: `Did you mean \`${suggestion}\`?` });
    out.push({ type: 'text', text: 'Type `help` to see available commands.' });
    return out;
  }
  return cmd.handler(args, ctx);
}

// keep commandNames in sync after all registrations (this module + side-effect imports)
export function refreshCommandNames() {
  commandNames.length = 0;
  commandNames.push(...Object.keys(registry).sort());
}
refreshCommandNames();

// Argument-completion sources: which tokens complete after a given command.
export function argCandidates(commandName: string, content: import('../data/content').Content): string[] {
  if (commandName === 'cat') {
    return [...ROOT_ENTRIES.filter((e) => !e.endsWith('/')), ...content.projects.map((p) => `projects/${p.slug}.md`)];
  }
  if (commandName === 'open') return content.projects.map((p) => p.slug);
  if (commandName === 'ls') return ['projects/'];
  return [];
}

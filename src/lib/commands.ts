import type { Command, CommandContext, OutputLine } from './types';
import { suggestCommand } from './suggest';

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

import type { Content } from '../data/content';

export type OutputLine =
  | { type: 'text' | 'error' | 'success' | 'heading'; text: string }
  | { type: 'link'; label: string; href: string };

export interface CommandContext {
  content: Content;
  history: string[];
  actions: {
    clear: () => void;
    exit: () => void;
    openUrl: (url: string) => void;
  };
}

export type CommandHandler = (args: string[], ctx: CommandContext) => OutputLine[];

export interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}

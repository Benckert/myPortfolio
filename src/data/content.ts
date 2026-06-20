export interface Project {
  slug: string;
  name: string;
  summary: string;
  description: string;
  stack: string[];
  highlights: string[];
  live?: string;
  repo?: string;
}

export interface Experience {
  role: string;
  org: string;
  period: string;
  points: string[];
}

export interface Socials {
  github?: string;
  linkedin?: string;
  email: string;
  [k: string]: string | undefined;
}

export interface Content {
  profile: {
    name: string;
    tagline: string;
    bio: string;
    location?: string;
    resumeUrl?: string;
  };
  socials: Socials;
  projects: Project[];
  skills: { languages: string[]; frameworks: string[]; tools: string[] };
  experience: Experience[];
}

// ─────────────────────────────────────────────────────────────
// EDIT THIS FILE to make the portfolio yours. Replace every
// "Your …" placeholder. Both the standard site and the terminal
// read from here, so you only update your info in one place.
// ─────────────────────────────────────────────────────────────
export const content: Content = {
  profile: {
    name: 'Your Name',
    tagline: 'Front-end developer building accessible, animated web experiences',
    bio: "Recently qualified web developer focused on the front end. I learn by building — most of what I know comes from shipping personal projects end to end, from design to deploy. I care about clean, accessible UI and the small details that make an interface feel good.",
    location: 'Your City, Country',
    resumeUrl: '/resume.pdf',
  },
  socials: {
    github: 'https://github.com/yourhandle',
    linkedin: 'https://linkedin.com/in/yourhandle',
    email: 'you@example.com',
  },
  projects: [
    {
      slug: 'project-one',
      name: 'Project One',
      summary: 'A short one-line description of what it does.',
      description:
        'A longer paragraph about Project One: the problem it solves, what you built, and what you learned. Mention the interesting technical challenge you solved.',
      stack: ['React', 'TypeScript', 'Vite'],
      highlights: [
        'Implemented X feature that does Y',
        'Optimized Z, improving load time by N%',
      ],
      live: 'https://example.com',
      repo: 'https://github.com/yourhandle/project-one',
    },
    {
      slug: 'project-two',
      name: 'Project Two',
      summary: 'Another one-line description.',
      description:
        'Details about Project Two. What was the goal, what is notable about the implementation, and what would you do next.',
      stack: ['Next.js', 'Tailwind CSS', 'PostgreSQL'],
      highlights: ['Built a real-time feature with websockets', 'Designed the schema and API'],
      repo: 'https://github.com/yourhandle/project-two',
    },
    {
      slug: 'project-three',
      name: 'Project Three',
      summary: 'A third project to round out the portfolio.',
      description: 'Describe a project that shows a different skill — maybe a tool, a game, or a CLI.',
      stack: ['JavaScript', 'Node.js', 'Canvas API'],
      highlights: ['Wrote a small game loop from scratch', 'No external game libraries'],
      live: 'https://example.com/three',
    },
  ],
  skills: {
    languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'SQL'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express'],
    tools: ['Git', 'Vite', 'Figma', 'Vitest', 'Docker'],
  },
  experience: [
    {
      role: 'Front-end Developer Intern',
      org: 'Company Name',
      period: '2025',
      points: [
        'Built and shipped UI components used across the product.',
        'Collaborated with designers to translate Figma into responsive React.',
      ],
    },
    {
      role: 'Web Development Intern',
      org: 'Another Company',
      period: '2024',
      points: ['Fixed bugs and added small features to a production codebase.'],
    },
  ],
};

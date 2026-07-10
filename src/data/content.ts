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

export interface Education {
  credential: string;
  org: string;
  period: string;
  points?: string[];
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
    portraitUrl?: string;
  };
  socials: Socials;
  projects: Project[];
  skills: { languages: string[]; frameworks: string[]; tools: string[] };
  experience: Experience[];
  education: Education[];
}

export type Lang = 'en' | 'sv';

// ─────────────────────────────────────────────────────────────
// EDIT THIS FILE to make the portfolio yours. Replace every
// "Your …" placeholder. Both the standard site and the terminal
// read from here, so you only update your info in one place.
// English (`en`) is the canonical copy; the Swedish object below
// derives from it and overrides only the translatable text, so
// slugs, URLs, stacks and dates can never drift apart.
// ─────────────────────────────────────────────────────────────
const en: Content = {
  profile: {
    name: 'Kristoffer Benckert',
    tagline: 'Front-end developer building accessible, animated web experiences',
    bio: "Recently qualified web developer focused on the front end. I learn by building — most of what I know comes from shipping personal projects end to end, from design to deploy. I care about clean, accessible UI and the small details that make an interface feel good.",
    location: 'Your City, Country',
    resumeUrl: '/resume.pdf',
    portraitUrl: '/portrait.svg',
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
  education: [
    {
      credential: 'BSc in Computer Science',
      org: 'University Name',
      period: '2021 – 2024',
      points: ['Relevant coursework: data structures, web development, databases.'],
    },
    {
      credential: 'Front-end Web Development',
      org: 'Course / Bootcamp Name',
      period: '2024',
      points: ['Project-based program focused on modern React and accessible UI.'],
    },
  ],
};

// Swedish — spreads `en` and overrides text only.
const sv: Content = {
  ...en,
  profile: {
    ...en.profile,
    tagline: 'Frontend-utvecklare som bygger tillgängliga, animerade webbupplevelser',
    bio: 'Nyutbildad webbutvecklare med fokus på frontend. Jag lär mig genom att bygga — det mesta jag kan kommer från att ha byggt egna projekt hela vägen från design till driftsättning. Jag bryr mig om ren, tillgänglig UI och de små detaljerna som får ett gränssnitt att kännas bra.',
    location: 'Din stad, Land',
  },
  projects: [
    {
      ...en.projects[0],
      summary: 'En kort beskrivning på en rad av vad det gör.',
      description:
        'Ett längre stycke om projektet: problemet det löser, vad du byggde och vad du lärde dig. Nämn den intressanta tekniska utmaningen du löste.',
      highlights: [
        'Implementerade X-funktion som gör Y',
        'Optimerade Z och förbättrade laddtiden med N %',
      ],
    },
    {
      ...en.projects[1],
      summary: 'Ytterligare en beskrivning på en rad.',
      description:
        'Detaljer om projektet. Vad var målet, vad är intressant med implementationen och vad skulle du göra härnäst.',
      highlights: ['Byggde en realtidsfunktion med websockets', 'Designade schemat och API:t'],
    },
    {
      ...en.projects[2],
      summary: 'Ett tredje projekt som rundar av portfolion.',
      description:
        'Beskriv ett projekt som visar en annan färdighet — kanske ett verktyg, ett spel eller ett CLI.',
      highlights: ['Skrev en enkel spelloop från grunden', 'Inga externa spelbibliotek'],
    },
  ],
  experience: [
    {
      ...en.experience[0],
      role: 'Frontend-utvecklare, praktikant',
      points: [
        'Byggde och levererade UI-komponenter som används i hela produkten.',
        'Samarbetade med designers för att omsätta Figma till responsiv React.',
      ],
    },
    {
      ...en.experience[1],
      role: 'Webbutvecklare, praktikant',
      points: ['Fixade buggar och byggde mindre funktioner i en produktionskodbas.'],
    },
  ],
  education: [
    {
      ...en.education[0],
      credential: 'Kandidatexamen i datavetenskap',
      points: ['Relevanta kurser: datastrukturer, webbutveckling, databaser.'],
    },
    {
      ...en.education[1],
      credential: 'Frontend-webbutveckling',
      points: ['Projektbaserat program med fokus på modern React och tillgänglig UI.'],
    },
  ],
};

export const contents: Record<Lang, Content> = { en, sv };

/** Canonical (English) content — the default for tests and the terminal. */
export const content: Content = en;

// Static UI strings of the standard site, keyed by language.
export interface UiStrings {
  skipLink: string;
  nav: { about: string; projects: string; experience: string; skills: string; contact: string };
  hero: {
    eyebrow: string;
    viewWork: string;
    getInTouch: string;
    hintPre: string;
    hintPost: string;
    logosLabel: string;
  };
  sections: {
    projectsLead: string;
    work: string;
    education: string;
    skillsGroups: { languages: string; frameworks: string; tools: string };
  };
  contact: { eyebrow: string; title: string; lead: string };
  footer: { built: string; tryTerminal: string };
}

export const ui: Record<Lang, UiStrings> = {
  en: {
    skipLink: 'Skip to content',
    nav: {
      about: 'About',
      projects: 'Projects',
      experience: 'Experience',
      skills: 'Skills',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Hi, my name is',
      viewWork: 'View my work',
      getInTouch: 'Get in touch',
      hintPre: 'psst — press',
      hintPost: 'for terminal mode',
      logosLabel: 'Technologies I work with',
    },
    sections: {
      projectsLead: "A selection of things I've designed and built.",
      work: 'Work',
      education: 'Education',
      skillsGroups: { languages: 'Languages', frameworks: 'Frameworks', tools: 'Tools' },
    },
    contact: {
      eyebrow: "05. What's next?",
      title: 'Get in touch',
      lead: "I'm open to junior front-end roles and interesting projects. The fastest way to reach me is email — I'll get back to you.",
    },
    footer: { built: 'Built with React & TypeScript ·', tryTerminal: 'try the terminal' },
  },
  sv: {
    skipLink: 'Hoppa till innehåll',
    nav: {
      about: 'Om mig',
      projects: 'Projekt',
      experience: 'Erfarenhet',
      skills: 'Kompetens',
      contact: 'Kontakt',
    },
    hero: {
      eyebrow: 'Hej, jag heter',
      viewWork: 'Se mina projekt',
      getInTouch: 'Hör av dig',
      hintPre: 'psst — tryck',
      hintPost: 'för terminalläge',
      logosLabel: 'Teknik jag arbetar med',
    },
    sections: {
      projectsLead: 'Ett urval av saker jag har designat och byggt.',
      work: 'Arbete',
      education: 'Utbildning',
      skillsGroups: { languages: 'Språk', frameworks: 'Ramverk', tools: 'Verktyg' },
    },
    contact: {
      eyebrow: '05. Vad händer nu?',
      title: 'Hör av dig',
      lead: 'Jag är öppen för juniora frontend-roller och intressanta projekt. Snabbaste sättet att nå mig är via mejl — jag återkommer.',
    },
    footer: { built: 'Byggd med React & TypeScript ·', tryTerminal: 'testa terminalen' },
  },
};

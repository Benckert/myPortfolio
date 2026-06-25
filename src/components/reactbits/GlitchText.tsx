import { FC, CSSProperties, useEffect } from 'react';

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

interface CustomCSSProperties extends CSSProperties {
  '--after-duration': string;
  '--before-duration': string;
  '--after-shadow': string;
  '--before-shadow': string;
}

// Inject glitch keyframes into the document once so the component is self-contained
// and doesn't require tailwind.config animation extensions.
let glitchStylesInjected = false;
function ensureGlitchStyles() {
  if (typeof document === 'undefined' || glitchStylesInjected) return;
  glitchStylesInjected = true;
  const style = document.createElement('style');
  style.dataset.glitchText = 'true';
  style.textContent = `
    @keyframes glitch-clip {
      0%   { clip-path: inset(20% 0 50% 0); }
      5%   { clip-path: inset(10% 0 60% 0); }
      10%  { clip-path: inset(15% 0 55% 0); }
      15%  { clip-path: inset(25% 0 35% 0); }
      20%  { clip-path: inset(30% 0 40% 0); }
      25%  { clip-path: inset(40% 0 20% 0); }
      30%  { clip-path: inset(10% 0 60% 0); }
      35%  { clip-path: inset(15% 0 55% 0); }
      40%  { clip-path: inset(25% 0 35% 0); }
      45%  { clip-path: inset(30% 0 40% 0); }
      50%  { clip-path: inset(20% 0 50% 0); }
      55%  { clip-path: inset(10% 0 60% 0); }
      60%  { clip-path: inset(15% 0 55% 0); }
      65%  { clip-path: inset(25% 0 35% 0); }
      70%  { clip-path: inset(30% 0 40% 0); }
      75%  { clip-path: inset(40% 0 20% 0); }
      80%  { clip-path: inset(20% 0 50% 0); }
      85%  { clip-path: inset(10% 0 60% 0); }
      90%  { clip-path: inset(15% 0 55% 0); }
      95%  { clip-path: inset(25% 0 35% 0); }
      100% { clip-path: inset(30% 0 40% 0); }
    }
    /* Always-on glitch */
    .glitch-always::after,
    .glitch-always::before {
      content: attr(data-text);
      position: absolute;
      top: 0;
      color: white;
      background: #120F17;
      overflow: hidden;
      clip-path: inset(0 0 0 0);
    }
    .glitch-always::after {
      left: 10px;
      text-shadow: var(--after-shadow);
      animation: glitch-clip var(--after-duration) infinite linear alternate-reverse;
    }
    .glitch-always::before {
      left: -10px;
      text-shadow: var(--before-shadow);
      animation: glitch-clip var(--before-duration) infinite linear alternate-reverse;
    }
    /* Hover-only glitch */
    .glitch-hover::after,
    .glitch-hover::before {
      content: '';
      position: absolute;
      top: 0;
      color: white;
      background: #120F17;
      overflow: hidden;
      clip-path: inset(0 0 0 0);
      opacity: 0;
    }
    .glitch-hover::after { left: 10px; }
    .glitch-hover::before { left: -10px; }
    .glitch-hover:hover::after {
      content: attr(data-text);
      opacity: 1;
      text-shadow: var(--after-shadow);
      animation: glitch-clip var(--after-duration) infinite linear alternate-reverse;
    }
    .glitch-hover:hover::before {
      content: attr(data-text);
      opacity: 1;
      text-shadow: var(--before-shadow);
      animation: glitch-clip var(--before-duration) infinite linear alternate-reverse;
    }
  `;
  document.head.appendChild(style);
}

const GlitchText: FC<GlitchTextProps> = ({
  children,
  speed = 0.5,
  enableShadows = true,
  enableOnHover = false,
  className = ''
}) => {
  useEffect(() => {
    ensureGlitchStyles();
  }, []);

  const inlineStyles: CustomCSSProperties = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-5px 0 red' : 'none',
    '--before-shadow': enableShadows ? '5px 0 cyan' : 'none',
  };

  const glitchClass = enableOnHover ? 'glitch-hover' : 'glitch-always';
  const baseClasses = 'text-white text-[clamp(2rem,10vw,8rem)] font-black relative mx-auto select-none cursor-pointer';

  return (
    <div style={inlineStyles} data-text={children} className={`${baseClasses} ${glitchClass} ${className}`}>
      {children}
    </div>
  );
};

export default GlitchText;

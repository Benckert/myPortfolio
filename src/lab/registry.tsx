import { lazy } from 'react';
import type { ComponentType } from 'react';
import SplitText from '@/components/reactbits/SplitText';
import BlurText from '@/components/reactbits/BlurText';
import DecryptedText from '@/components/reactbits/DecryptedText';
import GlitchText from '@/components/reactbits/GlitchText';
import GradientText from '@/components/reactbits/GradientText';
import ShinyText from '@/components/reactbits/ShinyText';
import ScrambledText from '@/components/reactbits/ScrambledText';
import TextType from '@/components/reactbits/TextType';
import RotatingText from '@/components/reactbits/RotatingText';

// Eager imports — no heavy WebGL deps (Waves: canvas only, DotGrid: gsap, Squares: canvas only)
import Waves from '@/components/reactbits/Waves';
import DotGrid from '@/components/reactbits/DotGrid';
import Squares from '@/components/reactbits/Squares';

// Lazy WebGL (ogl) — importing ogl keeps it out of the main bundle and out of
// the jsdom test run (registry[key] is truthy without loading ogl). All five are
// ogl-based; three.js backgrounds are deliberately excluded because @react-three/fiber's
// global JSX augmentation collapses React 19 intrinsic elements to `never` project-wide.
const Aurora = lazy(() => import('@/components/reactbits/Aurora'));
const Particles = lazy(() => import('@/components/reactbits/Particles'));
const Iridescence = lazy(() => import('@/components/reactbits/Iridescence'));
const LiquidChrome = lazy(() => import('@/components/reactbits/LiquidChrome'));
const Threads = lazy(() => import('@/components/reactbits/Threads'));

// Cards — all eager: TiltedCard uses motion/react, SpotlightCard uses React only,
// MagicBento uses gsap (gsap is exempt from lazy rule per project constraints),
// PixelCard uses canvas-2d only.
import TiltedCard from '@/components/reactbits/TiltedCard';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import MagicBento from '@/components/reactbits/MagicBento';
import PixelCard from '@/components/reactbits/PixelCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ShadcnCardDemo() {
  return (
    <Card className="w-64">
      <CardHeader><CardTitle>Realtime dashboard</CardTitle></CardHeader>
      <CardContent>Live metrics over WebSockets with an offline cache.</CardContent>
    </Card>
  );
}

// Maps a Variant.component string to a real React component.
// WebGL/heavy components are added via React.lazy and listed in lazyKeys.
export const registry: Record<string, ComponentType<any>> = {
  SplitText, BlurText, DecryptedText, GlitchText, GradientText,
  ShinyText, ScrambledText, TextType, RotatingText,
  Aurora, Particles, Iridescence, LiquidChrome, Waves, Threads, DotGrid, Squares,
  TiltedCard, SpotlightCard, MagicBento, PixelCard,
  ShadcnCard: ShadcnCardDemo,
};

// Keys whose components are lazy-loaded (WebGL/3D/physics). LibDemo wraps these in Suspense.
export const lazyKeys = new Set<string>(['Aurora', 'Particles', 'Iridescence', 'LiquidChrome', 'Threads']);

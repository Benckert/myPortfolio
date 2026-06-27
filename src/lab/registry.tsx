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

// Portraits (Family B) — ProfileCard is react-only (pointer/CSS holographic
// effect, no WebGL), so it loads eagerly like the other card treatments.
import ProfileCard from '@/components/reactbits/ProfileCard';

// Buttons (Family A) — all eager: shadcn Button is plain Tailwind, the three
// reactbits effects use only React/motion (no WebGL), so none need lazy loading.
import StarBorder from '@/components/reactbits/StarBorder';
import Magnet from '@/components/reactbits/Magnet';
import GlareHover from '@/components/reactbits/GlareHover';
import { Button } from '@/components/ui/button';

// Loaders (Family H) — shadcn Skeleton is pure Tailwind (animate-pulse), eager.
import { Skeleton } from '@/components/ui/skeleton';

// Glass (Family I) — both react-only (SVG-distortion / CSS glassmorphism, no WebGL), eager.
import GlassSurface from '@/components/reactbits/GlassSurface';
import GlassIcons from '@/components/reactbits/GlassIcons';

function ShadcnSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-56">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function ShadcnCardDemo() {
  return (
    <Card className="w-64">
      <CardHeader><CardTitle>Realtime dashboard</CardTitle></CardHeader>
      <CardContent>Live metrics over WebSockets with an offline cache.</CardContent>
    </Card>
  );
}

function ShadcnButton({ variant = 'default', children }: { variant?: string; children?: React.ReactNode }) {
  return <Button variant={variant as any}>{children ?? 'View work'}</Button>;
}

// Maps a Variant.component string to a real React component.
// WebGL/heavy components are added via React.lazy and listed in lazyKeys.
export const registry: Record<string, ComponentType<any>> = {
  SplitText, BlurText, DecryptedText, GlitchText, GradientText,
  ShinyText, ScrambledText, TextType, RotatingText,
  Aurora, Particles, Iridescence, LiquidChrome, Waves, Threads, DotGrid, Squares,
  TiltedCard, SpotlightCard, MagicBento, PixelCard,
  ShadcnCard: ShadcnCardDemo,
  ShadcnButton, StarBorder, Magnet, GlareHover,
  ProfileCard,
  ShadcnSkeleton,
  GlassSurface, GlassIcons,
};

// Keys whose components are lazy-loaded (WebGL/3D/physics). LibDemo wraps these in Suspense.
export const lazyKeys = new Set<string>(['Aurora', 'Particles', 'Iridescence', 'LiquidChrome', 'Threads']);

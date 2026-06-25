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

// Maps a Variant.component string to a real React component.
// WebGL/heavy components are added via React.lazy and listed in lazyKeys.
export const registry: Record<string, ComponentType<any>> = {
  SplitText, BlurText, DecryptedText, GlitchText, GradientText,
  ShinyText, ScrambledText, TextType, RotatingText,
};

// Keys whose components are lazy-loaded (WebGL/3D/physics). LibDemo wraps these in Suspense.
export const lazyKeys = new Set<string>();
